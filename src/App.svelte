<script lang="ts">
  import { onMount } from 'svelte'
  import Notifications from './components/Notifications.svelte'
  import { saveSaveGame, resetSaveGame, exportSaveGame, importSaveGame } from './gamelogic/saveload'
  import { devToolsEnabled, LORCA_OVERRIDE, unlocked } from './stores/mainStore'
  import DevTools from './components/DevTools.svelte'
  import ToggleUnlocks from './components/ToggleUnlocks.svelte'
  import ThoughtComponent from './components/ThoughtComponent.svelte'
  import CheeseComponent from './components/CheeseComponent.svelte'
  import MoldyCheeseComponent from './components/MoldyCheeseComponent.svelte'
  import CheeseyardComponent from './components/CheeseyardComponent.svelte'
  import MilkComponent from './components/MilkComponent.svelte'
  import MilkTreeComponent from './components/MilkTreeComponent.svelte'
  import { easeInOutQuad, easeInOutSine } from './gamelogic/utils'

  console.log('App.svelte')
  let secretImage: HTMLElement
  let background: HTMLElement
  let gameWindow: HTMLElement
  let dragWindow: HTMLElement | null = null

  // for moving with mouse:
  let offsetX: number, offsetY: number
  let clickedAtX: number, clickedAtY: number
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

  let unlockTogglesShown = false
  let isDarkMode: boolean

  onMount(() => {
    returnToHome()
    background.style.backgroundPositionX = '0px'
    background.style.backgroundPositionY = '0px'

    // checks if dark mode is enabled in the browser:
    isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    // sets the correct theme on the root (html) tag:
    window.document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')

    // return false if key is 'Enter'
    // window.document.onkeydown = (e: KeyboardEvent) => e.key !== 'Enter'

    window.document.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'f') $LORCA_OVERRIDE = !$LORCA_OVERRIDE
      if (e.key === 'g') $devToolsEnabled = !$devToolsEnabled
      if (e.key === 'u') unlockTogglesShown = !unlockTogglesShown
    })
    window.document.addEventListener('keydown', (e: KeyboardEvent) => {
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
    })
    window.document.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && movingTo.right) movingTo.right = false
      if (e.key === 'ArrowLeft' && movingTo.left) movingTo.left = false
      if (e.key === 'ArrowUp' && movingTo.top) movingTo.top = false
      if (e.key === 'ArrowDown' && movingTo.bottom) movingTo.bottom = false

      if (Object.values(movingTo).every(v => v === false)) isMoving = false
    })

    // drag the entire game window around freely:
    window.document.onmousedown = function (e: MouseEvent): void {
      // keep eg. sliders draggable without moving the window
      if ((e.target as HTMLElement).classList.contains('draggable')) return
      movingWithMouse = true
      dragWindow = gameWindow
      clickedAtX = e.pageX
      clickedAtY = e.pageY
      offsetX = clickedAtX - gameWindow.offsetLeft
      offsetY = clickedAtY - gameWindow.offsetTop
      clickedAtBackgroundPosX = parseInt(background.style.backgroundPositionX)
      clickedAtBackgroundPosY = parseInt(background.style.backgroundPositionY)
      clickedAtSecretImagePosX = parseInt(secretImage.style.left)
      clickedAtSecretImagePosY = parseInt(secretImage.style.top)
    }
    window.document.onmousemove = function (e: MouseEvent): void {
      if (dragWindow === null) return
      dragWindow.style.left = e.pageX - offsetX + 'px'
      dragWindow.style.top = e.pageY - offsetY + 'px'

      background.style.backgroundPositionX =
        clickedAtBackgroundPosX + (e.pageX - clickedAtX) * backgroundParallaxRatio + 'px'
      background.style.backgroundPositionY =
        clickedAtBackgroundPosY + (e.pageY - clickedAtY) * backgroundParallaxRatio + 'px'

      secretImage.style.left = clickedAtSecretImagePosX + (e.pageX - clickedAtX) * backgroundParallaxRatio + 'px'
      secretImage.style.top = clickedAtSecretImagePosY + (e.pageY - clickedAtY) * backgroundParallaxRatio + 'px'
    }
    window.document.onmouseup = function (): void {
      movingWithMouse = false
      dragWindow = null
    }
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

  function returnToHome(): void {
    const homeComponent = gameWindow.querySelector('#thoughtComponent')
    if (homeComponent !== null) {
      const gameRect = gameWindow.getBoundingClientRect()
      const homeRect = homeComponent.getBoundingClientRect()
      const offset = {
        left: homeRect.left - gameRect.left,
        top: homeRect.top - gameRect.top,
      }

      const beforeX = gameWindow.offsetLeft
      const beforeY = gameWindow.offsetTop
      gameWindow.style.left = `calc(50% - ${homeRect.width / 2 + offset.left}px)`
      gameWindow.style.top = `calc(50% - ${homeRect.height / 2 + offset.top}px)`
      const afterX = gameWindow.offsetLeft
      const afterY = gameWindow.offsetTop

      background.style.backgroundPositionX =
        parseInt(background.style.backgroundPositionX) + (afterX - beforeX) * backgroundParallaxRatio + 'px'
      background.style.backgroundPositionY =
        parseInt(background.style.backgroundPositionY) + (afterY - beforeY) * backgroundParallaxRatio + 'px'
      secretImage.style.left = parseInt(secretImage.style.left) + (afterX - beforeX) * backgroundParallaxRatio + 'px'
      secretImage.style.top = parseInt(secretImage.style.top) + (afterY - beforeY) * backgroundParallaxRatio + 'px'
    }
  }

  function switchTheme(): void {
    isDarkMode = !isDarkMode
    window.document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }

  let saveDataString: string
  function handleExport(): void {
    saveDataString = exportSaveGame()
  }
  function handleImport(): void {
    if (saveDataString !== null) importSaveGame(saveDataString)
  }
  function showCredits(): void {
    console.log('TODO Credit Modal')
    // Background: https://www.svgbackgrounds.com/
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
    <button on:click={switchTheme}>Theme: {isDarkMode ? 'Dark' : 'Light'}</button>
    <button on:click={returnToHome}>Home</button>
    <input type="string" bind:value={saveDataString} />
    <button on:click={handleExport}>Export</button>
    <button on:click={handleImport}>Import</button>
    <button on:click={saveSaveGame}>Save</button>
    <button on:click={resetSaveGame}>Reset</button>
    <button on:click={showCredits}>Credits</button>
  </div>

  <div id="display" bind:this={background}>
    <img
      src="assets/thonk.png"
      alt="thonk"
      draggable="false"
      style="position: absolute; left: -1500px; top: -800px; scale: 0.25"
      bind:this={secretImage}
    />
    <div id="game" bind:this={gameWindow}>
      <div id="thoughtComponent"><ThoughtComponent /></div>
      {#if $unlocked.switzerland || $LORCA_OVERRIDE}
        <div id="cheeseComponent"><CheeseComponent /></div>
      {/if}
      {#if $unlocked.moldyCheese || $LORCA_OVERRIDE}
        <div id="moldyCheeseComponent"><MoldyCheeseComponent /></div>
      {/if}
      {#if $unlocked.cheeseyard || $LORCA_OVERRIDE}
        <div id="cheeseyardComponent"><CheeseyardComponent /></div>
      {/if}
      <!--{#if $unlocked.milk || $LORCA_OVERRIDE}
        <div id="milkComponent"><MilkComponent /></div>
      {/if}
      {#if true || $LORCA_OVERRIDE}
        <div id="milkTreeComponent"><MilkTreeComponent /></div>
      {/if} -->

      <!--<Log/>-->

      <!--  <RandomIdea/> -->
    </div>
  </div>
</main>

<style>
  * {
    --x0: 2; /* Column of home*/
    --y0: 1; /* Row of home*/
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
    background: url('/assets/endless-constellation.svg');
    /* background-color: var(--background-color); */
  }
  /* #game {
    position: absolute;
    display: flex;
    align-items: flex-start;
    gap: var(--window-gap);
  } */
  #game {
    position: absolute;
    display: grid;
    /* grid-template-columns: repeat(5, auto);
    grid-template-rows: repeat(5, auto); */
    gap: var(--window-gap);
  }
  #thoughtComponent {
    grid-row-start: var(--y0);
    grid-column-start: var(--x0);
  }
  #cheeseComponent {
    grid-row-start: var(--y0);
    grid-column-start: calc(var(--x0) + 1);
  }
  #moldyCheeseComponent {
    grid-row-start: calc(var(--y0) + 1);
    grid-column-start: calc(var(--x0) + 1);
  }
  #cheeseyardComponent {
    grid-row-start: calc(var(--y0) + 1);
    grid-column-start: var(--x0);
  }
  #milkComponent {
    grid-row-start: var(--y0);
    grid-column-start: calc(var(--x0) - 1);
  }
  #milkTreeComponent {
    grid-row-start: calc(var(--y0) - 1);
    grid-column-start: calc(var(--x0) - 1);
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
