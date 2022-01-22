<script lang="ts">
  import { onMount } from 'svelte';
	import ProgBar from './components/ProgBar.svelte'
	import Tabs from './components/Tabs.svelte'
  import ActionTree from './components/ActionTree.svelte'
  import Notifications from './components/Notifications.svelte';
  import { saveSaveGame, resetSaveGame } from "./gamelogic/saveload";
  import Log from './components/Log.svelte'
  import Transistor from './components/Transistor.svelte'
  import IdlePrototype from './components/IdlePrototype.svelte'
  import RandomIdea from './components/RandomIdea.svelte'

      
</script>

<main>
  <!-- Add the Notifications component so messages appear on every page -->
  <Notifications/>

  <div id="saveload">
    <button on:click={() => {saveSaveGame()}}>Save</button>
    <button on:click={resetSaveGame}>Reset</button>
  </div>

  <div class="display">

    <Log/>
    <!-- <ActionTree/> -->
    <!-- <IdlePrototype/> -->
    <!-- <Transistor/> -->
    <RandomIdea/>

    
      
  </div>
  
 
</main>

<style>
	main {
		max-width: 100%;
		margin-top:20px;
	}
  .display {
    display:flex;
    align-items: flex-start;
    justify-content: left;
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