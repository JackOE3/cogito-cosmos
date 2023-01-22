<script lang="ts">
  import { onMount } from "svelte";
  import { formatNumber, formatWhole } from "../gamelogic/utils";
  import { slide, fade} from "svelte/transition";
  import ProgBarTask from "./ProgBarTask.svelte";
  import { tooltip } from "./tooltips/tooltip";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import {
      LORCA_OVERRIDE,
      thoughts,
      cheese,
      cheeseBatchSize,
      currentCheeseQueue,
      maxCheeseQueue,
      cheeseQueueTotalCycles,
      moldyCheese,
      moldyCheeseHalfLifeSeconds,
      cheeseMonsterCapacity,
      cheeseMonsterSpawnrate,
      unlocked, 
      upgradesBought
    } from'../stores/mainStore'


  const upgradeCost = {
    "conversionExponent": 3,
    "moldyCheeseHalfLife": 10,
    "moldyCheeseChance": 10,
    "cheeseMonsterSpawnrate": 200,
    "cheeseMonsterCapacity": 400,
  }
  const upgradeCostMultiplier = {
    "conversionExponent": 2.0,
    "moldyCheeseHalfLife": 1.3,
    "moldyCheeseChance": 1.5,
    "cheeseMonsterSpawnrate": 1.4,
    "cheeseMonsterapacity": 2.5,
  }
  const unlockCosts = {
    "moldyCheeseByproduct": 50,
    "cheeseyard": 1000,
    "manualMoldyCheeseConversionBoost": 2000,
  }

  onMount(() => {
    updateUpgradeCosts()
  })
  // Takes the number of upgrades bought from the SaveData and recalculates the current price.
  function updateUpgradeCosts() {
    for (let cost in upgradeCost) upgradeCost[cost] *= Math.pow(upgradeCostMultiplier[cost], $upgradesBought[cost])
  }

  let moldyCheeseConversionState = 'initial'
  let currentConversionDuration = 100
  let currentConversionAmount = 0

  $: moldyCheeseChance = 0.1 + $upgradesBought["moldyCheeseChance"] 
  // kind of scuffed, this executes whenever a cheese cycle completes ($cheeseQueueTotalCycles is incremented)
  let lastCheeseQueueTotalCycles = 0
  
  $: {
    if (unlocked["moldyCheeseByproduct"] && $cheeseQueueTotalCycles > lastCheeseQueueTotalCycles) {
      if (Math.random() < moldyCheeseChance) $moldyCheese += conversionAmount($cheeseBatchSize)
      //console.log("Cycle") 
      lastCheeseQueueTotalCycles = $cheeseQueueTotalCycles
    } 
  }

  $: conversionExponent = 0.1 + 0.05 * Math.log($upgradesBought["conversionExponent"] + 1)

  //reactive so it is updated when conversionExponent changes
  $: conversionAmount = (cheese: number): number => Math.pow(cheese, conversionExponent)
  

  const conversionDuration = (cheese: number): number => 100 / (Math.pow(cheese, 0.2) + 1) 


  const conversionRate = (cheese: number): number => {
    let duration = conversionDuration(cheese)
    if (duration == 0) return -1
    return conversionAmount(cheese)/duration
  }

  function handleMoldyCheeseGenerationInit() {
    currentConversionAmount = conversionAmount($cheese)
    currentConversionDuration = conversionDuration($cheese)

    moldyCheeseConversionState = 'running'
    $cheese = 0
  }
  function handleMoldyCheeseGeneration() {
    $moldyCheese += currentConversionAmount
    moldyCheeseConversionState = 'initial'
  }


  function unlockFeature(name: string) {
    let cost: number = unlockCosts[name]
    if ($moldyCheese < cost) return
    $thoughts -= cost
    $unlocked[name] = true
  }


  let buyMaxUpgrades = false
  function purchaseUpgrade(upgradeName: string) {
    if ($moldyCheese< upgradeCost[upgradeName]) return
    if (!buyMaxUpgrades) {
      // PURCHASE SINGLE:
      $moldyCheese -= upgradeCost[upgradeName]
      upgradeCost[upgradeName] *= upgradeCostMultiplier[upgradeName]
      $upgradesBought[upgradeName]++
    } else {
      // PURCHASE MAX:
      const cost = upgradeCost[upgradeName]
      const costMult = upgradeCostMultiplier[upgradeName]
      // used formulas for geometric series (because of the exponential cost curve of the upgrades)
      const numUpgradesAffordable = Math.floor(Math.log($moldyCheese/cost * (costMult - 1) + 1) / Math.log(costMult))
      const totalPrice = cost * (Math.pow(costMult, numUpgradesAffordable) - 1) / (costMult - 1)

      $moldyCheese -= totalPrice
      upgradeCost[upgradeName] *= Math.pow(costMult, numUpgradesAffordable)
      $upgradesBought[upgradeName] += numUpgradesAffordable
    } 
  }

  const moldyCheeseHalfLifeStartingValue = 10
  $: {
      $moldyCheeseHalfLifeSeconds = moldyCheeseHalfLifeStartingValue + 10 * $upgradesBought["moldyCheeseHalfLife"]
  }

</script>
  
  <div class="container">
    <div class="header">
      <span class="componentTitle">Moldy Cheese</span>
    </div>
    <div class="content">
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span class=resourceDisplay>
          You have {formatNumber($moldyCheese, 2)} <strong style="color:rgb(60, 255, 0)">moldy cheese</strong> <br>
        </span>
        <span>
          Half-life: {formatWhole($moldyCheeseHalfLifeSeconds)}s (-{formatNumber(100 - 100 * (1 - Math.log(2)/$moldyCheeseHalfLifeSeconds), 2)}%/s) <br>
          (Moldy cheese is an unstable isotope of cheese and can decay) <br>
          You gain {formatNumber(conversionAmount($cheeseBatchSize), 2)} moldy cheese with a {formatNumber(moldyCheeseChance*100, 1)}%  chance whenever a cheese cycle completes
        </span>
      </div>

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

      <div class="flexRowContainer">
        <div class="gridColumn">
          <button on:click={() => purchaseUpgrade("conversionExponent")}
            disabled={$moldyCheese < upgradeCost["conversionExponent"]} 
            transition:slide={{duration: 500}}
          >
            Improve the conversion function ({$upgradesBought["conversionExponent"]})<br>
            Currently: ^{formatNumber(conversionExponent, 2)} <br>
            Costs {formatWhole(upgradeCost["conversionExponent"])} moldy cheese
          </button>

          <button on:click={() => purchaseUpgrade("moldyCheeseHalfLife")}
            disabled={$moldyCheese < upgradeCost["moldyCheeseHalfLife"]} 
            transition:slide={{duration: 500}}
          >
            Increase MC half-life ({$upgradesBought["moldyCheeseHalfLife"]})<br>
            Currently: {formatWhole($moldyCheeseHalfLifeSeconds)}s <br>
            Costs {formatWhole(upgradeCost["moldyCheeseHalfLife"])} moldy cheese
          </button>

          {#if $unlocked["moldyCheeseByproduct"] || $LORCA_OVERRIDE}
            <button on:click={() => purchaseUpgrade("moldyCheeseChance")}
              disabled={$moldyCheese < upgradeCost["moldyCheeseChance"] || $upgradesBought["moldyCheeseChance"] >= 9} 
              transition:slide={{duration: 500}}
            >
              Increase MC byproduct chance ({$upgradesBought["moldyCheeseChance"]}/9)<br>
              Currently: {formatNumber(moldyCheeseChance*100, 1)}% <br>
              Costs {formatWhole(upgradeCost["moldyCheeseChance"])} moldy cheese
            </button>
          {/if}

          {#if $unlocked["cheeseyard"] || $LORCA_OVERRIDE}
            <button on:click={() => purchaseUpgrade("cheeseMonsterSpawnrate")}
              disabled={$moldyCheese < upgradeCost["cheeseMonsterSpawnrate"]} 
              transition:slide={{duration: 500}}
            >
              Better spawn rate in the cheeseyard ({$upgradesBought["cheeseMonsterSpawnrate"]})<br>
              Currently: {formatWhole($cheeseMonsterSpawnrate)}/min <br>
              Costs {formatWhole(upgradeCost["cheeseMonsterSpawnrate"])} moldy cheese
            </button>

            <button on:click={() => purchaseUpgrade("cheeseMonsterCapacity")}
              disabled={$moldyCheese < upgradeCost["cheeseMonsterCapacity"]} 
              transition:slide={{duration: 500}}
            >
              Expand the Cheeseyard ({$upgradesBought["cheeseMonsterCapacity"]})<br>
              Current Capacity: {formatWhole($cheeseMonsterCapacity)} <br>
              Costs {formatWhole(upgradeCost["cheeseMonsterCapacity"])} moldy cheese
            </button>
          {/if}
        </div>

        <div class="gridColumn">
          <button on:click={() => unlockFeature("moldyCheeseByproduct")} 
            disabled={$unlocked["moldyCheeseByproduct"] || $moldyCheese < unlockCosts["moldyCheeseByproduct"]} 
            class:maxed={$unlocked["moldyCheeseByproduct"]}
            use:tooltip={{content: SimpleTooltip, data: 'TBD'}}
          >
            Your cheese factory can produce moldy cheese as a byproduct <br>
            Costs {formatWhole(unlockCosts["moldyCheeseByproduct"])} moldy cheese
          </button>

          <button on:click={() => unlockFeature("manualMoldyCheeseConversionBoost")} 
            disabled={$unlocked["manualMoldyCheeseConversionBoost"] || $moldyCheese < unlockCosts["manualMoldyCheeseConversionBoost"]} 
            class:maxed={$unlocked["manualMoldyCheeseConversionBoost"]}
            use:tooltip={{content: SimpleTooltip, data: 'TBD'}}
          >
            Multiply the manual moldy cheese conversion yield by 10 <br>
            Costs {formatWhole(unlockCosts["manualMoldyCheeseConversionBoost"])} moldy cheese
          </button>

          <button on:click={() => unlockFeature("cheeseyard")} 
            disabled={$unlocked["cheeseyard"] || $moldyCheese < unlockCosts["cheeseyard"]} 
            class:maxed={$unlocked["cheeseyard"]}
            use:tooltip={{content: SimpleTooltip, data: 'TBD'}}
          >
            Construct the <strong style="color:crimson">Cheeseyard</strong> <br>
            Costs {formatWhole(unlockCosts["cheeseyard"])} moldy cheese
          </button>

          <button on:click={() => unlockFeature("manualMoldyCheeseConversionBoost")} 
            disabled={$unlocked["manualMoldyCheeseConversionBoost"] || $moldyCheese < unlockCosts["manualMoldyCheeseConversionBoost"]} 
            class:maxed={$unlocked["manualMoldyCheeseConversionBoost"]}
            use:tooltip={{content: SimpleTooltip, data: 'eg: 5x longer cheese cycle => 10x moldy cheese gain'}}
            style="height:fit-content"
          >
            You get disproportionally (2x) more moldy cheese as byproduct the longer a cheese cycle duration is <br>
            Costs {formatWhole(unlockCosts["manualMoldyCheeseConversionBoost"])} moldy cheese
          </button>
          

          
        </div>
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
    background: linear-gradient(90deg, rgb(75, 121, 0) 0%, rgb(136, 255, 0) 100%);
  }

  #cheeseBar {
    height: 2rem;
  }
 
  .maxed {
    border: 1px rgb(60, 255, 0) solid;
    background-color: black;
    color: rgb(60, 255, 0);
  }

 
</style>