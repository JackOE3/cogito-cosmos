<script lang="ts">
  import { onMount } from "svelte";
  import { formatNumber, formatWhole } from "../gamelogic/utils";
  import { slide, fade} from "svelte/transition";
  import ProgBarTask from "./ProgBarTask.svelte";
  import Window from './Window.svelte'
  import UpgradeButton from './UpgradeButton.svelte'
  import InputRange from "./InputRange.svelte";
  import { tooltip } from "./tooltips/tooltip";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import {GAME_FPS} from '../stores/constants'
  import {
    LORCA_OVERRIDE,
    resource,
    thoughtsPerSec,
    thoughtsBonus,
    cheeseThoughtMult,
    cheeseBatchSize,
    currentCheeseQueue,
    maxCheeseQueue,
    cheeseQueueTotalCycles,
    unlocked, 
    upgradesBought
  } from'../stores/mainStore'
    import { upgrades } from "../gamelogic/upgrades";
    import UnlockButton from "./UnlockButton.svelte";
    import { unlocks } from "../gamelogic/unlocks";



  const unlockCosts = {
    "cheeseQueue": 8,
    "cheeseQueueLengthBoost": 1_000,
    "cheeseBoost": 25_000,
    "cheeseCycleAccelerator": 100_000,
    "thoughtJerk": 300_000,
    "cheeseModes": 500_000,  
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
    $cheeseThoughtMult = 1 + Math.log($resource.cheese + 1) * cheeseThoughtMultFactor
    //$cheeseThoughtMult = 1 + Math.sqrt(cheese * 0.001) * cheeseThoughtMultFactor
  }  

  /**
   * Triggered when manually starting the cheese generation (with button or input range)
  */
  let testid: number
  function handleCheeseGenerationInit() {
    if ($resource.thoughts < cheeseBatchCost || cheeseQueue.state === 'running') return
    $resource.thoughts -= cheeseBatchCost
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
    $resource.cheese += $cheeseBatchSize

    if (!cheeseQueue.infinite && !$currentCheeseQueue) {
      // 'initial' better than 'paused', because the animation might've already started a small bit
      cheeseQueue.state = 'initial'
      return
    }
    if ($resource.thoughts < cheeseBatchCost) {
      cheeseQueue.state = 'initial'
      return
    }

    $resource.thoughts -= cheeseBatchCost
    if ($currentCheeseQueue >= 1) $currentCheeseQueue--
    if ($unlocked["cheeseCycleAccelerator"] || $LORCA_OVERRIDE) $cheeseQueueTotalCycles++
  }


  function unlockFeature(name: string) {
    let cost: number = unlockCosts[name]
    if ($resource.cheese < cost) return
    $resource.cheese -= cost
    $unlocked[name] = true
  }


  let buyMaxUpgrades = false


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
  
<Window title="Switzerland Simulator" --bg="linear-gradient(90deg, rgb(121, 119, 0) 0%, yellow 100%)">
  <span>
    <span class=resourceDisplay>You have {formatNumber($resource.cheese ,2)} <strong style="color:yellow">cheese</strong> <br></span>
    ~{formatNumber(cheesePerSecFromQueue,2)}/s
  </span>

  <div class="flexRowContainer">
    <button style="width:170px" on:click={handleCheeseGenerationInit} disabled={cheeseQueue.state === 'running'}>
      Make some cheese <br>
      Costs {formatNumber(cheeseBatchCost, 2)} thoughts
    </button>
    {#if $unlocked["cheeseModes"]}
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
    {/if}
            
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
      <div class="gridColumn">
        <UpgradeButton upgrade={upgrades.cheeseYield} {buyMaxUpgrades} 
          btnUnlocked={$unlocked["switzerland"] || $LORCA_OVERRIDE}
          tooltipText={`+${formatNumber((($upgradesBought["cheeseYield"]+1) * $cheeseBatchSize/cheeseQueue.yield), 2)} cheese per cycle <br>
          +${formatNumber((cheeseYieldDeltaDuration * cheeseCycleDuration/cheeseQueue.cycleDuration)/1000, 2)}s cycle duration`}>
          Your workers create more cheese but also take longer ({$upgradesBought["cheeseYield"]})
        </UpgradeButton>
      </div>
      <div class="gridColumn">
        <UpgradeButton upgrade={upgrades.cheeseDuration} {buyMaxUpgrades} --maxedColor=yellow
          btnUnlocked={$unlocked["switzerland"] || $LORCA_OVERRIDE}
          tooltipText={`cycle duration x${formatNumber(cheeseSpeedFactor.duration, 2)} <br> 
          thoughts required x${formatNumber(cheeseSpeedFactor.cost, 2)} <br> (both multiplicative)`}>
          The cheese production takes <strong>{formatNumber((1-cheeseSpeedFactor.duration)*100, 0)}%</strong>
          less time, but costs <strong>{formatNumber(cheeseSpeedFactor.cost, 2)}x</strong> more ({formatWhole($upgradesBought["cheeseDuration"])}/50)
        </UpgradeButton>
      </div>
  </div>

  <div class="flexRowContainer">
    <div style="width:250px; margin-top:4px;">
      {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
        <div transition:fade={{duration: 1000}}>
          <div class="slidecontainer">
            <InputRange min={0} max={$maxCheeseQueue} bind:value={$currentCheeseQueue} onChange={handleCheeseGenerationInit}/>
          </div>
          <p>There are currently {$currentCheeseQueue} batches in queue.</p>
        </div>
      {:else}
        <div style="margin-top:10px; text-align: center;">???</div>
      {/if}
    </div>
    <div class="gridColumn">
      <UpgradeButton upgrade={upgrades.cheeseQueueLength} {buyMaxUpgrades} 
        btnUnlocked={$unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
        tooltipText={`Length +${cheeseQueue.capDelta}`}>
        Lengthen the <strong style="color:yellow">Cheese Queue</strong> ({$upgradesBought["cheeseQueueLength"]}) <br>
        Current Length: {$maxCheeseQueue}
      </UpgradeButton>
    </div>
  </div>
  
  

  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton upgrade={upgrades.cheeseThoughtMult} {buyMaxUpgrades} 
        btnUnlocked={$unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
        tooltipText={`Length +${cheeseQueue.capDelta}`}>
        Cheese increases thoughts/s ({$upgradesBought["cheeseThoughtMult"]})
        {#if $upgradesBought["cheeseThoughtMult"]}
          <br>Currently: {formatNumber($cheeseThoughtMult , 2)}x
        {/if}
      </UpgradeButton>
    </div> 
  </div>

  
</Window>

<Window --bg="linear-gradient(90deg, rgb(121, 119, 0) 0%, yellow 100%)">
  <div class="gridColumn">
    <UnlockButton unlock={unlocks.cheeseQueue} btnUnlocked={true}
      --unlockedColor='yellow'>
      <span>Unlock the <strong style="color:yellow">Cheese Queue</strong></span>
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseQueueLengthBoost} btnUnlocked={$unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
      --unlockedColor='yellow'>
      Cheese Queue Length boosts cheese production<br>
      Currently: {formatNumber(cheeseQueueLengthBoostFactor, 2)}x
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseBoost} btnUnlocked={$unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
      --unlockedColor='yellow'>
      Thought Boost also affects cheese production
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseCycleAccelerator} btnUnlocked={$unlocked["cheeseQueueLengthBoost"] || $LORCA_OVERRIDE}
      --unlockedColor='yellow'>
      Cheese production speeds up based on amount of cycles completed <br>
      Current Speed Factor: {formatNumber(cheeseCycleAcceleratorFactor, 2)}x
    </UnlockButton>

    <UnlockButton unlock={unlocks.thoughtJerk} btnUnlocked={$unlocked["cheeseBoost"] || $LORCA_OVERRIDE}
      --unlockedColor='yellow' tooltipText={'something something per second cubed'}>
      Jerk(?) your thinking 
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseModes} btnUnlocked={$unlocked["cheeseCycleAccelerator"] || $LORCA_OVERRIDE}
      --unlockedColor='yellow'>
      Unlock 3 modes to help manage your cheese production
    </UnlockButton>


      <!-- <button on:click={() => unlockFeature("cheeseQueueToppedUp")} 
        disabled={$unlocked["cheeseQueueToppedUp"] || cheese < unlockCosts["cheeseQueueToppedUp"]}
        class:maxed={$unlocked["cheeseQueueToppedUp"]} transition:slide={{duration: 500}}
      >
        Activating Thought Boost automatically tops up the Cheese Queue <br> 
        Costs {formatWhole(unlockCosts["cheeseQueueToppedUp"])} cheese
      </button> -->


  </div>
</Window>

      


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
 

</style>