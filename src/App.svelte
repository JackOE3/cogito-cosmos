<script>
  import { onMount } from 'svelte';
  import {str, spd, end, capacity, capacityReq, updateStats} from './stores/MainStatStore'
  import {pushups, sidejumps, running} from './stores/ExerciseStore'
	import ProgBar from './components/ProgBar.svelte'
	import Tabs from './components/Tabs.svelte'
  import MainStat from './components/MainStat.svelte'
  import Exercise from './components/Exercise.svelte'
  import CapacityRequirement from './components/CapacityRequirement.svelte'
  import { tooltip } from './components/tooltip';
  

	let items = ['Tab1', 'Tab2', 'Tab3', 'Tab4']
	let activeItem = items[0]
  const tabChange = (e) => {
    activeItem = e.detail;
  } 
  const TICKSPEED = 200
  const stats = [$str, $spd, $end]
  let maxCapacity = 1

  let deltaT = 0
  let lastRunTime = Date.now()
  onMount(() => {
    console.log("App mounted")
    const interval = setInterval(() => {
      const currentTime = Date.now()
      // calculate deltaT based on the current time and the last run time
      // we are using Math.max and Math.min to make sure deltaT is between 0 and 1 seconds
      deltaT = Math.max(Math.min((currentTime - lastRunTime) / 1000, 1), 0)
      lastRunTime = currentTime
      // GAME UPDATE:
      stats.forEach(stat => {
        if (stat.active) stat.exp += stat.perAction*deltaT
        stat.exp += stat.expPerSec*deltaT
        if (stat.exp >= stat.expToNextPoint){
          let surplus = stat.exp - stat.expToNextPoint
          stat.exp = 0 + surplus
          stat.expToNextPoint *= stat.multiplier
          stat.points++
        }
      })
      // check capacity requirement
      // if conditions met, increase
      let capReq = capacityReq[maxCapacity-1]
      if (capReq) {
        if ($str.points >= capReq[0]) {
          if ($spd.points >= capReq[1]) {
            if ($end.points >= capReq[2]) {
              maxCapacity++
              $capacity++

            }
          }
        }
      }
      
      
      updateStats()
    }, TICKSPEED)
    return () => clearInterval(interval)
  })
    
</script>

<main>
	<Tabs {items} {activeItem} on:tabChange={tabChange}/>
  {#if activeItem === 'Tab1'}
  <div class="display">

    <div class="mainStats">
      <h1 title="Your main stats which determine your power level." use:tooltip>Stats</h1>
      <MainStat stat={$str}/>
      <MainStat stat={$spd}/>
      <MainStat stat={$end}/>
    </div>
    <div class="workoutPlan">
      <h1>Workout Plan</h1>
      <span>You have <b>{$capacity}</b> Capacity.</span>
      <span><CapacityRequirement item={capacityReq[maxCapacity-1]} /></span>
      <div class="exercises">
        <Exercise exercise={$pushups} />
        <Exercise exercise={$sidejumps} />
        <Exercise exercise={$running} />
        
        
      </div>
    </div>
  </div>
  <p>This is a test paragraph.</p>
  <button class="mdc-elevation--z2">Test</button>
  <button class="mdc-fab mdc-elevation--z2">Tesssst</button>


    
    
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
    width: fit-content;
    margin: 0px auto 15px;
  }

  .display {
    display:flex;
    align-items: flex-start;
    justify-content: center;
    margin-bottom: 20px
  }
  .workoutPlan {
    margin-left: 40px;
    display:flex;
    flex-direction: column;
    text-align: center;
  }
  .workoutPlan span {
    margin-bottom: 10px;
  }
 
 
 

</style>