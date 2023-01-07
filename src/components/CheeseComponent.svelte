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
    costUpgradeMult: 1.5,
    cycleDuration: 2000, // milliseconds
    yield: 1,
    cost: 20
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
    $cheese += cheeseQueue.yield

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

  function unlockCheeseQueue() {
    if ($cheese < 8) return
    $cheese -= 8
    $unlocked["cheeseQueue"] = true
  }

  function upgradeCheeseQueue() {
    if ($cheese > cheeseQueue.costUpgrade) {
      $cheese -= cheeseQueue.costUpgrade
      cheeseQueue.cap += cheeseQueue.capDelta
      // so it keeps being an integer:
      cheeseQueue.costUpgrade = Math.round(cheeseQueue.costUpgrade * cheeseQueue.costUpgradeMult)
    }
  }

</script>
  
  <div class="container">
    <div class="header">
      <span class="componentTitle">Switzerland Simulator</span>
    </div>
    <div class="content">
      
      <span>
        You have {formatNumber($cheese,2)} <strong style="color:yellow">cheese</strong> <br>
        {formatNumber(0,2)}/s
      </span>

      <button on:click={handleCheeseGenerationInit} class:active={cheeseQueue.state === 'running'}>
        Make some cheese <br>
        Cost: {cheeseQueue.cost} thoughts
      </button>

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
              {formatNumber(cheeseQueue.yield,2)} cheese every
              {formatNumber(cheeseQueue.cycleDuration/1000, 2)}s while consuming
              {formatNumber(cheeseQueue.cost,2)} thoughts.
            </p>
          </div>
          

          {#if $unlocked["cheeseQueue"]}
            <div transition:fade={{duration: 500}}>
              <div class="slidecontainer">
                <InputRange min={0} max={cheeseQueue.cap} bind:value={cheeseQueue.current} onChange={handleCheeseGenerationInit}/>
              </div>
              <p>There are currently {cheeseQueue.current} cheese in queue.</p>
            </div>
          {/if}
        </div>


        
        <div class="gridColumn">
          <button on:click={unlockCheeseQueue} disabled={$unlocked["cheeseQueue"] || $cheese < 8} class:maxed={$unlocked["cheeseQueue"]} transition:slide={{duration: 500}}>
              Unlock the <strong style="color:yellow">Cheese Queue</strong> <br>
              Costs 8 cheese
          </button>
          {#if $unlocked["cheeseQueue"]}
            <button on:click={upgradeCheeseQueue} disabled={$cheese < cheeseQueue.costUpgrade}
              use:tooltip={{content: SimpleTooltip, data: `Length +${cheeseQueue.capDelta}`}}
              transition:fade={{duration: 500}}
            >
              Lengthen the <strong style="color:yellow">Cheese Queue</strong> <br>
              Current Length: {cheeseQueue.cap} <br>
              Costs {formatWhole(cheeseQueue.costUpgrade)} cheese
            </button>
          {/if}

        </div>
      </div>

    </div>
  </div>

<style>
  .content {
    width: fit-content;
    height: 500px;
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
    color: yellowf
  }

 
</style>