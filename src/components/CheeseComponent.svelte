<script lang="ts">
  import { onMount } from "svelte";
  import { formatNumber, formatWhole } from "../gamelogic/utils";
  import { slide, fade} from "svelte/transition";
  import ProgBarTask from "./ProgBarTask.svelte";
  import InputRange from "./InputRange.svelte";
  import { tooltip } from "./tooltips/tooltip";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import {GAME_FPS} from '../stores/constants'
  import {
    LORCA_OVERRIDE,
    thoughts,
    thoughtsPerSec,
    thoughtsBonus,
    cheeseThoughtMult,
    cheese,
    cheeseBatchSize,
    currentCheeseQueue,
    maxCheeseQueue,
    cheeseQueueTotalCycles,
    moldyCheese,
    unlocked, 
    cheeseUpgradesBought as upgradesBought
  } from'../stores/mainStore'


  onMount(() => {
    updateUpgradeCosts()
  })
  // Takes the number of upgrades bought from the SaveData and recalculates the current price.
  function updateUpgradeCosts() {
   // for (let cost in upgradeCost) upgradeCost[cost] *= Math.pow(upgradeCostMultiplier[cost], $upgradesBought[cost])
  }

  let cheeseModeFactor = {yield: 1, duration: 1, cost: 1}

  const cheeseBaseCost = 100
  let cheeseQueue = {
    infinite: false,
    state: 'initial',
    capDelta: 5,
    cycleDuration: 1000, // milliseconds
    yield: 1,
    cost: 100
  }

  $: cheeseCycleAcceleratorFactor = $unlocked["cheeseCycleAccelerator"] ? 1 + Math.log($cheeseQueueTotalCycles/100 + 1) : 1


  // from the "cheese production takes less time..." upgrade:
  let cheeseQueueSpeedFactor = 1

  $: cheeseBoostFactorYield = $unlocked["cheeseBoost"] ? $thoughtsBonus : 1

  /* Reactive variables for Yield, Duration & Cost of the cheese cycle */
  $: {
    $cheeseBatchSize = cheeseQueue.yield * cheeseQueueLengthBoostFactor * cheeseBoostFactorYield * cheeseModeFactor.yield
  }
  //$: cheeseBatchSize = cheeseQueue.yield * cheeseQueueLengthBoostFactor * cheeseBoostFactorYield
  $: cheeseCycleDuration = cheeseQueue.cycleDuration * cheeseQueueSpeedFactor * cheeseModeFactor.duration * (1 / cheeseCycleAcceleratorFactor)
  $: cheeseBatchCost = cheeseQueue.cost * cheeseModeFactor.cost

  $: {
    $maxCheeseQueue = 5 + cheeseQueue.capDelta * $upgradesBought["cheeseQueueLength"] 
  }
  $: {
    // Quadratic growth: for 0.5, every upgrades adds 1 more yield than the last: (+1, +2, +3, ...)
    cheeseQueue.yield = 1 + 0.5 * ($upgradesBought["cheeseYield"] + $upgradesBought["cheeseYield"]*$upgradesBought["cheeseYield"])
    cheeseQueue.cycleDuration = 1000 + cheeseYieldDeltaDuration * $upgradesBought["cheeseYield"]
  }
  $: {
    cheeseQueueSpeedFactor = Math.pow(cheeseSpeedFactor.duration, $upgradesBought["cheeseDuration"])
    cheeseQueue.cost = 100 * Math.pow(cheeseSpeedFactor.cost, $upgradesBought["cheeseDuration"])
  }

  // 1 if it's active, 0 when not
  $: cheeseQueueActive = cheeseQueue.state === 'running' ? 1 : 0
  $: cheesePerSecFromQueue = (cheeseQueueActive * 1000 * $cheeseBatchSize/cheeseCycleDuration)

  $: cheeseQueueLengthBoostFactor = $unlocked["cheeseQueueLengthBoost"] ? ($maxCheeseQueue / 10) : 1


  let cheeseYieldDeltaYield = 1
  let cheeseYieldDeltaDuration = 500 //ms

  let cheeseSpeedFactor = {duration: 0.95, cost: 1.40}

  $: cheeseThoughtMultFactor = 1 + $upgradesBought["cheeseThoughtMult"]
 
  $: if (cheeseThoughtMultFactor > 0) {
    // for balancing, change the 0.01 factor in the sqrt, or even the base of the log
    $cheeseThoughtMult = 1 + Math.log($cheese + 1) * cheeseThoughtMultFactor
    //$cheeseThoughtMult = 1 + Math.sqrt($cheese * 0.001) * cheeseThoughtMultFactor
  }  

  /**
   * Triggered when manually starting the cheese generation (with button or input range)
  */
  let testid: number
  function handleCheeseGenerationInit() {
    if ($thoughts < cheeseBatchCost || cheeseQueue.state === 'running') return
    $thoughts -= cheeseBatchCost
    if($currentCheeseQueue >= 1) $currentCheeseQueue--
    cheeseQueue.state = 'running'


    // new logic for better cheese cycle / loop. progress variable will be passed to a ProgBar component.
    clearInterval(testid)
    let progress = 0
    let deltaTimeMillis = 0
    let lastTime = Date.now()
    
    testid = setInterval(() => {
      if (cheeseQueue.state == 'initial') clearInterval(testid)
      const currentTime = Date.now()
      deltaTimeMillis = Math.max(Math.min(currentTime - lastTime), 0)
      lastTime = currentTime
      progress += deltaTimeMillis
      while (progress >= cheeseCycleDuration) {
        //handleCheeseGeneration()
        //console.log("Completed a cycle with " + cheeseCycleDuration, progress)
        progress -= cheeseCycleDuration
      }
      
    }, 100)
  }


  /**
   * This function will be called whenever the animation of the cheese bar completes a cycle.
   * ProgBarTask dispatches custom event 'completed', which triggers this function
   */
  function handleCheeseGeneration() {
    $cheese += $cheeseBatchSize

    if (!cheeseQueue.infinite && !$currentCheeseQueue) {
      // 'initial' better than 'paused', because the animation might've already started a small bit
      cheeseQueue.state = 'initial'
      return
    }
    if ($thoughts < cheeseBatchCost) {
      cheeseQueue.state = 'initial'
      return
    }
    $thoughts -= cheeseBatchCost
    if ($currentCheeseQueue >= 1) $currentCheeseQueue--
    if ($unlocked["cheeseCycleAccelerator"] || $LORCA_OVERRIDE) $cheeseQueueTotalCycles++
  }


  const unlockCosts = {
    "cheeseQueue": 8,
    "cheeseQueueLengthBoost": 1_000,
    "cheeseBoost": 25_000,
    "cheeseCycleAccelerator": 100_000,
    "cheeseModes": 200_000,
    "thoughtJerk": 500_000,
  }

  function unlockFeature(name: string) {
    let cost: number = unlockCosts[name]
    if ($cheese < cost) return
    $cheese -= cost
    $unlocked[name] = true
  }

  const upgradeCost = {
    "cheeseQueueLength": 5,
    "cheeseYield": 15,
    "cheeseDuration": 50,
    "cheeseThoughtMult": 300,
  }
  const upgradeCostMultiplier = {
    "cheeseQueueLength": 2,
    "cheeseYield": 1.3,
    "cheeseDuration": 1.4,
    "cheeseThoughtMult": 2,
  }

  let buyMaxUpgrades = false
  function purchaseUpgrade(upgradeName: string) {
    if ($cheese< upgradeCost[upgradeName]) return
    if (!buyMaxUpgrades) {
      // PURCHASE SINGLE:
      $cheese -= upgradeCost[upgradeName]
      upgradeCost[upgradeName] *= upgradeCostMultiplier[upgradeName]
      $upgradesBought[upgradeName]++
    } else {
      // PURCHASE MAX:
      const cost = upgradeCost[upgradeName]
      const costMult = upgradeCostMultiplier[upgradeName]
      // used formulas for geometric series (because of the exponential cost curve of the upgrades)
      const numUpgradesAffordable = Math.floor(Math.log($cheese/cost * (costMult - 1) + 1) / Math.log(costMult))
      const totalPrice = cost * (Math.pow(costMult, numUpgradesAffordable) - 1) / (costMult - 1)

      $cheese -= totalPrice
      upgradeCost[upgradeName] *= Math.pow(costMult, numUpgradesAffordable)
      $upgradesBought[upgradeName] += numUpgradesAffordable
    } 
  }


  let cheeseFactoryMode = 1
  function handleCheeseModeChange(mode: number) {
    switch(mode) {
      case 1: {
        cheeseModeFactor.yield = 1
        cheeseModeFactor.duration = 10
        cheeseModeFactor.cost = 1
        // moldyCheeseYield *= 50 ?
        break
      }
      case 2: {
        cheeseModeFactor.yield = 1
        cheeseModeFactor.duration = 1
        cheeseModeFactor.cost = 1
        break
      }
      case 3: {
        cheeseModeFactor.yield = 1 / 100
        cheeseModeFactor.duration = 1 / 10
        cheeseModeFactor.cost = 1 / 10
        // moldyCheeseYield = 0 (disabled)
        break
      }
    }
  }
</script>
  
  <div class="container">
    <div class="header">
      <span class="componentTitle">Switzerland Simulator</span>
    </div>
    <div class="content">
      
      <span>
        <span class=resourceDisplay>You have {formatNumber($cheese,2)} <strong style="color:yellow">cheese</strong> <br></span>
        ~{formatNumber(cheesePerSecFromQueue,2)}/s
      </span>

      <div class="flexRowContainer">
        <button style="width:170px" on:click={handleCheeseGenerationInit} disabled={cheeseQueue.state === 'running'}>
          Make some cheese <br>
          Costs {formatNumber(cheeseBatchCost, 2)} thoughts
        </button>

        <fieldset style="width:fit-content">
          <legend>cheese factory protocol</legend>
          <div class="flexRowContainer">
            <label>
              <input type=radio name=cheeseFactoryMode bind:group={cheeseFactoryMode} value={1} 
                on:change={() => handleCheeseModeChange(1)}>
              meticulous
            </label>
            <label>
              <input type=radio name=cheeseFactoryMode bind:group={cheeseFactoryMode} value={2}
                on:change={() => handleCheeseModeChange(2)}>
              nominal
            </label>
            <label>
              <input type=radio name=cheeseFactoryMode bind:group={cheeseFactoryMode} value={3}
                on:change={() => handleCheeseModeChange(3)}>
              warp speed
            </label>
          </div>  
        </fieldset>
                
      </div>
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
        <div style="width:500px">
            <p style="margin-left:4px; margin-top: 8px; margin-bottom: 0px">
            Industrious swiss workers are producing
            {formatNumber($cheeseBatchSize, 2)} cheese every
            {formatNumber(cheeseCycleDuration/1000, 2)}s while consuming
            {formatNumber(cheeseBatchCost,2)} thoughts.
            (~{formatNumber(cheeseBatchCost/cheeseCycleDuration * 1000, 2)} thoughts/s)
          </p>
          {#if $unlocked["cheeseCycleAccelerator"] || $LORCA_OVERRIDE}
            <p style="margin-left:4px; margin-top: 8px; margin-bottom: 0px" transition:fade={{duration: 500}}>
              Total Cheese Cycles completed: {formatWhole($cheeseQueueTotalCycles)}
            </p>
          {/if}
        </div>
      </div>

      <div class="flexRowContainer">
        {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <div class="gridColumn">
            <button on:click={() => purchaseUpgrade("cheeseYield")} 
              disabled={$cheese < upgradeCost["cheeseYield"]}
              use:tooltip={{content: SimpleTooltip, data: `+${formatNumber((($upgradesBought["cheeseYield"]+1) * $cheeseBatchSize/cheeseQueue.yield), 2)} cheese per cycle <br>
              +${formatNumber((cheeseYieldDeltaDuration * cheeseCycleDuration/cheeseQueue.cycleDuration)/1000, 2)}s cycle duration`}}
              transition:fade={{duration: 500}}
            >
              Your workers create more cheese but also take longer <br>
              Costs {formatWhole(upgradeCost["cheeseYield"])} cheese
            </button>
          </div>
          <div class="gridColumn">
            <button on:click={() => purchaseUpgrade("cheeseDuration")} 
              disabled={$cheese < upgradeCost["cheeseDuration"] || $upgradesBought["cheeseDuration"] >= 50}
              class:maxed={$upgradesBought["cheeseDuration"] >= 50}
              use:tooltip={{content: SimpleTooltip, data: `cycle duration x${formatNumber(cheeseSpeedFactor.duration, 2)} <br> 
                thoughts required x${formatNumber(cheeseSpeedFactor.cost, 2)} <br> (both multiplicative)`}}
              transition:fade={{duration: 500}}
            >
              The cheese production takes <strong>{formatNumber((1-cheeseSpeedFactor.duration)*100, 0)}%</strong>
              less time, but costs <strong>{formatNumber(cheeseSpeedFactor.cost, 2)}x</strong> more ({formatWhole($upgradesBought["cheeseDuration"])}/50)<br>
              Costs {formatWhole(upgradeCost["cheeseDuration"])} cheese
            </button>
          </div>
        {/if}
      </div>

      <div class="flexRowContainer">
        <div style="width:250px; margin-top:4px">
          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
            <div transition:fade={{duration: 500}}>
              <div class="slidecontainer">
                <InputRange min={0} max={$maxCheeseQueue} bind:value={$currentCheeseQueue} onChange={handleCheeseGenerationInit}/>
              </div>
              <p>There are currently {$currentCheeseQueue} batches in queue.</p>
            </div>
          {/if}
        </div>
        <div class="gridColumn">
          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
            <button on:click={() => purchaseUpgrade("cheeseQueueLength")} 
              disabled={$cheese < upgradeCost["cheeseQueueLength"]}
              use:tooltip={{content: SimpleTooltip, data: `Length +${cheeseQueue.capDelta}`}}
              transition:fade={{duration: 500}}
            >
              Lengthen the <strong style="color:yellow">Cheese Queue</strong> <br>
              Current Length: {$maxCheeseQueue} <br>
              Costs {formatWhole(upgradeCost["cheeseQueueLength"])} cheese
            </button>
          {/if}
        </div>
      </div>
      
      

      <div class="flexRowContainer">
        <div class="gridColumn">
          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
            <button on:click={() => purchaseUpgrade("cheeseThoughtMult")} 
              disabled={$cheese < upgradeCost["cheeseThoughtMult"]}
              transition:fade={{duration: 500}}
            >
              Cheese increases thoughts/s <br>
              {#if cheeseThoughtMultFactor}
                Currently: {formatNumber($cheeseThoughtMult , 2)}x <br>
              {/if}
              Costs {formatWhole(upgradeCost["cheeseThoughtMult"])} cheese
            </button>
          {/if}
        </div> 
      </div>

    </div>
  </div>

  <div class="container">
    <div class="header">
    </div>
    <div class="content">
      <div class="gridColumn">

        <button on:click={() => unlockFeature("cheeseQueue")} 
          disabled={$unlocked["cheeseQueue"] || $cheese < unlockCosts["cheeseQueue"]} 
          class:maxed={$unlocked["cheeseQueue"]} transition:slide={{duration: 500}}
        >
            Unlock the <strong style="color:yellow">Cheese Queue</strong> <br>
            Costs {formatWhole(unlockCosts["cheeseQueue"])} cheese
        </button>
       
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
            Current Speed Factor: {formatNumber(cheeseCycleAcceleratorFactor, 2)}x <br>
            Costs {formatWhole(unlockCosts["cheeseCycleAccelerator"])} cheese
          </button>

          <button on:click={() => unlockFeature("cheeseModes")} 
            disabled={$unlocked["cheeseModes"] || $cheese < unlockCosts["cheeseModes"]}
            class:maxed={$unlocked["cheeseModes"]} transition:slide={{duration: 500}}
          >
            Unlock 3 modes to help manage your cheese production <br> 
            Costs {formatWhole(unlockCosts["cheeseModes"])} cheese
          </button>

          <button on:click={() => unlockFeature("thoughtJerk")}  
            disabled={$unlocked["thoughtJerk"] || $cheese < unlockCosts["thoughtJerk"]}
            class:maxed={$unlocked["thoughtJerk"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'something something per second cubed'}}
          >
            Jerk(?) your thinking <br>
            Costs {formatWhole(unlockCosts["thoughtJerk"])} cheese
          </button>

          <!-- <button on:click={() => unlockFeature("cheeseQueueToppedUp")} 
            disabled={$unlocked["cheeseQueueToppedUp"] || $cheese < unlockCosts["cheeseQueueToppedUp"]}
            class:maxed={$unlocked["cheeseQueueToppedUp"]} transition:slide={{duration: 500}}
          >
            Activating Thought Boost automatically tops up the Cheese Queue <br> 
            Costs {formatWhole(unlockCosts["cheeseQueueToppedUp"])} cheese
          </button> -->

          
        {/if}

      </div>
    </div>
  </div>
<style>
  .content {
    width: fit-content;
    height: fit-content;
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
  .active {
    background-color:rgb(121, 119, 0) ;
  }

 
</style>