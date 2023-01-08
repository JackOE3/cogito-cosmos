<script lang="ts">
  import { formatNumber, formatWhole } from "../gamelogic/utils";
  import { slide, fade} from "svelte/transition";
  import ProgBarTask from "./ProgBarTask.svelte";
  import InputRange from "./InputRange.svelte";
  import { tooltip } from "./tooltips/tooltip";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import {
      LORCA_OVERRIDE,
      thoughts,
      thoughtsPerSec,
      thoughtsBonus,
      thoughtsSacrificed,
      cheeseThoughtMult,
      cheese,
      cheesePerSec,
      moldyCheese,
      unlocked,
      
    } from'../stores/mainStore'
  


  let cheeseQueue = {
    infinite: false,
    state: 'initial',
    current: 0,
    cap: 5,
    capDelta: 5,
    costUnlock: 8,
    costUpgrade: 5,
    costUpgradeMult: 2,
    cycleDuration: 1000, // milliseconds
    yield: 1,
    cost: 100
  }

  let cheeseYieldCost = 10
  let cheeseYieldCostMult = 2.25
  let cheeseYieldFactor = {yield: 2.00, duration: 1.30}
  $: thoughtSacrificeFactor = 1 + Math.pow($thoughtsSacrificed, 0.50) * 0.01

  let cheeseSpeedCost = 50
  let cheeseSpeedCostMult = 1.385
  let cheeseSpeedFactor = {duration: 0.90, cost: 1.50}

  let cheeseThoughtMultCost = 150
  let cheeseThoughtMultCostMult = 2.0
  let cheeseThoughtMultFactor = 0
 
  $: if (cheeseThoughtMultFactor > 0) {
    
    $cheeseThoughtMult = 1 + Math.pow($cheese, 0.5) * 0.2 * cheeseThoughtMultFactor
    //$cheeseThoughtMult = 1 + (baseLog(2, 1 + $cheese) * 0.1 * cheeseThoughtMultFactor)
    console.log("updateD " + $cheeseThoughtMult)
  }  


  // 1 if it's active, 0 when not
  $: cheeseQueueActive = cheeseQueue.state === 'running' ? 1 : 0
  $: cheesePerSecFromQueue = (cheeseQueueActive * 1000 * cheeseQueue.yield/cheeseQueue.cycleDuration)


  /**
   * Triggered when manually starting the cheese generation (with button or input range)
  */
  function handleCheeseGenerationInit() {
    if ($thoughts < cheeseQueue.cost || cheeseQueue.state === 'running') return
    $thoughts -= cheeseQueue.cost
    if(cheeseQueue.current >= 1) cheeseQueue.current--
    cheeseQueue.state = 'running'
    console.log("INIT")
  }
  /**
   * This function will be called whenever the animation of the cheese bar completes a cycle.
   * ProgBarTask dispatches custom event 'completed', which triggers this function
   */
  function handleCheeseGeneration() {
    $cheese += cheeseQueue.yield * thoughtSacrificeFactor

    if(!cheeseQueue.infinite && !cheeseQueue.current) {
      // 'initial' better than 'paused', because the animation might've already started a small bit
      cheeseQueue.state = 'initial'
      return
    }

    if ($thoughts < cheeseQueue.cost) {
      cheeseQueue.state = 'initial'
      return
    }
    $thoughts -= cheeseQueue.cost
    if(cheeseQueue.current >= 1) cheeseQueue.current--

  }

  function handleThoughtSacrifice() {
    $thoughtsSacrificed += $thoughts
    $thoughts = 0
  }

  const unlockCosts = {
    "cheeseQueue": 8,
    "thoughtJerk": 5000,
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
    if ($cheese > cheeseQueue.costUpgrade) {
      $cheese -= cheeseQueue.costUpgrade
      cheeseQueue.cap += cheeseQueue.capDelta
      // so it keeps being an integer:
      cheeseQueue.costUpgrade = Math.round(cheeseQueue.costUpgrade * cheeseQueue.costUpgradeMult)
    }
  }

  function upgradeCheeseYield() {
    if ($cheese < cheeseYieldCost) return
    $cheese -= cheeseYieldCost
    cheeseYieldCost *= cheeseYieldCostMult

    cheeseQueue.yield *= cheeseYieldFactor.yield
    cheeseQueue.cycleDuration *= cheeseYieldFactor.duration
  }

  function upgradeCheeseSpeed() {
    if ($cheese < cheeseSpeedCost) return
    $cheese -= cheeseSpeedCost
    cheeseSpeedCost *= cheeseSpeedCostMult

    cheeseQueue.cycleDuration *= cheeseSpeedFactor.duration
    cheeseQueue.cost *= cheeseSpeedFactor.cost
  }

  const baseLog = (base: number, x: number) => {
    return Math.log(x) / Math.log(base)
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

      <span>
        You have sacrificed {formatWhole($thoughtsSacrificed)} thoughts to streamline your cheese production, <br>
        resulting in {formatNumber(thoughtSacrificeFactor, 2)}x more cheese being produced. <br>
      </span>

      <div class="flexColumnContainer">
        <button on:click={handleCheeseGenerationInit} class:active={cheeseQueue.state === 'running'}>
          Make some cheese <br>
          Costs {formatNumber(cheeseQueue.cost, 2)} thoughts
        </button>
        <button on:click={handleThoughtSacrifice} class:active={cheeseQueue.state === 'running'}>
          Think of improvements in cheese manufacturing <br>
          Sacrifice {formatWhole($thoughts)} thoughts (x{formatNumber((1 + Math.pow($thoughtsSacrificed + $thoughts, 0.75) * 0.01)/thoughtSacrificeFactor, 2)})<br>
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
                --duration = {cheeseQueue.cycleDuration/1000}s
                --playState = {cheeseQueue.state}
                >
              </ProgBarTask>
            </div>
            <p style="width:250px;">
              Industrious swiss workers are producing
              {formatNumber(cheeseQueue.yield * thoughtSacrificeFactor,2)} cheese every
              {formatNumber(cheeseQueue.cycleDuration/1000, 2)}s while consuming
              {formatNumber(cheeseQueue.cost,2)} thoughts.
              (-{formatNumber(cheeseQueue.cost/cheeseQueue.cycleDuration * 1000, 2)} thoughts/s)
            </p>
          </div>
          
          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
            <div transition:fade={{duration: 500}}>
              <div class="slidecontainer">
                <InputRange min={0} max={cheeseQueue.cap} bind:value={cheeseQueue.current} onChange={handleCheeseGenerationInit}/>
              </div>
              <p>There are currently {cheeseQueue.current} cheese in queue.</p>
            </div>
          {/if}


          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <button on:click={upgradeCheeseQueue} disabled={$cheese < cheeseQueue.costUpgrade}
            use:tooltip={{content: SimpleTooltip, data: `Length +${cheeseQueue.capDelta}`}}
            transition:fade={{duration: 500}}
          >
            Lengthen the <strong style="color:yellow">Cheese Queue</strong> <br>
            Current Length: {cheeseQueue.cap} <br>
            Costs {formatWhole(cheeseQueue.costUpgrade)} cheese
          </button>
        {/if}
        {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <button on:click={upgradeCheeseYield} disabled={$cheese < cheeseYieldCost}
            transition:fade={{duration: 500}}
          >
            Your workers create <strong>{formatNumber(cheeseYieldFactor.yield, 2)}x</strong>
            more cheese but also take <strong>{formatNumber(cheeseYieldFactor.duration, 2)}x</strong> longer (0/50) <br>
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
          <button on:click={() => unlockFeature("cheeseQueue")} disabled={$unlocked["cheeseQueue"] || $cheese < unlockCosts["cheeseQueue"]} 
            class:maxed={$unlocked["cheeseQueue"]} transition:slide={{duration: 500}}
          >
              Unlock the <strong style="color:yellow">Cheese Queue</strong> <br>
              Costs {formatWhole(unlockCosts["cheeseQueue"])} cheese
          </button>
         
          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
            <button on:click={() => unlockFeature("thoughtJerk")}  disabled={$unlocked["thoughtJerk"] || $cheese < unlockCosts["thoughtJerk"]}
              class:maxed={$unlocked["thoughtJerk"]} transition:slide={{duration: 500}}
              use:tooltip={{content: SimpleTooltip, data: 'something something per second cubed'}}
            >
              Jerk(?) your thinking <br>
              Costs {formatWhole(unlockCosts["thoughtJerk"])} cheese
            </button>
          {/if}
          {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
            <button disabled
              transition:fade={{duration: 500}} style="height:fit-content"
            >
              Cheese Queue Length boosts cheese production<br>
              Currently: 1.45x <br>
              Costs 500 cheese
            </button>
            <button  disabled
              transition:fade={{duration: 500}} style="height:fit-content"
            >
              Thought Boost slightly affects cheese production <br>
              Currently: 2.54x <br>
              Costs 500 cheese
            </button>
            <button  disabled
              transition:fade={{duration: 500}} style="height:fit-content"
            >
              Cheese production speeds up based on amount of cycles completed <br>
              Current Speed Factor: 2.54x <br>
              Costs 500 cheese
            </button>
            <button  disabled
              transition:fade={{duration: 500}} style="height:fit-content"
            >
              While Thought Boost is active, keep the Cheese Queue topped up <br>
              Costs 500 cheese
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