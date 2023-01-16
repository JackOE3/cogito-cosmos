<script lang="ts">
  import { onMount } from 'svelte'
  import Notifications from './components/Notifications.svelte'
  import { saveSaveGame, resetSaveGame } from "./gamelogic/saveload"
  import {devToolsEnabled, LORCA_OVERRIDE, unlocked} from './stores/mainStore'
  import DevTools from './components/DevTools.svelte'
  import RandomIdea from './components/RandomIdea.svelte'
  import ThoughtComponent from './components/ThoughtComponent.svelte'
  import CheeseComponent from './components/CheeseComponent.svelte'
  import MoldyCheeseComponent from './components/MoldyCheeseComponent.svelte'
  import CheeseyardComponent from './components/CheeseyardComponent.svelte'
  import LootComponent from './components/LootComponent.svelte'
  

  let gameWindow: HTMLElement, dragWindow: HTMLElement
  let offsetX: number, offsetY: number

  onMount(() => {
    // return false if key is 'Enter'
    window.document.onkeydown = (e: KeyboardEvent) => e.key !== 'Enter'

    window.addEventListener('keypress', (e) => {
      if (e.key === "f") $LORCA_OVERRIDE = !$LORCA_OVERRIDE
      if (e.key === "g") $devToolsEnabled = !$devToolsEnabled
    })
    
    // drag the entire game window around freely:
    window.document.onmousedown = function(e) {
      dragWindow = gameWindow
      offsetX = e.pageX - gameWindow.offsetLeft
      offsetY = e.pageY - gameWindow.offsetTop
    }
    window.document.onmousemove = function(e) {
      if (dragWindow == null) return
      dragWindow.style.left = e.pageX - offsetX + "px"
      dragWindow.style.top = e.pageY - offsetY + "px"
    }
    window.document.onmouseup = function(e) {
      dragWindow = null
    }

  })

</script>

<main>
  <DevTools/>
  <!-- Add the Notifications component so messages appear on every page -->
  <Notifications/>

  <div id="saveload">
    <button on:click={() => {saveSaveGame()}}>Save</button>
    <button on:click={resetSaveGame}>Reset</button>
  </div>

  <div id="display">

    <div id="game" bind:this={gameWindow}>
      <ThoughtComponent/>
      {#if $unlocked["switzerland"] || $LORCA_OVERRIDE}
        <CheeseComponent/>
      {/if}
      {#if $unlocked["moldyCheese"] || $LORCA_OVERRIDE}
        <MoldyCheeseComponent/>
      {/if}
      <div style="display:flex; flex-direction:column; gap: var(--grid-gap)">
        {#if $unlocked["cheeseyard"] || $LORCA_OVERRIDE}
          <CheeseyardComponent/>
        {/if}
        {#if $unlocked["cheeseyard"] || $LORCA_OVERRIDE}
          <LootComponent/>
        {/if}
      </div>
      

    </div>
    <!--<Log/>-->
    
   <!--  <RandomIdea/> -->

  </div>
  
 
</main>

<style>
  #display {
    position: fixed;
    width: 100%;
    height: 100%;
    padding:0;
    margin:0;
    z-index: 0;
    display:flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  #game {
    position: absolute;
    display: flex;
    align-items: flex-start;
    gap: var(--grid-gap);
  }
  #saveload {
      position: fixed;
      z-index: 1;
      top: 0rem;
      right:0rem;
  }
  #saveload button {
    margin: 0;
    padding: 0.25rem;
  }
  #saveload button:hover {
    color: var(--primary);
  }
  

</style>