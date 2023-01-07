<script lang="ts">
  import { onMount } from "svelte";
  import { formatNumber, formatWhole } from "../gamelogic/utils";
  import ProgBarTask from './ProgBarTask.svelte';
  import InputRange from './InputRange.svelte'
  import { slide } from "svelte/transition";
  import { tooltip } from "./tooltips/tooltip";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import {
    LORCA_OVERRIDE,
    thoughts,
    thoughtsPerSec,
    thoughtsBonus,
    cheese,
    moldyCheese,
    unlocked,
    
  } from'../stores/mainStore'
 

  let thinkFasterCost = 10
  let thinkFasterCostMult = 1.2
  let thinkFasterPerSec = 1
  
  let thoughtBoostStrengthCost = 100
  let thoughtBoostStrengthCostMult = 1.15
  let thoughtBoostDurationCost = 150
  let thoughtBoostDurationCostMult = 1.15
  
  let thoughtsBonusMax = 1
  let thoughtsBonusDuration = 1500
  let thoughtsBonusDecay = 3000
  const FPS = 60
  let thoughtsBonusIntervalId: number
  let thoughtsBonusTimeoutId: number
  
  function handleThink() {
    $thoughts += 1
    if (thoughtsBonusMax === 1) return
    $thoughtsBonus = thoughtsBonusMax
    clearInterval(thoughtsBonusIntervalId)
    clearTimeout(thoughtsBonusTimeoutId)
    
    // if clicked, set multiplier, which expires after a time and starts decaying
    thoughtsBonusTimeoutId = setTimeout(() => {    
      thoughtsBonusIntervalId = setInterval(() => {
        // decrement evenly over {thoughtsBonusDecay} milliseconds
        $thoughtsBonus -= (thoughtsBonusMax - 1)/(thoughtsBonusDecay) * FPS
        if ($thoughtsBonus < 1) {
          // spooky
          clearInterval(thoughtsBonusIntervalId)
          $thoughtsBonus = 1
        }
      }, 1000/FPS)
    }, thoughtsBonusDuration)
  }


  function thinkFaster() {
    if ($thoughts < thinkFasterCost) return
    $thoughts -= thinkFasterCost
    thinkFasterCost *= thinkFasterCostMult
    $thoughtsPerSec += thinkFasterPerSec
  }


  

  function unlockThinkPassively() {
    if ($thoughts < 10) return
    $thoughts -= 10
    $thoughtsPerSec += 1
    $unlocked["thinkPassively"] = true
  }

  function unlockThinkFaster() {
    if ($thoughts < 30) return
    $thoughts -= 30
    $unlocked["thinkFaster"] = true
  }

  function unlockThoughtBoost() {
    if ($thoughts < 50) return
    $thoughts -= 50
    $unlocked["thoughtBoost"] = true
    thoughtsBonusMax = 2
  }

  function unlockSwitzerland() {
    if ($thoughts < 1000) return
    $thoughts -= 1000
    $unlocked["switzerland"] = true
  }
  

  const upgradesBought = {
    "thoughtBoostStrength": 0,
    "thoughtDurationStrength": 0,
  }

  function upgradeThoughtBoost(property: string) {
    switch(property) {
      case "strength":
        if ($thoughts < thoughtBoostStrengthCost) return
        $thoughts -= thoughtBoostStrengthCost
        thoughtBoostStrengthCost *= thoughtBoostStrengthCostMult
        upgradesBought["thoughtBoostStrength"] += 1
        thoughtsBonusMax = 2 + Math.sqrt(upgradesBought["thoughtBoostStrength"])

        break
      case "duration":
        if ($thoughts < thoughtBoostDurationCost) return
        $thoughts -= thoughtBoostDurationCost
        thoughtBoostDurationCost *= thoughtBoostDurationCostMult
        upgradesBought["thoughtDurationStrength"] += 1
        thoughtsBonusDuration = 1500 + 5000*Math.sqrt(upgradesBought["thoughtDurationStrength"])
        break
    }
  }

</script>

<div class="container">
  <div class="header">
    <span class="componentTitle">Cogito Ergo Sum</span>
  </div>
  <div class="content">
    <span>
      You thought {formatNumber($thoughts ,2)} times <br>
      <span class:green={$thoughtsBonus > 1}>
        {#if $unlocked["thinkPassively"] || LORCA_OVERRIDE}
          ({formatNumber($thoughtsPerSec * $thoughtsBonus,2)}/s)
          <!-- svelte-ignore empty-block -->
          {#if $thoughtsBonus > 1} +{formatWhole($thoughtsBonus*100)}% {:else} {/if}
        {:else} 
          _
        {/if}
      </span>
    </span>

    {#if $unlocked["thoughtBoost"]}
      <button on:click={handleThink}>
          Thought Boost <span class="iconify" data-icon="icon-park-outline:brain"/><br>
          x{formatNumber(thoughtsBonusMax, 2)} thoughts/s for {formatNumber(thoughtsBonusDuration/1000, 2)}s
      </button>
    {:else}
      <button on:click={handleThink}>
        Think <br>
        (+1 thought) 
      </button>
    {/if}


    <div class="flexColumnContainer">
      <div class="gridColumn">
        <span>Upgrades</span>
        
        {#if $unlocked["thinkFaster"] || $LORCA_OVERRIDE}
          <button 
            on:click={thinkFaster} disabled={$thoughts < thinkFasterCost}
            use:tooltip={{content: SimpleTooltip, data: `+${thinkFasterPerSec} thoughts/s`}}
          >
            Thought Acceleration <br>
            Costs {formatWhole(thinkFasterCost)} thoughts
          </button>
        {:else}
          <button disabled>???</button>
        {/if}

        {#if $unlocked["thoughtBoost"] || $LORCA_OVERRIDE}
          <button on:click={() => upgradeThoughtBoost("strength")} disabled={$thoughts < thoughtBoostStrengthCost} transition:slide={{duration: 500}}>
            Increase strength of Thought Boost <br>
            Current: {formatNumber(thoughtsBonusMax, 2)}x <br>
            Costs {formatWhole(thoughtBoostStrengthCost)} thoughts
          </button>
        {/if}

        {#if $unlocked["thoughtBoost"] || $LORCA_OVERRIDE}
          <button on:click={() => upgradeThoughtBoost("duration")} disabled={$thoughts < thoughtBoostDurationCost} transition:slide={{duration: 500}}>
            Increase Duration of Thought Boost <br>
            Current: {formatNumber(thoughtsBonusDuration/1000, 2)}s <br>
            Costs  {formatWhole(thoughtBoostDurationCost)} thoughts
          </button>
        {/if}

      </div>
      
      <div class="gridColumn">
        <span>Unlocks</span>
        <button on:click={unlockThinkPassively} disabled={$unlocked["thinkPassively"] || $thoughts < 10} class:maxed={$unlocked["thinkPassively"]}
          use:tooltip={{content: SimpleTooltip, data: '"I think, therefore I am."'}}
        >
          Learn to think passively <br>
          Costs 10 thoughts
        </button>

        {#if $unlocked["thinkPassively"] || $LORCA_OVERRIDE}
          <button on:click={unlockThinkFaster} disabled={$unlocked["thinkFaster"] || $thoughts < 30} class:maxed={$unlocked["thinkFaster"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'Really makes you think...'}}
          >
            Accelerate your thinking <br>
            Costs 30 thoughts
          </button>
        {/if}
        
        {#if $unlocked["thinkFaster"] || $LORCA_OVERRIDE}
          <button on:click={unlockThoughtBoost} disabled={$unlocked["thoughtBoost"] || $thoughts < 50} class:maxed={$unlocked["thoughtBoost"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: '"i dont want to spam click a gazillion times to play ur stupid game" <br> <strong>- HentaiEnjoyer1978'}}
          >
            Thought Boost <br>
            Costs 50 thoughts
          </button>
        {/if}
        {#if $unlocked["thoughtBoost"] || $LORCA_OVERRIDE}
          <button on:click={unlockSwitzerland}  disabled={$unlocked["switzerland"] || $thoughts < 1000} class:maxed={$unlocked["switzerland"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'The land of cheese'}}
            style="background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%); color:white; "
          >
            Travel to Switzerland <br>
            Costs {formatWhole(1000)} thoughts
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
    background: linear-gradient(90deg, rgb(129, 0, 204) 0%, rgb(182, 122, 255) 100%);
  }
  .maxed {
    border: 1px var(--primary) solid;
    background-color: black;
    color: var(--primary)
  }
  .green {
    color: rgb(0, 216, 0);
  }
  

</style>