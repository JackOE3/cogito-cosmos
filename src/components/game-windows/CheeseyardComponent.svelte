<script lang="ts">
  import Window from './window-model/Window.svelte'
  import { formatNumber, formatWhole } from '@gamelogic/utils'
  import { tooltip } from '../tooltips/tooltip'
  import UpgradeButton from '../UpgradeButton.svelte'
  import {
    unlocks,
    UnlockName,
    monsterThoughtMult,
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
    cheeseMonsterCollectiveSentienceMultiplier,
    brainMode,
    totalCheeseMonsterDeaths,
    approxCheeseBrainsPerSec,
    resource,
    upgrades,
    unlocked,
    WindowId,
  } from '@store'
  import { fade } from 'svelte/transition'
  import UnlockDrawer from '../UnlockDrawer.svelte'
  import EffectComponent from '../EffectComponent.svelte'
  import Effect from '../Effect.svelte'
  import MonsterBrainWaveController from '../tooltips/MonsterBrainWaveController.svelte'

  export let windowId: WindowId

  const buyMaxUpgrades = false

  $: controllerUnlocked = $unlocked.monsterBrainWaveController

  function unlockBrainWaveController(): void {
    if ($resource.cheeseMonster < 10) return
    $unlocked.monsterBrainWaveController = true
  }
</script>

<Window title="The Cheeseyard" themeColor1="rgb(82, 0, 18)" themeColor2="rgb(255, 0, 98)" {windowId}>
  <div style="display: flex; flex-direction: column; gap: 8px; width: var(--window-width);">
    <span class="resourceDisplay">
      Current population: {formatWhole($resource.cheeseMonster)}/{formatWhole($cheeseMonsterCapacity)}
      <span style="font-weight: bold" class="colorText">cheese monsters</span> <br />
    </span>
    <span>
      Spawn rate: {$cheeseMonsterSpawnrate < 1
        ? `${formatWhole($cheeseMonsterSpawnrate * 60)}/min`
        : `${formatNumber($cheeseMonsterSpawnrate, 2)}/s`}
      <br />
      {#if $totalCheeseMonsterDeaths > 0}
        <span transition:fade={{ duration: 1000 }}>
          Approx. deaths: {$cheeseMonsterDeathrate > 0 ? `${formatNumber($cheeseMonsterDeathsPerSec, 2)}/s` : 'None'}
          <br />
          Total deaths: {formatWhole($totalCheeseMonsterDeaths)}
        </span>
      {:else}
        <span>
          ...???
          <br />
          ...???
        </span>
      {/if}
    </span>
  </div>

  <div class="flexRowContainer" style="margin-top: -8px;">
    {#if !controllerUnlocked}
      <button
        style="height:max-content; width: 202.5px"
        on:click={unlockBrainWaveController}
        disabled={$resource.cheeseMonster < 10}
        use:tooltip={{ data: 'Are you sure?' }}
      >
        Activate the monster brain wave controller <br />
        Requires 10 cheese monsters
      </button>
    {:else}
      <div transition:fade={{ duration: 1000 }}>
        <fieldset>
          <legend>Monster Brainwave Controller</legend>
          <label
            use:tooltip={{ data: 'peaceful', Component: MonsterBrainWaveController, anchor: 'parentElement' }}
            class="bg-on-hover"
          >
            <input type="radio" name="brainMode" bind:group={$brainMode} value={'peaceful'} />
            peaceful
          </label>
          <label
            use:tooltip={{ data: 'neutral', Component: MonsterBrainWaveController, anchor: 'parentElement' }}
            class="bg-on-hover"
          >
            <input type="radio" name="brainMode" bind:group={$brainMode} value={'neutral'} />
            neutral
          </label>
          <label
            use:tooltip={{ data: 'destructive', Component: MonsterBrainWaveController, anchor: 'parentElement' }}
            class="bg-on-hover"
          >
            <input type="radio" name="brainMode" bind:group={$brainMode} value={'destructive'} />
            destructive
          </label>
        </fieldset>
      </div>
    {/if}
    <div>
      <span>Your current cheese monsters want to help you.</span>
      <br />
      <span>
        ⮞ thoughts/s are boosted by {formatNumber($monsterThoughtMult, 2)}x
      </span>
      <br />
      <span>
        {#if $upgrades.cheeseMonsterMoldiness.bought > 0}
          ⮞ MC gain is boosted by {formatNumber($monsterMoldyCheeseMult, 2)}x
        {:else}
          ⮞ ...???
        {/if}
      </span>
    </div>
  </div>

  {#if controllerUnlocked}
    <div transition:fade={{ duration: 1000 }}>
      <span class="resourceDisplay">
        You have {formatNumber($resource.cheeseBrains, 2)}
        <span style="color: rgb(250, 142, 0); font-weight:bold">cheese brains</span>
        <br />
      </span>
      <span>~ {formatNumber($approxCheeseBrainsPerSec, 2)}/s</span>
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
        <EffectComponent>
          <Effect
            factor={$cheeseMonsterMassacreMultiplier}
            unlocked={$unlocked.cheeseMonsterMassacre}
            tooltipText={`Higher deaths/s are disproportionally rewarded. <br/> Scales ^1.3 with deaths/s.`}
          >
            {unlocks.cheeseBrains.find(v => v.name === UnlockName.CHEESE_MONSTER_MASSACRE)?.description}
          </Effect>
          <Effect
            factor={$cheeseMonsterCollectiveSentienceMultiplier}
            unlocked={$unlocked.cheeseMonsterCollectiveSentience}
            tooltipText={`In bigger populations, a sort of global thinking <br/> emerges, giving an additional multiplier. <br/> Scales ^3 with current population.`}
          >
            {unlocks.cheeseBrains.find(v => v.name === UnlockName.CHEESE_MONSTER_COLLECTIVE_SENTIENCE)?.description}
          </Effect>
          <Effect
            factor={$totalMonsterDeathsLootBoost}
            unlocked={$unlocked.cheeseMonsterTotalDeathsBoost}
            tooltipText={`Scales ^2 with total deaths`}
          >
            {unlocks.cheeseBrains.find(v => v.name === UnlockName.CHEESE_MONSTER_TOTAL_DEATHS_BOOST)?.description}
          </Effect>
        </EffectComponent>
      </div>
    </div>
  {/if}
</Window>

<style>
  .colorText {
    color: var(--themeColor2);
  }
</style>
