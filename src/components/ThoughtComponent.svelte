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
    cheeseThoughtMult,
    cheese,
    moldyCheese,
    unlocked,
    
  } from'../stores/mainStore'
 
  let thoughtsPerSecBase = 0

  let thinkFasterCost = 10
  let thinkFasterCostMult = 1.15
  
  let thoughtJerkCost = 2000
  let thoughtJerkCostMult = 1.5

  let thoughtBoostStrengthCost = 100
  let thoughtBoostStrengthCostMult = 2.0
  let thoughtBoostDurationCost = 150
  let thoughtBoostDurationCostMult = 2.5
  
  let thoughtsBonusMax = 1
  let thoughtsBonusDuration = 3000
  let thoughtsBonusDecay = 2000
  const FPS = 60
  let thoughtsBonusIntervalId: number
  let thoughtsBonusTimeoutId: number

  // thoughtsPerSec is being updated here gobally
  $: {
    $thoughtsPerSec = thoughtsPerSecBase * $thoughtsBonus * $cheeseThoughtMult
  }
  // (+ true) == 1, it's the "unary + operator"
  $: thoughtsPerSecBase = (+ $unlocked["thinkPassively"]) + upgradesBought["thoughtAcceleration"] * (upgradesBought["thoughtJerk"] + 1)
  $: thoughtAccelDisplay = upgradesBought["thoughtJerk"] + 1
  
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

  const unlockCosts = {
    "thinkPassively": 10,
    "thinkFaster": 30,
    "thoughtBoost": 50,
    "switzerland": 1000,
    "thoughtSacrifice": 10_000,
    "moldyCheese": 1_000_000,
  }

  function unlockFeature(name: string) {
    let cost: number = unlockCosts[name]
    if ($thoughts < cost) return
    $thoughts -= cost
    $unlocked[name] = true
  }

  const upgradesBought = {
    "thoughtAcceleration": 0,
    "thoughtJerk": 0,
    "thoughtBoostStrength": 0,
    "thoughtDurationStrength": 0,
  }

  function thinkFaster() {
    if ($thoughts < thinkFasterCost) return
    $thoughts -= thinkFasterCost
    thinkFasterCost *= thinkFasterCostMult

    upgradesBought["thoughtAcceleration"] += 1
  }

  function upgradeThoughtJerk() {
    if ($thoughts < thoughtJerkCost) return
    $thoughts -= thoughtJerkCost
    thoughtJerkCost *= thoughtJerkCostMult

    upgradesBought["thoughtJerk"] += 1
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
        thoughtsBonusDuration = 3000 + 10000*Math.sqrt(upgradesBought["thoughtDurationStrength"])
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
          ({formatNumber($thoughtsPerSec, 2)}/s)
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
            use:tooltip={{content: SimpleTooltip, data: `+${thoughtAccelDisplay} thought${thoughtAccelDisplay > 1 ? 's' : ''}/s`}}
          >
            Thought Acceleration <br>
            Costs {formatWhole(thinkFasterCost)} thoughts
          </button>
        {:else}
          <button disabled>???</button>
        {/if}

        {#if $unlocked["thoughtJerk"] || $LORCA_OVERRIDE}
          <button 
            on:click={upgradeThoughtJerk} disabled={$thoughts < thoughtJerkCost}
            use:tooltip={{content: SimpleTooltip, data: 'Effect of Thought Acceleration +1'}}
          >
            Thought Jerk<br>
            Costs {formatWhole(thoughtJerkCost)} thoughts
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
        <button on:click={() => unlockFeature("thinkPassively")} disabled={$unlocked["thinkPassively"] || $thoughts < 10} class:maxed={$unlocked["thinkPassively"]}
          use:tooltip={{content: SimpleTooltip, data: '"I think, therefore I am."'}}
        >
          Learn to think passively <br>
          Costs {formatWhole(unlockCosts["thinkPassively"])} thoughts
        </button>

        {#if $unlocked["thinkPassively"] || $LORCA_OVERRIDE}
          <button on:click={() => unlockFeature("thinkFaster")} disabled={$unlocked["thinkFaster"] || $thoughts < unlockCosts["thinkFaster"]} 
            class:maxed={$unlocked["thinkFaster"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'Really makes you think...'}}
          >
            Accelerate your thinking <br>
            Costs {formatWhole(unlockCosts["thinkFaster"])} thoughts
          </button>
        {/if}
        
        {#if $unlocked["thinkFaster"] || $LORCA_OVERRIDE}
          <button on:click={() => unlockFeature("thoughtBoost")} disabled={$unlocked["thoughtBoost"] || $thoughts < unlockCosts["thoughtBoost"]} 
            class:maxed={$unlocked["thoughtBoost"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: '"i dont want to spam click a gazillion times to play ur stupid game" <br> <strong>- HentaiEnjoyer1978'}}
          >
            Thought Boost <br>
            Costs {formatWhole(unlockCosts["thoughtBoost"])} thoughts
          </button>
        {/if}
        {#if $unlocked["thoughtBoost"] || $LORCA_OVERRIDE}
          <button on:click={() => unlockFeature("switzerland")}  disabled={$unlocked["switzerland"] || $thoughts < unlockCosts["switzerland"]} 
            class:maxed={$unlocked["switzerland"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'The land of cheese'}}
            style="background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%); color:white; "
          >
            Travel to Switzerland <br>
            Costs {formatWhole(unlockCosts["switzerland"])} thoughts
          </button>
        {/if}
        {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <button on:click={() => unlockFeature("thoughtSacrifice")}  disabled={$unlocked["thoughtSacrifice"] || $thoughts < unlockCosts["thoughtSacrifice"]} 
            class:maxed={$unlocked["thoughtSacrifice"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'There will be sacrifices...'}}
          >
            Optimise your cheese manufacturing process <br>
            Costs {formatWhole(unlockCosts["thoughtSacrifice"])} thoughts
          </button>
        {/if}
        {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <button disabled
            transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'Is it okay to eat?'}}
          >
            Ability to stack Thought Boosts <br>
            Costs {formatWhole(unlockCosts["moldyCheese"])} thoughts
          </button>
        {/if}
        {#if $unlocked["cheeseQueue"] || $LORCA_OVERRIDE}
          <button on:click={() => unlockFeature("moldyCheese")}  disabled={$unlocked["moldyCheese"] || $thoughts < unlockCosts["moldyCheese"]} 
            class:maxed={$unlocked["moldyCheese"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'Is it okay to eat?'}}
          >
            Unlock Moldy Cheese <br>
            Costs {formatWhole(unlockCosts["moldyCheese"])} thoughts
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