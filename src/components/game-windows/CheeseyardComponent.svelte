<script lang="ts">
  import Window from './window-model/Window.svelte'
  import { formatNumber, formatWhole } from '@gamelogic/utils'
  import { tooltip } from '../tooltips/tooltip'
  import UpgradeButton from '../UpgradeButton.svelte'
  import { unlocks, UnlockName } from '@store/primitive/unlocks'
  import { type BrainMode, brainMode, totalCheeseMonsterDeaths, resource, upgrades, unlocked } from '@store/primitive'
  import {
    monsterThoughtMult,
    resourceFactorFromBrainMode,
    totalMonsterDeathsLootBoost,
    monsterThoughtFactor,
    cheeseMonsterSpawnrate,
    cheeseMonsterDeathrate,
    cheeseMonsterCapacity,
    cheeseMonsterDropRate,
    cheeseMonsterLootAmount,
    monsterMoldyCheeseFactor,
    monsterMoldyCheeseMult,
    cheeseMonsterMassacreMultiplier,
    cheeseMonsterDeathsPerSec,
    collectiveSentienceBoost,
  } from '@store/derived/cheeseMonster'
  import { fade } from 'svelte/transition'
  import UnlockDrawer from '../UnlockDrawer.svelte'
  import AffixComponent from '../AffixComponent.svelte'
  import Affix from '../Affix.svelte'

  const buyMaxUpgrades = false

  const brainModeDescription: Record<BrainMode, string> = {
    peaceful: 'Inner peace lets your monsters supress their destructive urges',
    neutral: 'Occasionally some monsters may start a fight to the death if they feel like it',
    destructive: 'Monsters attack each other on sight, ripping out their brains',
  }

  $: controllerUnlocked = $unlocked.monsterBrainWaveController

  $: approxCheeseBrainsPerSec =
    $cheeseMonsterDeathsPerSec * $cheeseMonsterDropRate * $cheeseMonsterLootAmount * $totalMonsterDeathsLootBoost

  function unlockBrainWaveController(): void {
    if ($resource.cheeseMonster < 10) return
    $unlocked.monsterBrainWaveController = true
  }
</script>

<Window title="The Cheeseyard" themeColor1="rgb(82, 0, 18)" themeColor2="rgb(255, 0, 98)">
  <div style="display: flex; flex-direction: column; gap: 8px; width: var(--window-width);">
    <span class="resourceDisplay">
      Current population: {formatWhole($resource.cheeseMonster)}/{formatWhole($cheeseMonsterCapacity)}
      <strong class="colorText">cheese monsters</strong> <br />
    </span>
    <span>
      {#if $unlocked.cheeseMonsterCollectiveSentience}
        <span
          class="backgroundOnHover"
          transition:fade={{ duration: 1000 }}
          use:tooltip={{
            Component: SimpleTooltip,
            data: 'In bigger populations, a sort of global thinking <br/> emerges, giving an additional multiplier. <br/> (~population^3)',
          }}
        >
          Collective Sentience: {formatNumber($collectiveSentienceBoost, 2)}x<br />
        </span>
      {:else}
        <span>...??? <br /></span>
      {/if}
      Spawn rate: {$cheeseMonsterSpawnrate < 1
        ? `${formatWhole($cheeseMonsterSpawnrate * 60)}/min`
        : `${formatNumber($cheeseMonsterSpawnrate, 2)}/s`}
      <br />
      {#if $totalCheeseMonsterDeaths > 0}
        <span transition:fade={{ duration: 1000 }}>
          Approx. deaths: {$cheeseMonsterDeathrate > 0 ? `${formatNumber($cheeseMonsterDeathsPerSec, 2)}/s` : 'None'}
          {#if $unlocked.cheeseMonsterMassacre}
            <span
              class="backgroundOnHover"
              transition:fade={{ duration: 1000 }}
              use:tooltip={{
                Component: SimpleTooltip,
                data: 'Higher deaths/s are disproportionally rewarded. <br/> (~deathsPerSec^1.3)',
              }}
            >
              -> Massacre multiplier: {formatNumber($cheeseMonsterMassacreMultiplier, 2)}x
            </span>
          {/if}
          <br />
          Total deaths: {formatWhole($totalCheeseMonsterDeaths)}
        </span>
      {/if}
    </span>
  </div>

  {#if !controllerUnlocked}
    <button
      style="height:50px"
      on:click={unlockBrainWaveController}
      disabled={$resource.cheeseMonster < 10}
      use:tooltip={{ data: 'Are you sure?' }}
    >
      Activate the monster brain wave controller <br />
      Requires 10 cheese monsters
    </button>
  {:else}
    <div id="brainWaveContainer" transition:fade={{ duration: 1000 }}>
      <fieldset>
        <legend>monster brain wave controller</legend>
        <label>
          <input type="radio" name="brainMode" bind:group={$brainMode} value={'peaceful'} />
          peaceful
        </label>
        <label>
          <input type="radio" name="brainMode" bind:group={$brainMode} value={'neutral'} />
          neutral
        </label>
        <label>
          <input type="radio" name="brainMode" bind:group={$brainMode} value={'destructive'} />
          destructive
        </label>
      </fieldset>
      <div id="brainWaveInfo">
        <strong class="colorText" style="text-decoration: underline;">Monster Info</strong> <br />
        <span>
          <p style="margin:0">{brainModeDescription[$brainMode]}.</p>
          <!-- Sentiment: {brainMode} <br /> -->
          Death toll: {$cheeseMonsterDeathrate > 0 ? `${formatNumber($cheeseMonsterDeathrate, 2)}/s/monster` : 'None'}
          <br />
          <span
            class="backgroundOnHover"
            use:tooltip={{
              data: 'The less preoccupied the monsters are with killing each<br> other, the more they can ponder and produce stuff.',
            }}
            >Relative resource generation: {$resourceFactorFromBrainMode}x
          </span>
        </span>
      </div>
    </div>
  {/if}

  <div>
    <span>Your current cheese monsters want to help you: <br /> </span>
    <span>
      ⮞ thoughts/s are boosted by {formatNumber($monsterThoughtMult, 2)}x <br />
    </span>
    <span>
      {#if $upgrades.cheeseMonsterMoldiness.bought > 0}
        ⮞ MC gain is boosted by {formatNumber($monsterMoldyCheeseMult, 2)}x
      {:else}
        ⮞ ...???
      {/if}
    </span>
  </div>

  {#if controllerUnlocked}
    <div transition:fade={{ duration: 1000 }}>
      <span class="resourceDisplay">
        You have {formatNumber($resource.cheeseBrains, 2)}
        <strong style="color: rgb(250, 142, 0)">cheese brains</strong>
        <br />
      </span>
      <span>~ {formatNumber(approxCheeseBrainsPerSec, 2)}/s</span>
    </div>

    <UnlockDrawer unlocks={unlocks.cheeseBrains} folderName="Free Warlock Skills" />

    <div class="flexRowContainer" transition:fade={{ duration: 1000 }}>
      <div class="gridColumn">
        <UpgradeButton
          upgradeName="cheeseMonsterDropRate"
          {buyMaxUpgrades}
          tooltipText={`+5% drop rate (additive) <br> Currently: ${formatWhole($cheeseMonsterDropRate * 100)}%`}
        >
          Increase the drop rate of cheese monsters
        </UpgradeButton>

        <UpgradeButton
          upgradeName="cheeseMonsterLoot"
          {buyMaxUpgrades}
          tooltipText={`+1 brain/death <br> Currently: ${formatWhole($cheeseMonsterLootAmount)} cheese brains/death`}
        >
          Increase the loot obtained from cheese monster corpses
        </UpgradeButton>

        <UpgradeButton
          upgradeName="cheeseMonsterSentience"
          {buyMaxUpgrades}
          tooltipText={`+1x thoughts/s/monster <br> Currently: +${formatNumber(
            $monsterThoughtFactor,
            2
          )}x thoughts/s/monster`}
        >
          Nurture the sentience of monsters
        </UpgradeButton>

        <UpgradeButton
          btnUnlocked={$unlocked.cheeseyardMoldUpgrade}
          upgradeName="cheeseMonsterMoldiness"
          {buyMaxUpgrades}
          tooltipText={`+0.01x MC gain/monster <br> Currently: +${formatNumber(
            $monsterMoldyCheeseFactor,
            2
          )}x MC gain/monster <br> (MC = moldy cheese)`}
        >
          Improve the moldiness of monsters
        </UpgradeButton>
      </div>

      <div class="gridColumn" style="height:264px; width: 100%">
        <AffixComponent>
          <Affix
            factor={$totalMonsterDeathsLootBoost}
            unlocked={$unlocked.cheeseMonsterTotalDeathsBoost}
            tooltipText={`Scales ^2 with total deaths`}
          >
            {unlocks.cheeseBrains.find(v => v.name === UnlockName.CHEESE_MONSTER_TOTAL_DEATHS_BOOST)?.description}
          </Affix>
        </AffixComponent>
      </div>
    </div>
  {/if}
</Window>

<style>
  * {
    --unlockedColor: rgb(255, 0, 98);
    --maxedColor: var(--unlockedColor);
  }
  .colorText {
    color: var(--unlockedColor);
  }
  fieldset {
    width: max-content;
  }
  #brainWaveContainer {
    width: var(--window-width);
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
  #brainWaveInfo {
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .backgroundOnHover:hover {
    background-color: var(--Gray800);
  }
</style>
