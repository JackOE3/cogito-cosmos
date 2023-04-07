<script lang="ts">
  console.log('cheeseyard.svelte')
  import { formatNumber, formatWhole } from '../gamelogic/utils'
  import Window from './Window.svelte'
  import { tooltip } from './tooltips/tooltip'
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import UpgradeButton from './UpgradeButton.svelte'
  import { unlocks, unlocked } from '../stores/unlocks'
  import { resource } from '../stores/resources'
  import { type BrainMode, brainMode, totalCheeseMonsterDeaths, upgrades } from '../stores/mainStore'
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
  } from '../stores/derived/cheeseMonster'
  import { fade } from 'svelte/transition'
  import UnlockDrawer from './UnlockDrawer.svelte'

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
      use:tooltip={{ Component: SimpleTooltip, data: 'Are you sure?' }}
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
              Component: SimpleTooltip,
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
        <UpgradeButton upgradeName="cheeseMonsterDropRate" {buyMaxUpgrades}>
          Increase the drop rate of cheese monsters ({$upgrades.cheeseMonsterDropRate.bought}/{$upgrades
            .cheeseMonsterDropRate.maxBuy})<br />
          Currently: {formatWhole($cheeseMonsterDropRate * 100)}%
        </UpgradeButton>

        <UpgradeButton upgradeName="cheeseMonsterLoot" {buyMaxUpgrades}>
          Increase the loot obtained from cheese monster corpses ({$upgrades.cheeseMonsterLoot.bought})<br />
          Currently: {formatWhole($cheeseMonsterLootAmount)} cheese brains/death
        </UpgradeButton>

        <UpgradeButton
          upgradeName="cheeseMonsterSentience"
          {buyMaxUpgrades}
          tooltipText={'Surely nothing bad will happen.'}
        >
          Nurture the sentience of monsters ({$upgrades.cheeseMonsterSentience.bought})<br />
          Currently: +{formatNumber($monsterThoughtFactor, 2)}x thoughts/s/monster
        </UpgradeButton>

        <UpgradeButton upgradeName="cheeseMonsterMoldiness" {buyMaxUpgrades} tooltipText={'This smells...'}>
          Improve the moldiness of monsters ({$upgrades.cheeseMonsterMoldiness.bought})<br />
          Currently: +{formatNumber($monsterMoldyCheeseFactor, 2)}x MC gain/monster
        </UpgradeButton>
      </div>

      <div class="gridColumn">
        <!-- <UnlockButton
          unlock={unlocks.cheeseMonsterMassacre}
          tooltipText={'Rewarding genocide! <br /> (only applies in this game and NOT in real life)'}
        >
          <span>
            <strong>Massacre effect</strong>: When killing many cheese monsters at once, the loot is massively boosted.
          </span>
        </UnlockButton>

        <UnlockButton unlock={unlocks.cheeseMonsterCollectiveSentience} tooltipText={'Completely harmless.'}>
          <span>
            <strong>Collective sentience</strong>: Bigger populations give a (much) bigger global boost to thinking due
            to emergence.
          </span>
        </UnlockButton>

        <UnlockButton unlock={unlocks.cheeseMonsterTotalDeathsBoost}>
          Total monster deaths boost loot gain <br />

          {#if $unlocked.cheeseMonsterTotalDeathsBoost}
            Currently: {formatNumber($totalMonsterDeathsLootBoost, 2)}x (quadratic scaling)
          {/if}
        </UnlockButton> -->
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
    width: 180px;
    height: fit-content;
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
