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

  let brainMode = 0
  
  let moldyCheeseConversionState = 'initial'
  const MINIMUM_CHEESE = 100
  const MAXIMUM__CONVERSION_DURATION = 100
  let currentConversionDuration = 100
  let currentConversionAmount = 0
  let conversionExponent = 0.5

  const conversionAmount = (cheese: number) => {
    console.log("CONVERSION")
    if (cheese < MINIMUM_CHEESE) return 0
    return Math.pow(cheese - MINIMUM_CHEESE + 1, conversionExponent)
  }

  const conversionDuration = (cheese: number) => {
    if (cheese < MINIMUM_CHEESE) return MAXIMUM__CONVERSION_DURATION
    return MAXIMUM__CONVERSION_DURATION / (Math.log(cheese/MINIMUM_CHEESE) + 1) 
  }

  const conversionRate = (cheese: number) => {
    let duration = conversionDuration(cheese)
    if (duration == 0) return -1
    return conversionAmount(cheese)/duration
  }

  function handleMoldyCheeseGenerationInit() {
    if ($cheese < MINIMUM_CHEESE) return
    currentConversionAmount = conversionAmount($cheese)
    currentConversionDuration = conversionDuration($cheese)

    moldyCheeseConversionState = 'running'
    $cheese = 0
  }

  function handleMoldyCheeseGeneration() {
    $moldyCheese += currentConversionAmount
    moldyCheeseConversionState = 'initial'
  }

</script>
  
  <div class="container">
    <div class="header">
      <span class="componentTitle">Moldy Cheese</span>
    </div>
    <div class="content">
      
      <span>
        You have {formatNumber($moldyCheese, 2)} moldy cheese <br>
        (Moldy cheese is an unstable isotope of cheese and can decay)
      </span>

      <button on:click={handleMoldyCheeseGenerationInit} disabled={moldyCheeseConversionState=='running'}>
        Convert all cheese into
        {#if moldyCheeseConversionState == 'running'}
          {formatNumber(currentConversionAmount, 2)}
        {:else}
          {formatNumber(conversionAmount($cheese), 2)}
        {/if}
        moldy cheese
        <br>
        Estimated conversion time:
          {#if moldyCheeseConversionState == 'running'}
            {formatNumber(currentConversionDuration, 2)}s
          {:else}
            {formatNumber(conversionDuration($cheese), 2)}s
          {/if} 
        <br>
        Estimated conversion rate:
          {#if moldyCheeseConversionState == 'running'}
            {formatNumber(currentConversionAmount/currentConversionDuration, 2)}/s
          {:else}
            {formatNumber(conversionRate($cheese), 2)}/s
          {/if}
      </button>
  
      <div>
        <div id="cheeseBar">
          <ProgBarTask
            on:completed={handleMoldyCheeseGeneration}
            --width = 100%
            --height = 100%
            --barColor = yellow
            --duration = {currentConversionDuration}s
            --playState = {moldyCheeseConversionState}
            >
          </ProgBarTask>
        </div>
      </div>

      <div class="flexColumnContainer">
        <div class="gridColumn">
          <button>
            Improve the conversion function<br>
            Currently: ^0.1 <br>
            Costs 50 moldy cheese
          </button>

          <button>
            Increase MC half-life <br>
            Currently: 60s <br>
            Costs 50 moldy cheese
          </button>

          <button>
            Increase MC byproduct chance <br>
            Currently: 0.5% <br>
            Costs 100 moldy cheese
          </button>

          <button>
            Improve the Cheeseyard spawn rate <br>
            Currently: 1/min <br>
            Costs 100 moldy cheese
          </button>

          <button>
            Expand the Cheeseyard <br>
            Current Capacity: 10 <br>
            Costs 100 moldy cheese
          </button>
        </div>

        <div class="gridColumn">
          <button>
            Your cheese factory can produce moldy cheese as a byproduct <br>
            Costs 100 moldy cheese
          </button>
          <button>
            Construct the <strong style="color:crimson">Cheeseyard</strong> <br>
            Costs 100 moldy cheese
          </button>
          
        </div>
      </div>

      <fieldset style="width:fit-content">
        <legend>monster brain wave controller</legend>
        <label>
          <input type=radio name=brainMode bind:group={brainMode} value={1} 
            on:change={() => {}}>
            peaceful
        </label>
        <label>
          <input type=radio name=brainMode bind:group={brainMode} value={2}
          on:change={() => {}}>
          neutral
        </label>
        <label>
          <input type=radio name=brainMode bind:group={brainMode} value={3}
          on:change={() => {}}>
          destructive
        </label>
      </fieldset>
      
      

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

 
</style>