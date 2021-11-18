<script>
  import { onMount } from 'svelte';
  import {bones, essence} from './stores/ResourceStore.js'
  import {skeletons} from './stores/WorkerStore.js'
  import {boneHarvester, essenceGatherer} from './stores/JobStore.js'
	import ProgBar from './components/ProgBar.svelte'
	import Tabs from './components/Tabs.svelte'
  import Resource from './components/Resource.svelte'

	let items = ['Tab1', 'Tab2', 'Tab3', 'Tab4']
	let activeItem = items[0]
  const tabChange = (e) => {
    activeItem = e.detail;
  } 
  const TICKSPEED = 500
  $: unemployed = $skeletons.amount - $boneHarvester.employed - $essenceGatherer.employed
  
  onMount(() => {
    console.log("App mounted")
    const interval = setInterval(() => {
      // TODO: this calculation shouldnt happen in the gameloop,
      // but only when boneHarvester.employed changes or when you load a saveGame
      $bones.perSec = $boneHarvester.generate.bones * $boneHarvester.employed
      $essence.perSec = $essenceGatherer.generate.essence * $essenceGatherer.employed

      if ($bones.amount < $bones.maxAmount) {
        if ($bones.active) $bones.amount += $bones.perAction
        $bones.amount += $bones.perSec
        // handle cap
        // TODO: maybe make inactive when you hit max?
        if ($bones.amount > $bones.maxAmount) $bones.amount = $bones.maxAmount
      }
      if ($essence.amount < $essence.maxAmount) {
        if(!$essence.requirements()) $essence.active = false
        if($essence.active) {
          $essence.amount += $essence.perAction
          $bones.amount -= 10
        }
        $essence.amount += $essence.perSec
        if ($essence.amount > $essence.maxAmount) $essence.amount = $essence.maxAmount
      }
      
    }, TICKSPEED)

    return () => clearInterval(interval)
  })
    
</script>

<main>
	<Tabs {items} {activeItem} on:tabChange={tabChange}/>
  {#if activeItem === 'Tab1'}
  <div class="display">
    <div class="resources">
      <h1>Resources</h1>
      <Resource resource={$bones}/>
      <Resource resource={$essence}/>
      <p>Cool.</p>
    </div>
    <div class="workers">
      <h1>Workers</h1>

      <div class="worker">
        <span><b>Skeletons</b></span>
        <ProgBar 
          --width = 15rem
          --height = 30px 
          --progress = "{100*$skeletons.amount/$skeletons.maxAmount}%">
          {$skeletons.amount}/{$skeletons.maxAmount}
        </ProgBar>
        Cost: {$skeletons.cost.bones} bones, {$skeletons.cost.essence} essence
        <button on:click={() => {
          if ($bones.amount >= $skeletons.cost.bones 
          && $essence.amount >= $skeletons.cost.essence
          && $skeletons.maxAmount > $skeletons.amount) {
            $skeletons.amount += 1
            $bones.amount -= $skeletons.cost.bones
            $essence.amount -= $skeletons.cost.essence
          }
          // TODO else: alert: you cant buy this
          }}>Summon</button>
      </div>
      
    </div>

    <div class="jobs">
      <h1>Jobs</h1>
      <p>Unemployed: {unemployed}</p>
      <div class="job">
        Bone Harvester ({$boneHarvester.employed})
        <div class="actions">
          <button on:click={() => {
            if (unemployed === 0) return
            $boneHarvester.employed += 1
            console.log(unemployed)
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

  </div>
    
    
  {:else}
  <p>Another tab.</p>
  {/if}
	
</main>

<style>
	main {
		max-width: 80%;
		margin: auto;
	}
  h1 {
    font-size: 20px;
    text-align: center;
  }
  .display {
    display:flex;
    align-items: flex-start;
    justify-content: center;
    margin-bottom: 20px
    
  }
  .resources {
    width: min-content;
    margin: 0 10px;
    border: 1px solid black;

  }
  .workers {
    width: min-content;
    margin: 0 10px;
    border: 1px solid black;
  }
  .jobs {
    width: 240px;
    margin: 0 10px;
    border: 1px solid black;
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