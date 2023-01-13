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
    currentCheeseQueue,
    maxCheeseQueue,
    moldyCheese,
    unlocked,
    
  } from'../stores/mainStore'

  let buyMaxUpgrades = false
 
  let thoughtsPerSecBase = 10
  
  $: thoughtBoostMaxStacks = upgradesBought["thoughtBoostStack"]
  let thoughtBoostCurrentStacks = 0

  $: thoughtBoostMax = 2 + Math.sqrt(upgradesBought["thoughtBoostStrength"])
  $: thoughtBoostDuration = 3000 + 10000*Math.sqrt(upgradesBought["thoughtBoostDuration"])
  let currentThoughtBoostTime = 0
  let thoughtBoostDecay = 2000
  const FPS = 60
  let thoughtBoostIntervalId: number

  // thoughtsPerSec is being updated here gobally
  $: {
    $thoughtsPerSec = thoughtsPerSecBase * $thoughtsBonus * $cheeseThoughtMult
  }
  // (+ true) == 1, it's the "unary + operator"
  $: thoughtsPerSecBase = (+ $unlocked["thinkPassively"]) + upgradesBought["thoughtAcceleration"] * (upgradesBought["thoughtJerk"] + 1)
  $: thoughtAccelDisplay = upgradesBought["thoughtJerk"] + 1
  
  function handleThink() {
    $thoughts += 1
    if (!$unlocked["thoughtBoost"]) return
    if ($unlocked["cheeseQueueToppedUp"]) $currentCheeseQueue = $maxCheeseQueue
    // set multiplier, which expires after a time and starts decaying
    $thoughtsBonus = thoughtBoostMax

    if ($unlocked["thoughtBoostStack"]) {
      if (thoughtBoostCurrentStacks < thoughtBoostMaxStacks) {
        currentThoughtBoostTime += thoughtBoostDuration
        thoughtBoostCurrentStacks++
      } else currentThoughtBoostTime = thoughtBoostDuration * thoughtBoostMaxStacks
    } else currentThoughtBoostTime = thoughtBoostDuration

    clearInterval(thoughtBoostIntervalId)
    let lastRunTime = Date.now()    
    let deltaT = 0

    thoughtBoostIntervalId = setInterval(() => {
      const currentTime = Date.now()
      deltaT = Math.max(Math.min((currentTime - lastRunTime), 1000), 0)
      lastRunTime = currentTime

      thoughtBoostCurrentStacks = Math.ceil(currentThoughtBoostTime/thoughtBoostDuration)

      if (currentThoughtBoostTime > 0) {
        currentThoughtBoostTime -= deltaT
        if (currentThoughtBoostTime < 0) currentThoughtBoostTime = 0
      } else {  
        thoughtBoostCurrentStacks = 0  
        // decrement evenly over {thoughtBoostDecay} milliseconds
        $thoughtsBonus -= (thoughtBoostMax - 1)/(thoughtBoostDecay) * FPS
        if ($thoughtsBonus < 1) {
          // spooky
          clearInterval(thoughtBoostIntervalId)
          $thoughtsBonus = 1
        }
      } 
    }, 1000/FPS)
    
  }

  const unlockCosts = {
    "thinkPassively": 10,
    "thinkFaster": 30,
    "thoughtBoost": 50,
    "switzerland": 3000,
    "thoughtSacrifice": 10_000,
    "thoughtBoostStack": 1_000_000,
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
    "thoughtBoostDuration": 0,
    "thoughtBoostStack": 0,
  }
  const upgradeCost = {
    "thoughtAcceleration": 10,
    "thoughtJerk": 2000,
    "thoughtBoostStrength": 100,
    "thoughtBoostDuration": 150,
    "thoughtBoostStack": 5000,
  }
  const upgradeCostMultiplier = {
    "thoughtAcceleration": 1.15,
    "thoughtJerk": 1.5,
    "thoughtBoostStrength": 2.0,
    "thoughtBoostDuration": 2.5,
    "thoughtBoostStack": 3,
  }

  function purchaseUpgrade(upgradeName: string) {
    if ($thoughts < upgradeCost[upgradeName]) return
    if (!buyMaxUpgrades) {
      // PURCHASE SINGLE:
      $thoughts -= upgradeCost[upgradeName]
      upgradeCost[upgradeName] *= upgradeCostMultiplier[upgradeName]
      upgradesBought[upgradeName]++
    } else {
      // PURCHASE MAX:
      const cost = upgradeCost[upgradeName]
      const costMult = upgradeCostMultiplier[upgradeName]
      // used formulas for geometric series (because of the exponential cost curve of the upgrades)
      const numUpgradesAffordable = Math.floor(Math.log($thoughts/cost * (costMult - 1) + 1) / Math.log(costMult))
      const totalPrice = cost * (Math.pow(costMult, numUpgradesAffordable) - 1) / (costMult - 1)

      $thoughts -= totalPrice
      upgradeCost[upgradeName] *= Math.pow(costMult, numUpgradesAffordable)
      upgradesBought[upgradeName] += numUpgradesAffordable
      //alert("Upgrades affordable: " + numUpgradesAffordable + ", Total Prize: " + totalPrice)
    } 
  }



</script>

<div class="container">
  <div class="header">
    <span class="componentTitle">Cogito Ergo Sum</span>
  </div>
  <div class="content">
    <div style="position: absolute; right: 8px; top: 8px;">
      <input type=checkbox name=buyMax bind:checked={buyMaxUpgrades}>
      <label for=buyMax>Buy Max</label>
    </div>
    
    <span>
      You thought {formatNumber($thoughts ,2)} times <br>
      <span>
        {#if $unlocked["thinkPassively"] || LORCA_OVERRIDE}
          <span class:green={$thoughtsBonus > 1}>{formatNumber($thoughtsPerSec, 2)}/s</span><!-- svelte-ignore empty-block -->
          {#if $thoughtsBonus > 1}
            - {formatNumber($thoughtsBonus, 2)}x for
            {formatNumber(currentThoughtBoostTime/1000, 1)}s
            {#if $unlocked["thoughtBoostStack"]}
              - {thoughtBoostCurrentStacks}/{thoughtBoostMaxStacks} Stack{thoughtBoostMaxStacks > 1 ? "s" : ""}
            {/if}
          {:else}
          {/if}
        {:else} 
          _
        {/if}
      </span>
    </span>

    <div class="flexColumnContainer">
      {#if $unlocked["thoughtBoost"]}
        <button on:click={handleThink}>
            Thought Boost <span class="iconify" data-icon="icon-park-outline:brain"/><br>
            x{formatNumber(thoughtBoostMax, 2)} thoughts/s for {formatNumber(thoughtBoostDuration/1000, 2)}s
        </button>
      {:else}
        <button on:click={handleThink}>
          Think <br>
          (+1 thought) 
        </button>
      {/if}
      
    </div>

    <div class="flexColumnContainer">
      <div class="gridColumn">
        <span>Upgrades</span>
        
        {#if $unlocked["thinkFaster"] || $LORCA_OVERRIDE}
          <button 
            on:click={() => purchaseUpgrade("thoughtAcceleration")} disabled={$thoughts < upgradeCost["thoughtAcceleration"]}
            use:tooltip={{content: SimpleTooltip, data: `+${thoughtAccelDisplay} thought${thoughtAccelDisplay > 1 ? 's' : ''}/s`}}
          >
            Thought Acceleration <br>
            Costs {formatWhole(upgradeCost["thoughtAcceleration"])} thoughts
          </button>
        {:else}
          <button disabled>???</button>
        {/if}

        {#if $unlocked["thoughtJerk"] || $LORCA_OVERRIDE}
          <button 
            on:click={() => purchaseUpgrade("thoughtJerk")} disabled={$thoughts < upgradeCost["thoughtJerk"]}
            use:tooltip={{content: SimpleTooltip, data: 'Effect of Thought Acceleration +1'}}
          >
            Thought Jerk<br>
            Costs {formatWhole(upgradeCost["thoughtJerk"])} thoughts
          </button>
        {:else}
          <button disabled>???</button>
        {/if}

        {#if $unlocked["thoughtBoost"] || $LORCA_OVERRIDE}
          <button on:click={() => purchaseUpgrade("thoughtBoostStrength")} 
            disabled={$thoughts < upgradeCost["thoughtBoostStrength"]} 
            transition:slide={{duration: 500}}
          >
            Increase strength of Thought Boost <br>
            Currently: {formatNumber(thoughtBoostMax, 2)}x <br>
            Costs {formatWhole(upgradeCost["thoughtBoostStrength"])} thoughts
          </button>
        {/if}

        {#if $unlocked["thoughtBoost"] || $LORCA_OVERRIDE}
          <button on:click={() => purchaseUpgrade("thoughtBoostDuration")} 
            disabled={$thoughts < upgradeCost["thoughtBoostDuration"]} 
            transition:slide={{duration: 500}}
          >
            Increase Duration of Thought Boost <br>
            Currently: {formatNumber(thoughtBoostDuration/1000, 2)}s <br>
            Costs  {formatWhole(upgradeCost["thoughtBoostDuration"])} thoughts
          </button>
        {/if}
        {#if $unlocked["thoughtBoostStack"] || $LORCA_OVERRIDE}
          <button on:click={() => purchaseUpgrade("thoughtBoostStack")} 
            disabled={$thoughts < upgradeCost["thoughtBoostStack"] || upgradesBought["thoughtBoostStack"] >= 20} 
            transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: '+1 to max stack'}} style="height:fit-content"
          >
            Increase the maximum stack size of Thought Boosts ({upgradesBought["thoughtBoostStack"]}/20) <br>
            Currently: {formatWhole(thoughtBoostMaxStacks)} <br>
            Costs {formatWhole(upgradeCost["thoughtBoostStack"])} thoughts
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
            Boost your thinking <br>
            Costs {formatWhole(unlockCosts["thoughtBoost"])} thoughts
          </button>
        {/if}
        {#if $unlocked["thoughtBoost"] || $LORCA_OVERRIDE}
          <button on:click={() => unlockFeature("switzerland")}  disabled={$unlocked["switzerland"] || $thoughts < unlockCosts["switzerland"]} 
            class:maxed={$unlocked["switzerland"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'The land of cheese'}}
            style="background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%); color:f; "
          >
            <span style="font-weight:bold; font-size: 16px; text-shadow:1px 1px 2px black;">Travel to Switzerland</span> <br>
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
          <button on:click={() => unlockFeature("thoughtBoostStack")} disabled={$unlocked["thoughtBoostStack"] || $thoughts < unlockCosts["thoughtBoostStack"]} 
            class:maxed={$unlocked["thoughtBoostStack"]} transition:slide={{duration: 500}}
            use:tooltip={{content: SimpleTooltip, data: 'Viagra for the brain'}}
          >
            Ability to stack Thought Boosts <br>
            Costs {formatWhole(unlockCosts["thoughtBoostStack"])} thoughts
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
    position: relative;
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
    font-weight: bold;
  }

  label {
    display:inline-block;
  }
  

</style>