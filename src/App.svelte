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
  
  


      
  // return false if key is 'Enter'
  window.document.onkeydown = (e: KeyboardEvent) => e.key !== 'Enter'

  onMount(() => {
    window.addEventListener('keypress', (e) => {
      if (e.key === "f") $LORCA_OVERRIDE = !$LORCA_OVERRIDE
    })
    
    window.addEventListener('keypress', (e) => {
      if (e.key === "g") $devToolsEnabled = !$devToolsEnabled
    })
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

  <div class="display">

    <div id="game">
      <ThoughtComponent/>
      {#if $unlocked["switzerland"] || $LORCA_OVERRIDE}
        <CheeseComponent/>
      {/if}
      {#if $unlocked["moldyCheese"] || $LORCA_OVERRIDE}
        <MoldyCheeseComponent/>
      {/if}
    </div>
    <!--<Log/>-->
    
   <!--  <RandomIdea/> -->

  </div>
  
 
</main>

<style>
  #game {
    display: flex;
    align-items: flex-start;
    gap: 28px;
    margin-right: 16px;
    margin-left: 16px; 
  }
	main {
		max-width: 100%;
		margin-top:20px;
	}
  .display {
    display:flex;
    align-items: flex-center;
    justify-content: center;
    margin-bottom: 20px
    
  }
  #saveload {
      position: fixed;
      top: 0rem;
      right:0rem;
  }
  #saveload button {
    background-color: var(--Gray900);
    color: var(--Gray100);
    margin: 0;
    padding: 0.25rem;
  }
  #saveload button:hover {
    color: var(--primary);
  }
  

</style>