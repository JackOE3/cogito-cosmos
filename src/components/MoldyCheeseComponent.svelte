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
  } from '@store/primitive'
  import { cheeseCycleBatchSize, cheeseCycleDuration, cheeseModeFactor } from '@store/derived/cheese'
  import { moldyCheeseHalfLifeSeconds, moldyCheeseChance } from '@store/derived/moldyCheese'
  import { cheeseMonsterCapacity, cheeseMonsterSpawnrate, monsterMoldyCheeseMult } from '@store/derived/cheeseMonster'
  import { UnlockName, unlocks } from '@store/primitive/unlocks'
  import UnlockDrawer from './UnlockDrawer.svelte'
  import AffixComponent from './AffixComponent.svelte'
  import Affix from './Affix.svelte'

  const buyMaxUpgrades = false

  let conversionOnCD = false
  $: conversionCooldownMS = $unlocked.manualMoldyCheeseConversionBoost ? 5000 * 10 : 5000
  // softcap upgrade when exponent > 1? (currently at >323 bought)
  $: conversionExponent = 0.1 + 0.05 * Math.sqrt($upgrades.moldyCheeseConversionExponent.bought + 1)
  // reactive so it is updated when conversionExponent changes
  $: conversionAmount = (cheese: number): number => Math.pow(cheese, conversionExponent) * $monsterMoldyCheeseMult
  $: manualConversionAmount = conversionAmount($resource.cheese) * ($unlocked.manualMoldyCheeseConversionBoost ? 10 : 1)

  const moldyCheeseCycleDurationBoostExponent = 1.5
  $: moldyCheeseCycleDurationBoostFactor = Math.pow($cheeseModeFactor.duration, moldyCheeseCycleDurationBoostExponent)
  $: moldyCheeseHalflifeBoostFactor = 1 + 1e-6 * Math.pow($moldyCheeseHalfLifeSeconds, 3)

  $: moldyCheeseByproductGain =
    $cheeseFactoryMode !== 'warpSpeed'
      ? conversionAmount($cheeseCycleBatchSize) *
        ($unlocked.moldyCheeseCycleDurationBoost ? moldyCheeseCycleDurationBoostFactor : 1) *
        ($unlocked.moldyCheeseHalflifeBoost ? moldyCheeseHalflifeBoostFactor : 1)
      : 0

  // passive moldy cheese generation
  let lastCheeseQueueTotalCycles = 0
  $: {
    if ($unlocked.moldyCheeseByproduct && $cheeseQueueTotalCycles > lastCheeseQueueTotalCycles) {
      if ($cheeseFactoryMode !== 'warpSpeed' && Math.random() < $moldyCheeseChance)
        $resource.moldyCheese += moldyCheeseByproductGain
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
        You gain {formatNumber(moldyCheeseByproductGain, 2)} moldy cheese
        {#if $moldyCheeseChance !== 1} with a {formatWhole($moldyCheeseChance * 100)}% chance {/if}
        whenever a cheese cycle completes
        <br />
        Estimated rate: {formatNumber(
          (moldyCheeseByproductGain / ($cheeseCycleDuration / 1000)) * $moldyCheeseChance,
          2
        )} moldy cheese/s
      {:else}
        ...???
        <br />
        ...???
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
      <UpgradeButton
        upgradeName="moldyCheeseConversionExponent"
        {buyMaxUpgrades}
        tooltipText={`Currently: cheese^${formatNumber(conversionExponent, 4)}`}
      >
        Improve the conversion function <br />
      </UpgradeButton>

      <UpgradeButton
        upgradeName="moldyCheeseHalfLife"
        {buyMaxUpgrades}
        tooltipText={`+10s half-life <br> Currently: ${formatWhole($moldyCheeseHalfLifeSeconds)}s`}
      >
        Increase MC half-life <br />
      </UpgradeButton>

      <UpgradeButton
        upgradeName="moldyCheeseChance"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.moldyCheeseByproduct}
        tooltipText={`+10% chance (additive) <br> Currently: ${formatNumber($moldyCheeseChance * 100, 1)}%`}
      >
        Increase MC byproduct chance <br />
      </UpgradeButton>

      <UpgradeButton
        upgradeName="cheeseMonsterSpawnrate"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.cheeseyard}
        tooltipText={$cheeseMonsterSpawnrate < 1
          ? `+${formatWhole(10)} spawns/min <br> Currently: ${formatWhole($cheeseMonsterSpawnrate * 60)} spawns/min`
          : `+${formatNumber(10 / 60, 2)} spawns/s <br> Currently: ${formatNumber(
              $cheeseMonsterSpawnrate,
              2
            )} spawns/s`}
      >
        Improve the spawn rate in the cheeseyard <br />
      </UpgradeButton>

      <UpgradeButton
        upgradeName="cheeseMonsterCapacity"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.cheeseyard}
        tooltipText={`+10 capacity <br> Currently: ${formatWhole($cheeseMonsterCapacity)}`}
      >
        Expand the Cheeseyard <br />
      </UpgradeButton>
    </div>

    <div class="gridColumn" style="height:332px; width: 100%">
      <AffixComponent>
        <Affix
          factor={moldyCheeseHalflifeBoostFactor}
          unlocked={$unlocked.moldyCheeseHalflifeBoost}
          tooltipText={`scales ^${3} with half life`}
        >
          MC byproduct gain is additionally boosted by MC half-life
        </Affix>
      </AffixComponent>
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
