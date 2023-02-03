<script lang="ts">
  import { onMount } from "svelte";
  import { formatNumber, formatWhole } from "../gamelogic/utils";
  import { slide, fade} from "svelte/transition";
  import ProgBarTask from "./ProgBarTask.svelte";
  import {
      LORCA_OVERRIDE,
      resource,
      cheeseBatchSize,
      currentCheeseQueue,
      maxCheeseQueue,
      cheeseQueueTotalCycles,
      cheeseFactoryMode,
      moldyCheeseHalfLifeSeconds,
      cheeseMonsterCapacity,
      cheeseMonsterSpawnrate,
      unlocked, 
      upgrades,
      //upgradesBought
    } from'../stores/mainStore'
  import Window from './Window.svelte'
  //import { upgrades } from "../gamelogic/upgrades";
  import UnlockButton from "./UnlockButton.svelte";
  import UpgradeButton from './UpgradeButton.svelte'
  import { unlocks } from "../stores/unlocks";


  const unlockCosts = {
    "moldyCheeseByproduct": 50,
    "cheeseyard": 1000,
    "manualMoldyCheeseConversionBoost": 2000,
  }


  let moldyCheeseConversionState = 'initial'
  let currentConversionDuration = 100
  let currentConversionAmount = 0

  $: moldyCheeseChance = 0.1 + 0.1 * $upgrades.moldyCheeseChance.bought
  // kind of scuffed, this executes whenever a cheese cycle completes ($cheeseQueueTotalCycles is incremented)
  let lastCheeseQueueTotalCycles = 0
  
  $: {
    if ($unlocked["moldyCheeseByproduct"] && $cheeseQueueTotalCycles > lastCheeseQueueTotalCycles) {
      if ($cheeseFactoryMode !== 'warpSpeed' && Math.random() < moldyCheeseChance) $resource.moldyCheese += conversionAmount($cheeseBatchSize)
      lastCheeseQueueTotalCycles = $cheeseQueueTotalCycles
    } 
  }

  $: conversionExponent = 0.1 + 0.05 * Math.log($upgrades.moldyCheeseConversionExponent.bought + 1)

  //reactive so it is updated when conversionExponent changes
 $: conversionAmount = (cheese: number): number => Math.pow(cheese, conversionExponent)
  

  //$: conversionDuration = 100 / (Math.pow($resource.cheese, 0.2) + 1) 
  let conversionDuration = 5


  const conversionRate = (cheese: number): number => {
    let duration = conversionDuration
    if (duration == 0) return -1
    return conversionAmount(cheese)/duration
  }

  function handleMoldyCheeseGenerationInit() {
    currentConversionAmount = conversionAmount($resource.cheese)
    currentConversionDuration = conversionDuration

    moldyCheeseConversionState = 'running'
    $resource.cheese = 0
  }
  function handleMoldyCheeseGeneration() {
    $resource.moldyCheese += currentConversionAmount
    moldyCheeseConversionState = 'initial'
  }


  let buyMaxUpgrades = false


  const moldyCheeseHalfLifeStartingValue = 10
  $: {
      $moldyCheeseHalfLifeSeconds = moldyCheeseHalfLifeStartingValue + 10 * $upgrades.moldyCheeseHalfLife.bought
  }

</script>
  
  <Window title="Moldy Cheese" --bg="linear-gradient(90deg, rgb(75, 121, 0) 0%, rgb(136, 255, 0) 100%)">
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <span class=resourceDisplay>
        You have {formatNumber($resource.moldyCheese, 2)} <strong style="color:rgb(60, 255, 0)">moldy cheese</strong> <br>
      </span>
      <span>
        Half-life: {formatWhole($moldyCheeseHalfLifeSeconds)}s (-{formatNumber(100 - 100 * (1 - Math.log(2)/$moldyCheeseHalfLifeSeconds), 2)}%/s) <br>
        (Moldy cheese is an unstable isotope of cheese and can decay) <br>
        {#if $unlocked["moldyCheeseByproduct"] || $LORCA_OVERRIDE}
          You gain {formatNumber(conversionAmount($cheeseBatchSize), 2)} moldy cheese with a {formatNumber(moldyCheeseChance*100, 1)}%  chance whenever a cheese cycle completes
        {/if}
      </span>
    </div>

    <button on:click={handleMoldyCheeseGenerationInit} disabled={moldyCheeseConversionState=='running'}>
      Convert all cheese into
      {#if moldyCheeseConversionState == 'running'}
        {formatNumber(currentConversionAmount, 2)}
      {:else}
        {formatNumber(conversionAmount($resource.cheese), 2)}
      {/if}
      moldy cheese
      <br>
      Conversion time:
        {#if moldyCheeseConversionState == 'running'}
          {formatNumber(currentConversionDuration, 2)}s
        {:else}
          {formatNumber(conversionDuration, 2)}s
        {/if} 
      <br>
      Conversion rate:
        {#if moldyCheeseConversionState == 'running'}
          {formatNumber(currentConversionAmount/currentConversionDuration, 2)}/s
        {:else}
          {formatNumber(conversionRate($resource.cheese), 2)}/s
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

        <UpgradeButton upgradeName=moldyCheeseConversionExponent {buyMaxUpgrades}>
          Improve the conversion function ({$upgrades.moldyCheeseConversionExponent.bought})<br>
          Currently: ^{formatNumber(conversionExponent, 2)}
        </UpgradeButton>

        <UpgradeButton upgradeName=moldyCheeseHalfLife {buyMaxUpgrades}>
          Increase MC half-life ({$upgrades.moldyCheeseHalfLife.bought})<br>
          Currently: {formatWhole($moldyCheeseHalfLifeSeconds)}s
        </UpgradeButton>

        <UpgradeButton upgradeName=moldyCheeseChance {buyMaxUpgrades} --maxedColor='rgb(60, 255, 0)'
          btnUnlocked={$unlocked["moldyCheeseByproduct"] || $LORCA_OVERRIDE}>
          Increase MC byproduct chance ({$upgrades.moldyCheeseChance.bought}/9)<br>
          Currently: {formatNumber(moldyCheeseChance*100, 1)}%
        </UpgradeButton>

        <UpgradeButton upgradeName=cheeseMonsterSpawnrate {buyMaxUpgrades}
          btnUnlocked={$unlocked["cheeseyard"] || $LORCA_OVERRIDE}>
          Better spawn rate in the cheeseyard ({$upgrades.cheeseMonsterSpawnrate.bought})<br>
          Currently: {formatWhole($cheeseMonsterSpawnrate)}/min
        </UpgradeButton>

        <UpgradeButton upgradeName=cheeseMonsterCapacity {buyMaxUpgrades}
          btnUnlocked={$unlocked["cheeseyard"] || $LORCA_OVERRIDE}>
          Expand the Cheeseyard ({$upgrades.cheeseMonsterCapacity.bought})<br>
          Current Capacity: {formatWhole($cheeseMonsterCapacity)}
        </UpgradeButton>

      </div>

      <div class="gridColumn">

        <UnlockButton unlock={unlocks.moldyCheeseByproduct} --unlockedColor="green">
          Your cheese factory can produce moldy cheese as a byproduct 
        </UnlockButton>

        <UnlockButton unlock={unlocks.cheeseyard} --unlockedColor="green">
          Construct the <strong style="color:crimson">Cheeseyard</strong>
        </UnlockButton>

        <UnlockButton unlock={unlocks.manualMoldyCheeseConversionBoost} --unlockedColor="green">
          Multiply the manual moldy cheese conversion yield by 10
        </UnlockButton>

        <UnlockButton unlock={unlocks.moldyCheeseCycleDurationBoost} --unlockedColor="green">
          You get disproportionally (2x) more moldy cheese as byproduct the longer a cheese cycle duration is
        </UnlockButton>
        
      </div>
    </div>
  </Window>

      
      


      

<style>


  #cheeseBar {
    height: 2rem;
  }
 

 
</style>