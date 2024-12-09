import { WindowId, windowStack, windowLocations, windowMinimized } from '@store'
import { get, writable } from 'svelte/store'

export const keysDisabled = writable(false)

export function updateWindowStacking(gameWindow: HTMLElement): void {
  if (gameWindow === undefined) return
  Object.values(gameWindow.children).forEach((window: HTMLElement) => {
    window.style.zIndex = get(windowStack)
      .indexOf(window.id as WindowId)
      .toString()
  })
}

/** Updates the stacking (z-index) of the windows when selecting/dragging one */
export function selectWindow(id: WindowId | undefined, gameWindow: HTMLElement): void {
  if (id === undefined) return
  const selectedIndex = get(windowStack).indexOf(id)
  if (selectedIndex === get(windowStack).length - 1) return
  windowStack.update($windowStack => {
    $windowStack.push(id)
    $windowStack.splice(selectedIndex, 1)
    return $windowStack
  })

  updateWindowStacking(gameWindow)
}

export function setAllWindowLocations(): void {
  const gameWindow = window.document.querySelector(`#game`)
  if (!(gameWindow instanceof HTMLElement)) return
  Object.values(gameWindow.children).forEach((window: HTMLElement) => {
    setWindowLocation(window)
  })
}
export function setWindowLocation(window: HTMLElement): void {
  const { x, y } = get(windowLocations)[window.id]
  if (x === undefined || y === undefined) return
  window.style.left = `${x as number}px`
  window.style.top = `${y as number}px`
}
export function initWindow(window: HTMLElement): void {
  /* console.log('init', window.id) */
  setWindowLocation(window)
  // if new window, it gets pushed to the top of the stack:
  if (!get(windowStack).includes(window.id as WindowId)) {
    windowStack.update($windowStack => {
      $windowStack.push(window.id as WindowId)
      return $windowStack
    })
    panToWindow(window.id as WindowId, false)
  }
  window.style.zIndex = get(windowStack)
    .indexOf(window.id as WindowId)
    .toString()
}
export function resetWindowLayout(): void {
  windowLocations.reset()
  setAllWindowLocations()
  maximizeAllWindows()
  panToWindow(WindowId.thoughtComponent)
}
export function maximizeAllWindows(): void {
  windowMinimized.update($windowMinimized => {
    Object.keys($windowMinimized).forEach((id: WindowId) => {
      $windowMinimized[id] = false
    })
    return $windowMinimized
  })
}
export function updateWindowLocation(window: HTMLElement | null): void {
  if (window === null) return
  if (window.id === undefined) return
  windowLocations.update($windowLocations => {
    $windowLocations[window.id] = { x: window.offsetLeft, y: window.offsetTop }
    return $windowLocations
  })
}

let panToWindowAnimId: number
export function panToWindow(windowId: WindowId, jump = true): void {
  const gameWindow = window.document.querySelector(`#game`)
  if (!(gameWindow instanceof HTMLElement)) return

  const Window = gameWindow.querySelector(`#${windowId}`)
  const background = window.document.querySelector('#display')
  const secretImage = window.document.querySelector('#secretImage')

  if (!(Window instanceof HTMLElement) || !(background instanceof HTMLElement) || !(secretImage instanceof HTMLElement))
    return

  const windowRect = Window.getBoundingClientRect()
  const gameRect = gameWindow.getBoundingClientRect()
  const offset = {
    left: windowRect.left - gameRect.left,
    top: windowRect.top - gameRect.top,
  }
  const browserWindowWidth = pickFirstPositiveNumber(
    window.innerWidth,
    document.documentElement.clientWidth,
    document.body.clientWidth
  )
  const browserWindowHeight = pickFirstPositiveNumber(
    window.innerHeight,
    document.documentElement.clientHeight,
    document.body.clientHeight
  )

  const destinationX = (browserWindowWidth - windowRect.width) / 2 - offset.left
  const destinationY = (browserWindowHeight - windowRect.height) / 2 - offset.top

  const translationX = destinationX - gameRect.left
  const translationY = destinationY - gameRect.top

  const startX = gameRect.left
  const startY = gameRect.top

  const backgroundStartX = parseFloat(background.style.backgroundPositionX)
  const backgroundStartY = parseFloat(background.style.backgroundPositionY)

  secretImage.style.left = `${parseFloat(secretImage.style.left) + translationX * backgroundParallaxRatio}px`
  secretImage.style.top = `${parseFloat(secretImage.style.top) + translationY * backgroundParallaxRatio}px`
  if (jump) {
    gameWindow.style.left = `${destinationX}px`
    gameWindow.style.top = `${destinationY}px`
    background.style.backgroundPositionX = `${
      parseFloat(background.style.backgroundPositionX) + translationX * backgroundParallaxRatio
    }px`
    background.style.backgroundPositionY = `${
      parseFloat(background.style.backgroundPositionY) + translationY * backgroundParallaxRatio
    }px`
    return
  }

  const translationVecLen = Math.sqrt(translationX * translationX + translationY * translationY)
  const translationXNormalized = translationX / translationVecLen
  const translationYNormalized = translationY / translationVecLen

  cancelAnimationFrame(panToWindowAnimId)

  keysDisabled.set(true)
  panToWindowAnimId = requestAnimationFrame((currentTime: number) => {
    animatePanningToWindow(
      currentTime,
      translationXNormalized,
      translationYNormalized,
      translationVecLen,
      startX,
      startY,
      backgroundStartX,
      backgroundStartY,
      gameWindow,
      background
    )
  })
}

let lastTimePanning: number | null = null
let panningDistance = 0
// how much slower the background moves compared to the game window
const backgroundParallaxRatio = 1 / 8

function animatePanningToWindow(
  currentTime: number,
  eX: number,
  eY: number,
  translationDistance: number,
  startX: number,
  startY: number,
  backgroundStartX: number,
  backgroundStartY: number,
  gameWindow: HTMLElement,
  background: HTMLElement
): void {
  if (lastTimePanning === null) {
    lastTimePanning = currentTime
  }
  const deltaTimeMillis = Math.max(Math.min(currentTime - lastTimePanning), 0)
  lastTimePanning = currentTime
  panningDistance += 0.5 * deltaTimeMillis

  gameWindow.style.left = `${startX + eX * panningDistance}px`
  gameWindow.style.top = `${startY + eY * panningDistance}px`
  background.style.backgroundPositionX = `${backgroundStartX + eX * panningDistance * backgroundParallaxRatio}px`
  background.style.backgroundPositionY = `${backgroundStartY + eY * panningDistance * backgroundParallaxRatio}px`

  if (panningDistance < translationDistance) {
    panToWindowAnimId = requestAnimationFrame((currentTime: number) => {
      animatePanningToWindow(
        currentTime,
        eX,
        eY,
        translationDistance,
        startX,
        startY,
        backgroundStartX,
        backgroundStartY,
        gameWindow,
        background
      )
    })
  } else {
    lastTimePanning = null
    panningDistance = 0
    keysDisabled.set(false)
  }
}

function pickFirstPositiveNumber(...nums: unknown[]): number {
  for (const num of nums) {
    if (typeof num === 'number' && num > 0) return num
  }
  return 0
}
