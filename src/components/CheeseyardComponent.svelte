<script lang="ts">
  console.log('cheeseyard.svelte')
  import { formatNumber, formatWhole } from '../gamelogic/utils'
  import Window from './Window.svelte'
  import { tooltip } from './tooltips/tooltip'
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import UnlockButton from './UnlockButton.svelte'
  import UpgradeButton from './UpgradeButton.svelte'
  import { unlocks } from '../stores/unlocks'
  import {
    resource,
    unlocked,
    type BrainMode,
    brainMode,
    totalCheeseMonsterDeaths,
    upgrades,
  } from '../stores/mainStore'
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
  } from '../stores/derived/cheeseMonster'

  const buyMaxUpgrades = false

  const brainModeDescription: Record<BrainMode, string> = {
    peaceful: 'Inner peace lets your monsters supress their destructive urges',
    neutral: 'Occasionally some monsters may start a fight to the death if they feel like it',
    destructive: 'Monsters attack each other on sight, ripping out their brains',
  }

  $: controllerUnlocked = $unlocked.monsterBrainWaveController

  $: approxDeathsPerSec = $cheeseMonsterDeathrate * $resource.cheeseMonster
  $: approxCheeseBrainsPerSec =
    approxDeathsPerSec * $cheeseMonsterDropRate * $cheeseMonsterLootAmount * $totalMonsterDeathsLootBoost

  function unlockBrainWaveController(): void {
    if ($resource.cheeseMonster < 10) return
    $unlocked.monsterBrainWaveController = true
  }
</script>

<Window title="The Cheeseyard" --bg="linear-gradient(90deg, rgb(82, 0, 18) 0%, rgb(255, 0, 98) 100%)">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <span class="resourceDisplay">
      Current population: {formatWhole($resource.cheeseMonster)}/{formatWhole($cheeseMonsterCapacity)}
      <strong class="colorText">cheese monsters</strong> <br />
    </span>
    <span>
      Spawn rate: {$cheeseMonsterSpawnrate < 1
        ? `${formatWhole($cheeseMonsterSpawnrate * 60)}/min`
        : `${formatNumber($cheeseMonsterSpawnrate, 2)}/s`}
      <br />
      Approx. deaths: {$cheeseMonsterDeathrate > 0 ? `${formatNumber(approxDeathsPerSec, 2)}/s` : 'None'}
      <br />
      Total deaths: {$totalCheeseMonsterDeaths}
    </span>
  </div>

  {#if !controllerUnlocked}
    <button on:click={unlockBrainWaveController}>
      Activate the monster brain wave controller <br />
      Requires 10 cheese monsters
    </button>
  {:else}
    <div id="brainWaveContainer">
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
          Death rate: {$cheeseMonsterDeathrate > 0 ? `${formatNumber($cheeseMonsterDeathrate, 2)}/s/monster` : 'None'}
          <br />
          <span
            class="backgroundOnHover"
            use:tooltip={{
              content: SimpleTooltip,
              data: 'The less preoccupied the monsters are with killing each<br> other, the more they can ponder and produce stuff.',
            }}
            >Relative resource generation: thoughts {$resourceFactorFromBrainMode.thoughts}x
          </span>
        </span>
      </div>
    </div>
  {/if}

  <div>
    <span>Your current cheese monsters boost the following resources: </span>
    <table>
      <tr>
        <td class="name">thoughts/s</td>
        <td>{formatNumber($monsterThoughtMult, 2)}x</td>
      </tr>
      <tr>
        <td class="name">cheese gain</td>
        <td>3.90x</td>
      </tr>
    </table>
  </div>

  <div>
    <span class="resourceDisplay">
      You have {formatNumber($resource.cheeseBrains, 2)}
      <strong style="color: rgb(250, 142, 0)">cheese brains</strong>
      <br />
    </span>
    <span>~ {formatNumber(approxCheeseBrainsPerSec, 2)}/s</span>
  </div>

  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton upgradeName="cheeseMonsterDropRate" {buyMaxUpgrades}>
        Increase the drop rate of cheese monsters ({$upgrades.cheeseMonsterDropRate.bought}/{$upgrades
          .cheeseMonsterDropRate.maxBuy})<br />
        Currently: {formatWhole($cheeseMonsterDropRate * 100)}%
      </UpgradeButton>

      <UpgradeButton upgradeName="cheeseMonsterLoot" {buyMaxUpgrades}>
        Increase the loot obtained from cheese monster corpses <br />
        Currently: {$cheeseMonsterLootAmount} cheese brains
      </UpgradeButton>

      <UpgradeButton upgradeName="cheeseMonsterSentience" {buyMaxUpgrades}>
        Improve the sentience of cheese monsters <br />
        Currently: +{formatNumber($monsterThoughtFactor, 2)}x thoughts/s/monster
      </UpgradeButton>
    </div>

    <div class="gridColumn">
      <UnlockButton unlock={unlocks.cheeseMonsterMassacre}>
        Massacre effect: When killing many cheese monsters at once, the loot is massively boosted
      </UnlockButton>

      <UnlockButton unlock={unlocks.cheeseMonsterCollectiveSentience}>
        Collective sentience: The bigger the population, the higher the resource multipliers per cheese monster
      </UnlockButton>

      <UnlockButton unlock={unlocks.cheeseMonsterTotalDeathsBoost}>
        Total cheese monster deaths boost loot <br />

        {#if $unlocked.cheeseMonsterTotalDeathsBoost}
          Currently: {formatNumber($totalMonsterDeathsLootBoost, 2)}x
        {/if}
      </UnlockButton>
    </div>
  </div>
</Window>

<style>
  * {
    --unlockedColor: rgb(255, 0, 98);
    --maxedColor: var(--unlockedColor);
  }
  .colorText {
    color: var(--unlockedColor);
  }

  table {
    margin-top: 4px;
    margin-left: 0px;
    outline: 1px rgb(119, 119, 119) solid;
  }
  .name {
    width: 100px;
  }
  fieldset {
    width: 178px;
    height: fit-content;
  }
  #brainWaveContainer {
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
