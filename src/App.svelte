<script lang="ts">
  import { onMount } from 'svelte';
  import {boneHarvester, essenceGatherer} from './stores/JobStore.js'
	import ProgBar from './components/ProgBar.svelte'
	import Tabs from './components/Tabs.svelte'
  import ResourceList from './components/ResourceList.svelte'
  import WorkerList from './components/WorkerList.svelte'
  import BuildingList from './components/BuildingList.svelte'
  import Notifications from './components/Notifications.svelte';
  import { gameModel, saveSaveGame, resetSaveGame } from "./gamelogic/gamemodel";

	let items = ['World', 'Stats', 'Achievements', 'Options']
	let activeItem = items[0]
  const tabChange = (e) => {
    activeItem = e.detail;
  } 
  const TICKSPEED = 500
  //$: unemployed = $skeletons.amount - $boneHarvester.employed - $essenceGatherer.employed
      
</script>

<main>
  <!-- Add the Notifications component so messages appear on every page -->
  <Notifications/>
  
	<Tabs {items} {activeItem} on:tabChange={tabChange}/>
  {#if activeItem === 'World'}
    <div class="display">

      <ResourceList/>
      <WorkerList resources={$gameModel.saveData.resource} workers={$gameModel.saveData.worker}/>
      <BuildingList/>
      
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

      <div id="infrastructure">
        <h1>Infrastructure</h1>
        <Building building={$graveyard} cost={[$bones.amount, $stones.amount]}/>
        <Building building={$crypt} cost={[$bones.amount, $stones.amount]}/>
      </div>

      -->

      
    </div>
    <button on:click={() => {saveSaveGame($gameModel.saveData)}}>Save Game</button>
    <button on:click={resetSaveGame}>Reset Game</button>
    
  {:else if activeItem === 'Options'}
    <div id="options">
      <button on:click={() => {saveSaveGame($gameModel.saveData)}}>Save Game</button>
      <button on:click={resetSaveGame}>Reset Game</button>
    </div>
    
  {:else}
  <p>Another tab.</p>
  {/if}
	
</main>

<style>
	main {
		max-width: 100%;
		margin: auto;
	}
  .display {
    display:flex;
    align-items: flex-start;
    justify-content: left;
    margin-bottom: 20px
    
  }
  #options {
    display:flex;
    justify-content: center;
  }
  #jobs {
    width: 240px;
    margin: 0 20px;
    /*border: 1px solid black;*/
  }
  #infrastructure {
    width: 240px;
    margin: 0 20px;
    /*border: 1px solid black;*/
  }
  .job {
    display: flex
  }
  .actions {
    margin-left: auto;
    margin-bottom: 0;
    margin-right: 0
  }



</style>