<script lang="ts">
  import { onMount } from 'svelte'
  import Notifications from './components/Notifications.svelte'
  import { saveSaveGame, resetSaveGame, exportSaveGame, importSaveGame } from './gamelogic/saveload'
  import { devToolsEnabled, LORCA_OVERRIDE, unlocked } from './stores/mainStore'
  import DevTools from './components/DevTools.svelte'
  import ThoughtComponent from './components/ThoughtComponent.svelte'
  import CheeseComponent from './components/CheeseComponent.svelte'
  import MoldyCheeseComponent from './components/MoldyCheeseComponent.svelte'
  import CheeseyardComponent from './components/CheeseyardComponent.svelte'
  import MilkComponent from './components/MilkComponent.svelte'

  console.log('App.svelte')

  let gameWindow: HTMLElement
  let dragWindow: HTMLElement | null = null
  let offsetX: number, offsetY: number

  const movingTo = {
    right: false,
    left: false,
    top: false,
    bottom: false,
  }
  let isMoving = false
  let lastTime: number | null

  onMount(() => {
    // return false if key is 'Enter'
    // window.document.onkeydown = (e: KeyboardEvent) => e.key !== 'Enter'

    window.document.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'f') $LORCA_OVERRIDE = !$LORCA_OVERRIDE
      if (e.key === 'g') $devToolsEnabled = !$devToolsEnabled
      // console.log(e.key)
    })
    window.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !movingTo.right) movingTo.right = true
      if (e.key === 'ArrowLeft' && !movingTo.left) movingTo.left = true
      if (e.key === 'ArrowUp' && !movingTo.top) movingTo.top = true
      if (e.key === 'ArrowDown' && !movingTo.bottom) movingTo.bottom = true

      if (Object.values(movingTo).includes(true) && !isMoving) {
        isMoving = true
        lastTime = null
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
      // keep eg sliders draggable
      if ((e.target as HTMLElement).classList.contains('draggable')) return
      dragWindow = gameWindow
      offsetX = e.pageX - gameWindow.offsetLeft
      offsetY = e.pageY - gameWindow.offsetTop
    }
    window.document.onmousemove = function (e: MouseEvent): void {
      if (dragWindow === null) return
      dragWindow.style.left = e.pageX - offsetX + 'px'
      dragWindow.style.top = e.pageY - offsetY + 'px'
    }
    window.document.onmouseup = function (): void {
      dragWindow = null
    }
  })

  function moveWindow(currentTime: number): void {
    if (lastTime === null) lastTime = currentTime
    const deltaTimeMillis = Math.max(Math.min(currentTime - lastTime, 1000), 0)
    lastTime = currentTime

    const left = parseInt(gameWindow.style.left)
    const top = parseInt(gameWindow.style.top)
    if (movingTo.right && !movingTo.left) gameWindow.style.left = left - 1 * deltaTimeMillis + 'px'
    if (movingTo.left && !movingTo.right) gameWindow.style.left = left + 1 * deltaTimeMillis + 'px'
    if (movingTo.top && !movingTo.bottom) gameWindow.style.top = top + 1 * deltaTimeMillis + 'px'
    if (movingTo.bottom && !movingTo.top) gameWindow.style.top = top - 1 * deltaTimeMillis + 'px'

    if (isMoving) requestAnimationFrame(moveWindow)
  }

  function returnToHome(): void {
    const homeComponent = gameWindow.querySelector('#thoughtComponent')
    if (homeComponent !== null) {
      const gridRect = gameWindow.getBoundingClientRect()
      const rect = homeComponent.getBoundingClientRect()
      const offset = {
        left: rect.left - gridRect.left,
        top: rect.top - gridRect.top,
      }
      console.log(gridRect, rect, offset)
      gameWindow.style.left = `calc(50% - ${rect.width / 2 + offset.left}px)`
      gameWindow.style.top = `calc(50% - ${rect.height / 2 + offset.top}px`
    }
  }

  let saveDataString: string
  function handleExport(): void {
    saveDataString = exportSaveGame()
  }
  function handleImport(): void {
    if (saveDataString !== null) importSaveGame(saveDataString)
  }
</script>

<main>
  <DevTools />
  <!-- Add the Notifications component so messages appear on every page -->
  <Notifications />

  <div id="saveload">
    <button on:click={returnToHome}>Home</button>
    <input type="string" bind:value={saveDataString} />
    <button on:click={handleExport}>Export</button>
    <button on:click={handleImport}>Import</button>
    <button on:click={saveSaveGame}>Save</button>
    <button on:click={resetSaveGame}>Reset</button>
  </div>

  <div id="display">
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
      {#if $unlocked.milk || true}
        <div id="milkComponent"><MilkComponent /></div>
      {/if}

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
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  /* #game {
    position: absolute;
    display: flex;
    align-items: flex-start;
    gap: var(--grid-gap);
  } */
  #game {
    position: absolute;
    display: grid;
    /* grid-template-columns: repeat(5, auto);
    grid-template-rows: repeat(5, auto); */
    gap: var(--grid-gap);
  }
  #thoughtComponent {
    grid-row-start: var(--y0);
    grid-column-start: var(--x0);
  }
  #cheeseComponent {
    display: flex;
    gap: var(--grid-gap);
    grid-row-start: var(--y0);
    grid-column-start: calc(var(--x0) + 1);
    grid-column-end: calc(var(--x0) + 3);
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

  #saveload {
    position: fixed;
    z-index: 1;
    top: 0rem;
    right: 0rem;
  }
  #saveload button {
    margin: 0;
    padding: 0.25rem;
  }
  #saveload button:hover {
    color: var(--primary);
  }
</style>
