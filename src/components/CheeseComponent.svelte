<script lang="ts">
  import { formatNumber, formatWhole } from "../gamelogic/utils";
  import { slide, fade} from "svelte/transition";
  import ProgBarTask from "./ProgBarTask.svelte";
  import InputRange from "./InputRange.svelte";
  import { tooltip } from "./tooltips/tooltip";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import {baseLog} from '../gamelogic/utils'
  import {
      LORCA_OVERRIDE,
      thoughts,
      thoughtsPerSec,
      thoughtsBonus,
      cheeseThoughtMult,
      cheese,
      cheesePerSec,
      currentCheeseQueue,
      maxCheeseQueue,
      moldyCheese,
      unlocked,
      
    } from'../stores/mainStore'
  


  let cheeseQueue = {
    infinite: false,
    state: 'initial',
    capDelta: 5,
    costUnlock: 8,
    costUpgrade: 5,
    costUpgradeMult: 2,
    cycleDuration: 1000, // milliseconds
    yield: 1,
    cost: 100
  }
  let cheeseQueueTotalCycles = 0
  // from the "cheese production takes less time..." upgrade:
  let cheeseQueueSpeedFactor = 1

  $: cheeseBoostFactorYield = $unlocked["cheeseBoost"] ? $thoughtsBonus : 1
  
  $: cheeseDelta = cheeseQueue.yield * cheeseQueueLengthBoostFactor * cheeseBoostFactorYield
  $: cheeseCycleDuration = cheeseQueue.cycleDuration * cheeseQueueSpeedFactor
 

  // 1 if it's active, 0 when not
  $: cheeseQueueActive = cheeseQueue.state === 'running' ? 1 : 0
  $: cheesePerSecFromQueue = (cheeseQueueActive * 1000 * cheeseDelta/cheeseCycleDuration)

  $: cheeseQueueLengthBoostFactor = $unlocked["cheeseQueueLengthBoost"] ? Math.pow($maxCheeseQueue, 0.5) : 1

  let cheeseYieldCost = 10
  let cheeseYieldCostMult = 1.3
  let cheeseYieldDeltaYield = 1
  let cheeseYieldDeltaDuration = 500 //ms

  let cheeseSpeedCost = 50
  let cheeseSpeedCostMult = 1.385
  let cheeseSpeedFactor = {duration: 0.90, cost: 1.50}

  let cheeseThoughtMultCost = 150
  let cheeseThoughtMultCostMult = 2.0
  let cheeseThoughtMultFactor = 0
 
  $: if (cheeseThoughtMultFactor > 0) {
    // for balancing, change the 0.01 factor in the sqrt, or even the base of the log
    $cheeseThoughtMult = 1 + baseLog(2, $cheese + 1) * Math.sqrt(0.01 * cheeseThoughtMultFactor)
    console.log("updateD " + $cheeseThoughtMult)
  }  



  /**
   * Triggered when manually starting the cheese generation (with button or input range)
  */
  function handleCheeseGenerationInit() {
    if ($thoughts < cheeseQueue.cost || cheeseQueue.state === 'running') return
    $thoughts -= cheeseQueue.cost
    if($currentCheeseQueue >= 1) $currentCheeseQueue--
    cheeseQueue.state = 'running'
    console.log("INIT")
  }
  /**
   * This function will be called whenever the animation of the cheese bar completes a cycle.
   * ProgBarTask dispatches custom event 'completed', which triggers this function
   */
  function handleCheeseGeneration() {
    $cheese += cheeseDelta

    if (!cheeseQueue.infinite && !$currentCheeseQueue) {
      // 'initial' better than 'paused', because the animation might've already started a small bit
      cheeseQueue.state = 'initial'
      return
    }

    if ($thoughts < cheeseQueue.cost) {
      cheeseQueue.state = 'initial'
      return
    }
    $thoughts -= cheeseQueue.cost
    if ($currentCheeseQueue >= 1) $currentCheeseQueue--
    if ($unlocked["cheeseCycleAccelerator"]) cheeseQueueTotalCycles++
  }

  const unlockCosts = {
    "cheeseQueue": 8,
    "thoughtJerk": 5000,
    "cheeseQueueLengthBoost": 500,
    "cheeseBoost": 2000,
    "cheeseQueueToppedUp": 5000,
    "cheeseCycleAccelerator": 5000,
  }
  function unlockFeature(name: string) {
    let cost: number = unlockCosts[name]
    if ($cheese < cost) return
    $cheese -= cost
    $unlocked[name] = true
  }

  const upgradesBought = {
    "queueLength": 0,
    "cheeseYield": 0,
    "cheeseDuration": 0,
  }



  function upgradeCheeseQueue() {
    if ($cheese < cheeseQueue.costUpgrade) return
    $cheese -= cheeseQueue.costUpgrade
    $maxCheeseQueue += cheeseQueue.capDelta
    cheeseQueue.costUpgrade *= cheeseQueue.costUpgradeMult
    
    upgradesBought["queueLength"] += 1
  }

  function upgradeCheeseYield() {
    if ($cheese < cheeseYieldCost) return
    $cheese -= cheeseYieldCost
    cheeseYieldCost *= cheeseYieldCostMult

    cheeseQueue.yield += cheeseYieldDeltaYield // ~ quadratic growth
    cheeseYieldDeltaYield += 1
    cheeseQueue.cycleDuration += cheeseYieldDeltaDuration

    upgradesBought["cheeseYield"] += 1
  }

  function upgradeCheeseSpeed() {
    if ($cheese < cheeseSpeedCost) return
    $cheese -= cheeseSpeedCost
    cheeseSpeedCost *= cheeseSpeedCostMult

    cheeseQueueSpeedFactor *= cheeseSpeedFactor.duration
    cheeseQueue.cost *= cheeseSpeedFactor.cost

    upgradesBought["cheeseDuration"] += 1
  }



  function upgradeCheeseThoughtMult() {
    if ($cheese < cheeseThoughtMultCost) return
    $cheese -= cheeseThoughtMultCost
    cheeseThoughtMultCost *= cheeseThoughtMultCostMult

    cheeseThoughtMultFactor += 1
  }

</script>
  
  <div class="container">
    <div class="header">
      <span class="componentTitle">Switzerland Simulator</span>
    </div>
    <div class="content">
      
      <span>
        You have {formatNumber($cheese,2)} <strong style="color:yellow">cheese</strong> <br>
        ~{formatNumber(cheesePerSecFromQueue,2)}/s
      </span>

      <div class="flexColumnContainer">
        <button on:click={handleCheeseGenerationInit} class:active={cheeseQueue.state === 'running'}>
          Make some cheese <br>
          Costs {formatNumber(cheeseQueue.cost, 2)} thoughts
        </button>

                
      </div>
      

      <div class="flexColumnContainer">
        <div class="gridColumn">
          <div>
            <div id="cheeseBar">
              <ProgBarTask
                on:completed={handleCheeseGeneration}
                --width = 100%
                --height = 100%
                --barColor = yellow
                --duration = {cheeseCycleDuration/1000}s
                --playState = {cheeseQueue.state}
                >
              </ProgBarTask>
            </div>
            <p style="width:250px;">
              Industrious swiss workers are producing
              {formatNumber(cheeseDelta, 2)} cheese every
              {formatNumber(cheeseCycleDuration/1000, 2)}s while consuming
              {formatNumber(cheeseQueue.cost,2)} thoughts.
              (~{formatNumber(cheeseQueue.cost/cheeseCycleDuration * 1000, 2)} thoughts/s)
            </p>
          </div>
          
          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
            <div transition:fade={{duration: 500}}>
              <div class="slidecontainer">
                <InputRange min={0} max={$maxCheeseQueue} bind:value={$currentCheeseQueue} onChange={handleCheeseGenerationInit}/>
              </div>
              <p>There are currently {$currentCheeseQueue} batches in queue.</p>
            </div>
          {/if}

          {#if $unlocked["cheeseCycleAccelerator"] || $LORCA_OVERRIDE}
            <div transition:fade={{duration: 500}}>
              <p>Total Cheese Cycles completed: {formatWhole(cheeseQueueTotalCycles)}</p>
            </div>
          {/if}


          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <button on:click={upgradeCheeseQueue} disabled={$cheese < cheeseQueue.costUpgrade}
            use:tooltip={{content: SimpleTooltip, data: `Length +${cheeseQueue.capDelta}`}}
            transition:fade={{duration: 500}}
          >
            Lengthen the <strong style="color:yellow">Cheese Queue</strong> <br>
            Current Length: {$maxCheeseQueue} <br>
            Costs {formatWhole(cheeseQueue.costUpgrade)} cheese
          </button>
        {/if}
        {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <button on:click={upgradeCheeseYield} disabled={$cheese < cheeseYieldCost}
            use:tooltip={{content: SimpleTooltip, data: `+${formatNumber((cheeseYieldDeltaYield * cheeseDelta/cheeseQueue.yield), 2)} cheese per cycle <br>
             +${formatNumber((cheeseYieldDeltaDuration * cheeseCycleDuration/cheeseQueue.cycleDuration)/1000, 2)}s cycle duration`}}
            transition:fade={{duration: 500}}
          >
            Your workers create more cheese but also take longer <br>
            Costs {formatWhole(cheeseYieldCost)} cheese
          </button>
        {/if}
        {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <button on:click={upgradeCheeseSpeed} disabled={$cheese < cheeseSpeedCost}
            transition:fade={{duration: 500}}
          >
            The cheese production takes <strong>{formatNumber((1-cheeseSpeedFactor.duration)*100, 0)}%</strong>
            less time, but costs <strong>{formatNumber(cheeseSpeedFactor.cost, 2)}x</strong> more (0/50)<br>
            Costs {formatWhole(cheeseSpeedCost)} cheese
          </button>
        {/if}
        {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <button on:click={upgradeCheeseThoughtMult} disabled={$cheese < cheeseThoughtMultCost}
            transition:fade={{duration: 500}}
          >
            Cheese increases thoughts/s <br>
            {#if cheeseThoughtMultFactor}
              Currently: {formatNumber($cheeseThoughtMult , 2)}x <br>
            {/if}
            Costs {formatWhole(cheeseThoughtMultCost)} cheese
          </button>
        {/if}
       

        </div>


        
        <div class="gridColumn">
          <button on:click={() => unlockFeature("cheeseQueue")} 
            disabled={$unlocked["cheeseQueue"] || $cheese < unlockCosts["cheeseQueue"]} 
            class:maxed={$unlocked["cheeseQueue"]} transition:slide={{duration: 500}}
          >
              Unlock the <strong style="color:yellow">Cheese Queue</strong> <br>
              Costs {formatWhole(unlockCosts["cheeseQueue"])} cheese
          </button>
         
          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
            <button on:click={() => unlockFeature("thoughtJerk")}  
              disabled={$unlocked["thoughtJerk"] || $cheese < unlockCosts["thoughtJerk"]}
              class:maxed={$unlocked["thoughtJerk"]} transition:slide={{duration: 500}}
              use:tooltip={{content: SimpleTooltip, data: 'something something per second cubed'}}
            >
              Jerk(?) your thinking <br>
              Costs {formatWhole(unlockCosts["thoughtJerk"])} cheese
            </button>
          {/if}
          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
            <button on:click={() => unlockFeature("cheeseQueueLengthBoost")} 
              disabled={$unlocked["cheeseQueueLengthBoost"] || $cheese < unlockCosts["cheeseQueueLengthBoost"]}
              class:maxed={$unlocked["cheeseQueueLengthBoost"]} transition:slide={{duration: 500}}
              style="height:fit-content"
            >
              Cheese Queue Length boosts cheese production<br>
              Currently: {formatNumber(cheeseQueueLengthBoostFactor, 2)}x <br>
              Costs {formatWhole(unlockCosts["cheeseQueueLengthBoost"])} cheese
            </button>
            <button on:click={() => unlockFeature("cheeseBoost")} 
              disabled={$unlocked["cheeseBoost"] || $cheese < unlockCosts["cheeseBoost"]}
              class:maxed={$unlocked["cheeseBoost"]} transition:slide={{duration: 500}}
            >
              Thought Boost also affects cheese production <br>
              Costs {formatWhole(unlockCosts["cheeseBoost"])} cheese
            </button>
            <button  on:click={() => unlockFeature("cheeseCycleAccelerator")} 
              disabled={$unlocked["cheeseCycleAccelerator"] || $cheese < unlockCosts["cheeseCycleAccelerator"]}
              class:maxed={$unlocked["cheeseCycleAccelerator"]} transition:slide={{duration: 500}}
              style="height:fit-content"
            >
              Cheese production speeds up based on amount of cycles completed <br>
              Current Speed Factor: 2.54x <br>
              Costs {formatWhole(unlockCosts["cheeseCycleAccelerator"])} cheese
            </button>
            <button on:click={() => unlockFeature("cheeseQueueToppedUp")} 
              disabled={$unlocked["cheeseQueueToppedUp"] || $cheese < unlockCosts["cheeseQueueToppedUp"]}
              class:maxed={$unlocked["cheeseQueueToppedUp"]} transition:slide={{duration: 500}}
            >
              Activating Thought Boost automatically tops up the Cheese Queue <br> <!-- COULD BE AN UNLOCK THROUGH AN ACHIEVMENT ALTERNATIVELY -->
              Costs {formatWhole(unlockCosts["cheeseQueueToppedUp"])} cheese
            </button>
          {/if}

        </div>
      </div>

    </div>
  </div>

<style>
  .content {
    width: fit-content;
    height: 800px;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    padding: 12px;
    /*border-radius: 8px;*/
  }
  .header {
    background: linear-gradient(90deg, rgb(121, 119, 0) 0%, yellow 100%);
  }

  #cheeseBar {
    height: 2rem;
  }
 
  .maxed {
    border: 1px yellow solid;
    background-color: black;
    color: yellow;
  }

 
</style>