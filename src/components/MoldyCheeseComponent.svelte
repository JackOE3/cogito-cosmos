<script lang="ts">
  import { formatNumber, formatWhole } from '../gamelogic/utils'
  import Window from './Window.svelte'
  import UpgradeButton from './UpgradeButton.svelte'
  import {
    LORCA_OVERRIDE,
    resource,
    cheeseQueueTotalCycles,
    cheeseFactoryMode,
    unlocked,
    upgrades,
  } from '../stores/mainStore'
  import { cheeseCycleBatchSize, cheeseCycleDuration, cheeseModeFactor } from '../stores/derived/cheese'
  import { moldyCheeseHalfLifeSeconds, moldyCheeseChance } from '../stores/derived/moldyCheese'
  import {
    cheeseMonsterCapacity,
    cheeseMonsterSpawnrate,
    monsterMoldyCheeseMult,
  } from '../stores/derived/cheeseMonster'
  import { unlocks } from '../stores/unlocks'
  import UnlockDrawer from './UnlockDrawer.svelte'

  const buyMaxUpgrades = false

  let conversionOnCD = false
  $: conversionCooldownMS = $unlocked.manualMoldyCheeseConversionBoost ? 5000 * 10 : 5000
  // softcap upgrade when exponent > 1? (currently at >323 bought)
  $: conversionExponent = 0.1 + 0.05 * Math.sqrt($upgrades.moldyCheeseConversionExponent.bought + 1)
  // reactive so it is updated when conversionExponent changes
  $: conversionAmount = (cheese: number): number => Math.pow(cheese, conversionExponent) * $monsterMoldyCheeseMult
  $: manualConversionAmount = conversionAmount($resource.cheese) * ($unlocked.manualMoldyCheeseConversionBoost ? 10 : 1)
  $: byproductConversionAmount =
    $cheeseFactoryMode === 'warpSpeed'
      ? 0
      : conversionAmount($cheeseCycleBatchSize) *
        ($unlocked.moldyCheeseCycleDurationBoost ? Math.pow($cheeseModeFactor.duration, 1.5) : 1)

  // passive moldy cheese generation
  let lastCheeseQueueTotalCycles = 0
  $: {
    if ($unlocked.moldyCheeseByproduct && $cheeseQueueTotalCycles > lastCheeseQueueTotalCycles) {
      if ($cheeseFactoryMode !== 'warpSpeed' && Math.random() < $moldyCheeseChance)
        $resource.moldyCheese += byproductConversionAmount
      lastCheeseQueueTotalCycles = $cheeseQueueTotalCycles
    }
  }

  let cdTimer: number
  let intervalId: number
  function handleMoldyCheeseGenerationButton(): void {
    if (conversionOnCD) return
    conversionOnCD = true
    cdTimer = conversionCooldownMS
    $resource.moldyCheese += manualConversionAmount
    $resource.cheese = 0

    let lastTime = Date.now()
    clearInterval(intervalId)
    intervalId = setInterval(() => {
      const currentTime = Date.now()
      const dt = Math.max(Math.min(currentTime - lastTime, 1000), 0)
      lastTime = currentTime
      cdTimer -= dt
      if (cdTimer <= 0) {
        conversionOnCD = false
        clearInterval(intervalId)
      }
    }, 100)
  }
</script>

<Window title="Moldy Cheese" themeColor1="rgb(75, 121, 0)" themeColor2="rgb(136, 255, 0)">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <span class="resourceDisplay">
      You have {formatNumber($resource.moldyCheese, 2)} <strong class="colorText">moldy cheese</strong>
      <br />
    </span>
    <span>
      Half-life: {formatWhole($moldyCheeseHalfLifeSeconds)}s (-{formatNumber(
        100 - 100 * (1 - Math.log(2) / $moldyCheeseHalfLifeSeconds),
        2
      )}%/s) <br />
      (Moldy cheese is an unstable isotope of cheese and can decay) <br />
      {#if $unlocked.moldyCheeseByproduct || $LORCA_OVERRIDE}
        You gain {formatNumber(byproductConversionAmount, 2)} moldy cheese
        {#if $moldyCheeseChance !== 1} with a {formatWhole($moldyCheeseChance * 100)}% chance {/if}
        whenever a cheese cycle completes
        <br />
        Estimated rate: {formatNumber(
          (byproductConversionAmount / ($cheeseCycleDuration / 1000)) * $moldyCheeseChance,
          2
        )} moldy cheese/s
      {/if}
    </span>
  </div>

  <button style="width: 250px; " on:click={handleMoldyCheeseGenerationButton} disabled={conversionOnCD}>
    <strong style="color:yellow">Cheese Sacrifice</strong>
    <br />
    Convert all cheese into<br />
    {formatNumber(manualConversionAmount, 2)} moldy cheese
    <br />
    <span> Cooldown: {formatWhole(conversionCooldownMS / 1000)}s </span>
    {#if conversionOnCD}
      <span>({formatNumber(cdTimer / 1000, 1)}s)</span>
    {/if}
  </button>

  <UnlockDrawer unlocks={unlocks.moldyCheese} folderName="Free Alchemical Ingredient Icons Pack" />

  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton upgradeName="moldyCheeseConversionExponent" {buyMaxUpgrades}>
        Improve the conversion function <br />
        Currently: cheese^{formatNumber(conversionExponent, 4)}
      </UpgradeButton>

      <UpgradeButton upgradeName="moldyCheeseHalfLife" {buyMaxUpgrades} tooltipText="+10s">
        Increase MC half-life <br />
        Currently: {formatWhole($moldyCheeseHalfLifeSeconds)}s
      </UpgradeButton>

      <UpgradeButton
        upgradeName="moldyCheeseChance"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.moldyCheeseByproduct}
        tooltipText="+10%"
      >
        Increase MC byproduct chance <br />
        Currently: {formatNumber($moldyCheeseChance * 100, 1)}%
      </UpgradeButton>

      <UpgradeButton upgradeName="cheeseMonsterSpawnrate" {buyMaxUpgrades} btnUnlocked={$unlocked.cheeseyard}>
        Better spawn rate in the cheeseyard <br />
        Currently: {$cheeseMonsterSpawnrate < 1
          ? `${formatWhole($cheeseMonsterSpawnrate * 60)}/min`
          : `${formatNumber($cheeseMonsterSpawnrate, 2)}/s`}
      </UpgradeButton>

      <UpgradeButton
        upgradeName="cheeseMonsterCapacity"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.cheeseyard}
        tooltipText="+10 Capacity"
      >
        Expand the Cheeseyard <br />
        Current Capacity: {formatWhole($cheeseMonsterCapacity)}
      </UpgradeButton>
    </div>

    <div class="gridColumn">
      <!-- <UnlockButton unlock={unlocks.moldyCheeseByproduct}>
        Your cheese factory can produce moldy cheese as a byproduct
      </UnlockButton>

      <UnlockButton unlock={unlocks.cheeseyard}>
        <span>Construct the <strong style="color:crimson">Cheeseyard</strong></span>
      </UnlockButton>

      <UnlockButton unlock={unlocks.manualMoldyCheeseConversionBoost} btnUnlocked={$unlocked.cheeseyard}>
        Cheese sacrifice produces 10x more moldy cheese (but cooldown also 10x)
      </UnlockButton>

      <UnlockButton unlock={unlocks.moldyCheeseCycleDurationBoost} btnUnlocked={$unlocked.cheeseyard}>
        MC byproduct is boosted by (relative duration of the cheese cycle)^1.5 <br />
      </UnlockButton> -->
    </div>
  </div>
</Window>

<style>
  * {
    --maxedColor: rgb(60, 255, 0);
  }
  .colorText {
    color: rgb(60, 255, 0);
  }
</style>
