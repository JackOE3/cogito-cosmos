<script lang="ts">
  import { onMount } from 'svelte';
	import ProgBar from './components/ProgBar.svelte'
	import Tabs from './components/Tabs.svelte'
  import ResourceList from './components/ResourceList.svelte'
  import WorkerList from './components/WorkerList.svelte'
  import BuildingList from './components/BuildingList.svelte'
  import ActionTree from './components/ActionTree.svelte'
  import Notifications from './components/Notifications.svelte';
  import { saveSaveGame, resetSaveGame } from "./gamelogic/saveload";
  import { resourceStore } from "./stores/Resources";
  import Inventory from './components/Inventory.svelte';
  import Character from './components/Character.svelte';
  import Log from './components/Log.svelte'


  //$: unemployed = $skeletons.amount - $boneHarvester.employed - $essenceGatherer.employed
      
</script>

<main>
  <!-- Add the Notifications component so messages appear on every page -->
  <Notifications/>

  <div id="saveload">
    <button on:click={() => {saveSaveGame()}}>Save</button>
    <button on:click={resetSaveGame}>Reset</button>
  </div>

  <div class="display">

    <!--ResourceList/-->
    <!--WorkerList resources={$resourceStore} workers={$worker}/-->
    <!--BuildingList/-->
    <Log/>
    <ActionTree/>
    <Character/>
    <Inventory/>
    
    <!--
    <div id="jobs">
      <h1>Jobs</h1>
      <p>Unemployed: {unemployed}</p>
      <div class="job">
        Bone Harvester ({$boneHarvester.employed})
        <div class="actions">
          <button on:click={() => {
            if (unemployed === 0) return
            $boneHarvester.employed += 1
          }}>Hire</button>
          <button on:click={() => {
            if ($boneHarvester.employed === 0) return
            $boneHarvester.employed -= 1
          }}>Fire</button>
        </div>
        
      </div>
      <div class="job">
        Essence Gatherer ({$essenceGatherer.employed})
        <div class="actions">
          <button on:click={() => {
            if (unemployed === 0) return
            $essenceGatherer.employed += 1
          }}>Hire</button>
          <button on:click={() => {
            if ($essenceGatherer.employed === 0) return
            $essenceGatherer.employed -= 1
          }}>Fire</button>
        </div>
      </div>
      
    </div>

    -->

    
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