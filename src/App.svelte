<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import Notifications from './components/misc/Notifications.svelte'
  import { saveSaveGame, resetSaveGame, exportSaveGame, importSaveGame } from '@gamelogic/saveload'
  import {
    initWindow,
    keysDisabled,
    panToWindow,
    resetWindowLayout,
    selectWindow,
    setAllWindowLocations,
    updateWindowLocation,
    updateWindowStacking,
  } from '@gamelogic/window-manager'
  import { ADMIN_MODE, devToolsEnabled, isDarkMode, LORCA_OVERRIDE, unlocked, WindowId, currentNotation } from '@store'
  import DevTools from './components/dev/DevTools.svelte'
  import ToggleUnlocks from './components/dev/ToggleUnlocks.svelte'

  import ThoughtComponent from './components/game-windows/ThoughtComponent.svelte'
  import CheeseComponent from './components/game-windows/CheeseComponent.svelte'
  import MoldyCheeseComponent from './components/game-windows/MoldyCheeseComponent.svelte'
  import CheeseyardComponent from './components/game-windows/CheeseyardComponent.svelte'
  import MilkComponent from './components/game-windows/MilkComponent.svelte'
  import MilkTreeComponent from './components/game-windows/MilkTreeComponent.svelte'
  import { getOffset } from '@gamelogic/utils'
  import MilkTreeComponentCopy from './components/game-windows/MilkTreeComponentCopy.svelte'

  let unlockTogglesShown = false

  let secretImage: HTMLElement
  let background: HTMLElement
  let gameWindow: HTMLElement
  let dragWindow: HTMLElement | null = null
  let windowContainer: HTMLElement | null = null

  // for moving with mouse:
  let clickedAtX: number, clickedAtY: number
  let clickedAtWindowPosX: number, clickedAtWindowPosY: number

  let clickedAtBackgroundPosX: number, clickedAtBackgroundPosY: number
  let clickedAtSecretImagePosX: number, clickedAtSecretImagePosY: number

  // for moving with arrow keys:
  let gameWindowLeftInitial: number, gameWindowTopInitial: number
  let backgroundPosXInitial: number, backgroundPosYInitial: number
  let secretImageLeftInitial: number, secretImageTopInitial: number

  // how much slower the background moves compared to the game window
  const backgroundParallaxRatio = 1 / 8
  const movingTo = {
    right: false,
    left: false,
    top: false,
    bottom: false,
  }
  let movingWithMouse = false
  let isMoving = false
  const startTime: Record<string, number | null> = {
    xLeft: null,
    xRight: null,
    yUp: null,
    yDown: null,
  }

  function onKeyPress(e: KeyboardEvent): void {
    if (!$ADMIN_MODE) return
    if (e.key === 'f') $LORCA_OVERRIDE = !$LORCA_OVERRIDE
    if (e.key === 'g') $devToolsEnabled = !$devToolsEnabled
    if (e.key === 'u') unlockTogglesShown = !unlockTogglesShown
  }
  function onKeyDown(e: KeyboardEvent): void {
    if ($keysDisabled) return
    if (e.key === 'ArrowRight' && !movingTo.right) movingTo.right = true
    if (e.key === 'ArrowLeft' && !movingTo.left) movingTo.left = true
    if (e.key === 'ArrowUp' && !movingTo.top) movingTo.top = true
    if (e.key === 'ArrowDown' && !movingTo.bottom) movingTo.bottom = true

    if (Object.values(movingTo).includes(true) && !isMoving) {
      isMoving = true
      startTime.xLeft = null
      startTime.xRight = null
      startTime.yUp = null
      startTime.yDown = null
      requestAnimationFrame(moveWindow)
    }
  }
  function onKeyUp(e: KeyboardEvent): void {
    if ($keysDisabled) return
    if (e.key === 'ArrowRight' && movingTo.right) movingTo.right = false
    if (e.key === 'ArrowLeft' && movingTo.left) movingTo.left = false
    if (e.key === 'ArrowUp' && movingTo.top) movingTo.top = false
    if (e.key === 'ArrowDown' && movingTo.bottom) movingTo.bottom = false

    if (Object.values(movingTo).every(v => v === false)) isMoving = false
  }
  function onMouseDown(e: MouseEvent): void {
    if (!(e.target instanceof HTMLElement)) return

    // handle individual windows able to be dragged over the screen:
    if (e.target.classList.contains('window-bar')) {
      windowContainer = e.target.parentElement?.parentElement ?? null // ugly...
      e.target.style.cursor = 'grab'
      return
    }
    // keep eg. sliders draggable without moving the window
    if (e.target.classList.contains('draggable')) return

    // drag the entire game window around freely:
    movingWithMouse = true
    dragWindow = gameWindow

    clickedAtX = e.pageX
    clickedAtY = e.pageY
    clickedAtWindowPosX = getOffset(dragWindow).left
    clickedAtWindowPosY = getOffset(dragWindow).top
    clickedAtBackgroundPosX = parseInt(background.style.backgroundPositionX)
    clickedAtBackgroundPosY = parseInt(background.style.backgroundPositionY)
    clickedAtSecretImagePosX = parseInt(secretImage.style.left)
    clickedAtSecretImagePosY = parseInt(secretImage.style.top)
  }
  function onMouseMove(e: MouseEvent): void {
    if (windowContainer !== null) {
      windowContainer.style.left = windowContainer.offsetLeft + e.movementX + 'px'
      windowContainer.style.top = windowContainer.offsetTop + e.movementY + 'px'
      return
    }
    if (dragWindow === null) return

    dragWindow.style.left = clickedAtWindowPosX + (e.pageX - clickedAtX) + 'px'
    dragWindow.style.top = clickedAtWindowPosY + (e.pageY - clickedAtY) + 'px'

    background.style.backgroundPositionX =
      clickedAtBackgroundPosX + (e.pageX - clickedAtX) * backgroundParallaxRatio + 'px'
    background.style.backgroundPositionY =
      clickedAtBackgroundPosY + (e.pageY - clickedAtY) * backgroundParallaxRatio + 'px'
    secretImage.style.left = clickedAtSecretImagePosX + (e.pageX - clickedAtX) * backgroundParallaxRatio + 'px'
    secretImage.style.top = clickedAtSecretImagePosY + (e.pageY - clickedAtY) * backgroundParallaxRatio + 'px'
  }
  function onMouseUp(e: MouseEvent): void {
    if (windowContainer !== null) {
      if (e.target instanceof HTMLElement && e.target.classList.contains('window-bar')) {
        e.target.style.cursor = 'pointer'
      }
      updateWindowLocation(windowContainer)
      windowContainer = null
    }
    movingWithMouse = false
    dragWindow = null
  }

  onMount(() => {
    updateWindowStacking(gameWindow)
    setAllWindowLocations()
    panToWindow(WindowId.thoughtComponent)
    background.style.backgroundPositionX = '0px'
    background.style.backgroundPositionY = '0px'

    // checks if dark mode is enabled in the browser:
    if ($isDarkMode === 'notChecked') {
      $isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()

    // return false if key is 'Enter'
    // window.document.onkeydown = (e: KeyboardEvent) => e.key !== 'Enter'

    window.document.addEventListener('keypress', onKeyPress)
    window.document.addEventListener('keydown', onKeyDown)
    window.document.addEventListener('keyup', onKeyUp)

    window.document.addEventListener('mousedown', onMouseDown)
    window.document.addEventListener('mousemove', onMouseMove)
    window.document.addEventListener('mouseup', onMouseUp)
  })

  onDestroy(() => {
    // idk if this is neccessary...
    window.document.removeEventListener('keypress', onKeyPress)
    window.document.removeEventListener('keydown', onKeyDown)
    window.document.removeEventListener('keyup', onKeyUp)

    window.document.removeEventListener('mousedown', onMouseDown)
    window.document.removeEventListener('mousemove', onMouseMove)
    window.document.removeEventListener('mouseup', onMouseUp)
  })

  function resetInitialPositionsX(): void {
    gameWindowLeftInitial = gameWindow.offsetLeft
    secretImageLeftInitial = secretImage.offsetLeft
    backgroundPosXInitial = parseInt(background.style.backgroundPositionX)
  }
  function resetInitialPositionsY(): void {
    gameWindowTopInitial = gameWindow.offsetTop
    secretImageTopInitial = secretImage.offsetTop
    backgroundPosYInitial = parseInt(background.style.backgroundPositionY)
  }

  function moveWindow(currentTime: number): void {
    if (movingWithMouse) return

    if (movingTo.right && !movingTo.left) {
      if (startTime.xRight === null) {
        resetInitialPositionsX()
        startTime.xRight = currentTime
      }
      const elapsed = currentTime - startTime.xRight
      gameWindow.style.left = gameWindowLeftInitial - 1 * elapsed + 'px'
      secretImage.style.left = secretImageLeftInitial - backgroundParallaxRatio * elapsed + 'px'
      background.style.backgroundPositionX = backgroundPosXInitial - backgroundParallaxRatio * elapsed + 'px'
    } else {
      startTime.xRight = null
    }

    if (movingTo.left && !movingTo.right) {
      if (startTime.xLeft === null) {
        resetInitialPositionsX()
        startTime.xLeft = currentTime
      }
      const elapsed = currentTime - startTime.xLeft
      gameWindow.style.left = gameWindowLeftInitial + 1 * elapsed + 'px'
      secretImage.style.left = secretImageLeftInitial + backgroundParallaxRatio * elapsed + 'px'
      background.style.backgroundPositionX = backgroundPosXInitial + backgroundParallaxRatio * elapsed + 'px'
    } else {
      startTime.xLeft = null
    }

    if (movingTo.top && !movingTo.bottom) {
      if (startTime.yUp === null) {
        resetInitialPositionsY()
        startTime.yUp = currentTime
      }
      const elapsed = currentTime - startTime.yUp
      gameWindow.style.top = gameWindowTopInitial + 1 * elapsed + 'px'
      secretImage.style.top = secretImageTopInitial + backgroundParallaxRatio * elapsed + 'px'
      background.style.backgroundPositionY = backgroundPosYInitial + backgroundParallaxRatio * elapsed + 'px'
    } else {
      startTime.yUp = null
    }

    if (movingTo.bottom && !movingTo.top) {
      if (startTime.yDown === null) {
        resetInitialPositionsY()
        startTime.yDown = currentTime
      }
      const elapsed = currentTime - startTime.yDown
      gameWindow.style.top = gameWindowTopInitial - 1 * elapsed + 'px'
      secretImage.style.top = secretImageTopInitial - backgroundParallaxRatio * elapsed + 'px'
      background.style.backgroundPositionY = backgroundPosYInitial - backgroundParallaxRatio * elapsed + 'px'
    } else {
      startTime.yDown = null
    }

    if (isMoving) requestAnimationFrame(moveWindow)
  }

  function switchTheme(): void {
    $isDarkMode = !$isDarkMode
    applyTheme()
  }
  /**  Sets the correct theme on the root (html) tag. */
  function applyTheme(): void {
    window.document.documentElement.setAttribute('data-theme', $isDarkMode ? 'dark' : 'light')
  }

  let saveDataString: string
  function handleExport(): void {
    saveDataString = exportSaveGame()
  }
  function handleImport(): void {
    // ideally check if saveDataString is of type SaveData
    if (saveDataString !== null) importSaveGame(saveDataString)
  }
  function showCredits(): void {
    console.log('TODO Credit Modal')
    // Background: https://www.svgbackgrounds.com/
  }

  function changeNotation(): void {
    if ($currentNotation === 'scientific') $currentNotation = 'default'
    else if ($currentNotation === 'default') $currentNotation = 'letters'
    else $currentNotation = 'scientific'
  }
</script>

<main>
  <DevTools />
  {#if unlockTogglesShown}
    <ToggleUnlocks />
  {/if}
  <!-- Add the Notifications component so messages appear on every page -->
  <Notifications />

  <div id="saveload">
    <button on:click={changeNotation}>Notation: {$currentNotation}</button>
    <button on:click={resetWindowLayout}>Layout Reset</button>
    <button on:click={switchTheme}>Theme: {$isDarkMode ? 'Dark' : 'Light'}</button>
    <button on:click={() => panToWindow(WindowId.thoughtComponent)}>Home</button>
    <input type="string" bind:value={saveDataString} />
    <button on:click={handleExport}>Export</button>
    <button on:click={handleImport}>Import</button>
    <button on:click={saveSaveGame}>Save</button>
    <button on:click={resetSaveGame}>Reset</button>
    <!-- <button on:click={showCredits}>Credits</button> -->
  </div>

  <div id="display" bind:this={background}>
    <img
      id="secretImage"
      src="assets/thonk.png"
      alt="thonk"
      draggable="false"
      style="position: absolute; left: -800px; top: -500px; scale: 0.25"
      bind:this={secretImage}
    />

    <div id="game" bind:this={gameWindow}>
      <div
        id={WindowId.thoughtComponent}
        on:mousedown={() => selectWindow(WindowId.thoughtComponent, gameWindow)}
        use:initWindow
      >
        <ThoughtComponent windowId={WindowId.thoughtComponent} />
      </div>
      {#if $unlocked.switzerland || $LORCA_OVERRIDE}
        <div
          id={WindowId.cheeseComponent}
          on:mousedown={() => selectWindow(WindowId.cheeseComponent, gameWindow)}
          use:initWindow
        >
          <CheeseComponent windowId={WindowId.cheeseComponent} />
        </div>
      {/if}
      {#if $unlocked.moldyCheese || $LORCA_OVERRIDE}
        <div
          id={WindowId.moldyCheeseComponent}
          on:mousedown={() => selectWindow(WindowId.moldyCheeseComponent, gameWindow)}
          use:initWindow
        >
          <MoldyCheeseComponent windowId={WindowId.moldyCheeseComponent} />
        </div>
      {/if}
      {#if $unlocked.cheeseyard || $LORCA_OVERRIDE}
        <div
          id={WindowId.cheeseyardComponent}
          on:mousedown={() => selectWindow(WindowId.cheeseyardComponent, gameWindow)}
          use:initWindow
        >
          <CheeseyardComponent windowId={WindowId.cheeseyardComponent} />
        </div>
      {/if}
      {#if $unlocked.milk || $LORCA_OVERRIDE}
        <div
          id={WindowId.milkComponent}
          on:mousedown={() => selectWindow(WindowId.milkComponent, gameWindow)}
          use:initWindow
        >
          <MilkComponent windowId={WindowId.milkComponent} />
        </div>
      {/if}
      {#if $unlocked.milkTree || $LORCA_OVERRIDE}
        <div
          id={WindowId.milkTreeComponent}
          on:mousedown={() => selectWindow(WindowId.milkTreeComponent, gameWindow)}
          use:initWindow
        >
          <MilkTreeComponent windowId={WindowId.milkTreeComponent} />
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  * {
    --x0: 2; /* Column of home*/
    --y0: 2; /* Row of home*/
  }

  #display {
    position: fixed;
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background: url('/cogito-cosmos/assets/endless-constellation.svg'), url('/assets/endless-constellation.svg');
    /* background-color: var(--background-color); */
  }
  #game {
    position: absolute; /** also resets positioning of child elements just like relative! */
    /* display: grid;
    gap: var(--window-gap); */
  }
  #thoughtComponent {
    position: absolute;
    /* top: 0px;
    left: 0px; */
    /* grid-row-start: var(--y0);
    grid-column-start: var(--x0); */
  }
  #cheeseComponent {
    position: absolute;
    /* top: 0px;
    left: 600px; */
    /* grid-row-start: var(--y0);
    grid-column-start: calc(var(--x0) + 1); */
  }
  #moldyCheeseComponent {
    position: absolute;
    /* top: 600px;
    left: 600px; */
    /* grid-row-start: var(--y0);
    grid-column-start: calc(var(--x0) + 2); */
  }
  #cheeseyardComponent {
    position: absolute;
    /* top: 600px;
    left: 0px; */
    /* grid-row-start: var(--y0);
    grid-column-start: calc(var(--x0) + 3); */
  }
  #milkComponent {
    position: absolute;
    /* top: -300px;
    left: 0px; */
    /* grid-row-start: calc(var(--y0) - 1);
    grid-column-start: calc(var(--x0)); */
  }
  #milkTreeComponent {
    position: absolute;
    /* grid-row-start: calc(var(--y0) - 1);
    grid-column-start: calc(var(--x0) - 1); */
  }

  #saveload {
    position: fixed;
    z-index: 10;
    top: 0;
    right: 0;
    display: flex;
    gap: 0;
  }
</style>
