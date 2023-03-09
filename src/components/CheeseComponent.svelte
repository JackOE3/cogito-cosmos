<script lang="ts">
  import { formatNumber, formatWhole } from '../gamelogic/utils'
  import { fade, slide } from 'svelte/transition'
  import ProgBar from './ProgBar.svelte'
  import Window from './Window.svelte'
  import UpgradeButton from './UpgradeButton.svelte'
  import UnlockButton from './UnlockButton.svelte'
  import InputRange from './InputRange.svelte'
  import {
    LORCA_OVERRIDE,
    resource,
    unlocked,
    upgrades,
    currentThoughtBoost,
    currentCheeseQueue,
    cheeseFactoryMode,
    cheeseQueueTotalCycles,
    type CheeseFactoryMode,
  } from '../stores/mainStore'
  import {
    cheeseModeFactor,
    cheeseCycleCost,
    cheeseCycleDuration,
    cheeseCycleBatchSize,
    cheeseQueue,
    maxCheeseQueue,
    cheeseYieldDeltaDuration,
    cheeseSpeedFactor,
    cheeseQueueLengthBoostFactor,
    cheeseCycleAcceleratorFactor,
  } from '../stores/derived/cheese'
  import { cheeseThoughtMult, cheeseCyclesThoughtMult } from '../stores/derived/thoughts'
  import { unlocks } from '../stores/unlocks'
  // import { tooltip } from './tooltips/tooltip'

  const cheeseModeDescription: Record<CheeseFactoryMode, string> = {
    meticulous: '"Quality over quantity"',
    nominal: 'Everything is working nominally.',
    warpSpeed: 'Trains the hand speed of your workers.',
  }

  const buyMaxUpgrades = false
  // extracting the stores from the cheeseQueue object
  const cheeseQueueYield = cheeseQueue.yield
  const cheeseQueueCycleDuration = cheeseQueue.cycleDuration

  // 1 if it's active, 0 when not
  $: cheeseQueueActive = cheeseQueue.state === 'running'
  $: cheesePerSecFromQueue = +cheeseQueueActive * 1000 * ($cheeseCycleBatchSize / $cheeseCycleDuration)

  let cheeseBarProgress = 0
  let lastTime: number | null = null
  /**
   * Triggered when manually starting the cheese generation (with button or input range)
   */
  function handleCheeseGenerationInit(): void {
    if ($resource.thoughts < $cheeseCycleCost || cheeseQueue.state === 'running') return
    $resource.thoughts -= $cheeseCycleCost
    if ($currentCheeseQueue >= 1) $currentCheeseQueue--
    cheeseQueue.state = 'running'

    lastTime = null
    requestAnimationFrame(animateCheeseBar)
  }

  function animateCheeseBar(currentTime: number): void {
    if (lastTime === null) lastTime = currentTime
    const deltaTimeMillis = Math.max(Math.min(currentTime - lastTime), 0)
    lastTime = currentTime
    // the value of cheeseBarProgress is fed to CSS
    cheeseBarProgress += deltaTimeMillis
    while (cheeseBarProgress >= $cheeseCycleDuration) {
      handleCheeseGeneration()
      // console.log('Completed a cycle with ' + $cheeseCycleDuration, cheeseBarProgress)
      cheeseBarProgress -= $cheeseCycleDuration
      if (cheeseBarProgress < $cheeseCycleDuration) cheeseBarProgress = 0
    }
    if (cheeseQueue.state === 'running') requestAnimationFrame(animateCheeseBar)
  }

  /**
   * This function shall be called whenever the cheese bar completes a cycle.
   */
  function handleCheeseGeneration(): void {
    $resource.cheese += $cheeseCycleBatchSize

    if (!cheeseQueue.infinite && !$currentCheeseQueue) {
      // 'initial' better than 'paused', because the animation might've already started a small bit
      cheeseQueue.state = 'initial'
      return
    }
    if ($resource.thoughts < $cheeseCycleCost) {
      cheeseQueue.state = 'initial'
      return
    }

    $resource.thoughts -= $cheeseCycleCost
    if ($currentCheeseQueue >= 1) $currentCheeseQueue--
    if ($unlocked.cheeseCycleAccelerator || $LORCA_OVERRIDE) $cheeseQueueTotalCycles++
  }
</script>

<Window title="Switzerland Simulator" --bg="linear-gradient(90deg, rgb(121, 119, 0) 0%, yellow 100%)">
  <div>
    <span class="resourceDisplay"
      >You have {formatNumber($resource.cheese, 2)} <strong style="color:yellow">cheese</strong> <br />
    </span>
    ~ {formatNumber(cheesePerSecFromQueue, 2)}/s
  </div>

  {#if $unlocked.cheeseModes || $LORCA_OVERRIDE}
    <div id="cheeseFactoryProtocolContainer" transition:slide={{ duration: 1000 }}>
      <fieldset>
        <legend>cheese factory protocol</legend>

        <label>
          <input type="radio" name="cheeseFactoryMode" bind:group={$cheeseFactoryMode} value="meticulous" />
          meticulous
        </label>
        <label>
          <input type="radio" name="cheeseFactoryMode" bind:group={$cheeseFactoryMode} value="nominal" />
          nominal
        </label>
        <label>
          <input type="radio" name="cheeseFactoryMode" bind:group={$cheeseFactoryMode} value="warpSpeed" />
          warp speed
        </label>
      </fieldset>
      <div id="cheeseFactoryProtocolInfo">
        <strong class="colorText" style="text-decoration: underline;">Cheesy Info</strong> <br />
        <span>
          <p style="margin:0">{cheeseModeDescription[$cheeseFactoryMode]}</p>
          Relative yield/duration/cost: {$cheeseModeFactor.yield}x / {$cheeseModeFactor.duration}x / {$cheeseModeFactor.cost}x
          <br />
          {#if $cheeseFactoryMode === 'warpSpeed'}
            In this mode you are unable to produce byprodcuts.
          {/if}
        </span>
      </div>
    </div>
  {/if}

  <div class="flexRowContainer">
    <button style="width:170px" on:click={handleCheeseGenerationInit} disabled={cheeseQueue.state === 'running'}>
      Make some cheese <br />
      Costs {formatNumber($cheeseCycleCost, 2)} thoughts
    </button>
  </div>
  <div>
    <div id="cheeseBar">
      <ProgBar
        --width="100%"
        --height="2rem"
        --barColor="yellow"
        --progress="{(100 * cheeseBarProgress) / $cheeseCycleDuration}%"
      />
    </div>
    <div style="width:500px">
      <p style="margin-left:4px; margin-top: 8px; margin-bottom: 0px">
        Industrious swiss workers are producing
        {formatNumber($cheeseCycleBatchSize, 2)} cheese every
        {formatNumber($cheeseCycleDuration / 1000, 2)}s while consuming
        {formatNumber($cheeseCycleCost, 2)} thoughts. (~{formatNumber(
          ($cheeseCycleCost / $cheeseCycleDuration) * 1000,
          2
        )}
        thoughts/s)
      </p>
      {#if $unlocked.cheeseCycleAccelerator}
        <p style="margin-left:4px; margin-top: 8px; margin-bottom: 0px" transition:fade={{ duration: 500 }}>
          Total Cheese Cycles completed: {formatWhole($cheeseQueueTotalCycles)}
        </p>
      {/if}
    </div>
  </div>

  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton
        upgradeName="cheeseYield"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.switzerland}
        tooltipText={`+${formatNumber(
          (($upgrades.cheeseYield.bought + 1) * $cheeseCycleBatchSize) / $cheeseQueueYield,
          2
        )} cheese per cycle <br>
          +${formatNumber(
            (cheeseYieldDeltaDuration * $cheeseCycleDuration) / $cheeseQueueCycleDuration / 1000,
            2
          )}s cycle duration`}
      >
        Your workers create more cheese but also take longer ({$upgrades.cheeseYield.bought})
      </UpgradeButton>
    </div>
    <div class="gridColumn">
      <UpgradeButton
        upgradeName="cheeseDuration"
        {buyMaxUpgrades}
        --maxedColor="yellow"
        btnUnlocked={$unlocked.switzerland}
        tooltipText={`cycle duration x${formatNumber(cheeseSpeedFactor.duration, 2)} <br> 
          thoughts required x${formatNumber(cheeseSpeedFactor.cost, 2)} <br> (both multiplicative)`}
      >
        The cheese production takes <strong>{formatNumber((1 - cheeseSpeedFactor.duration) * 100, 0)}%</strong>
        less time, but costs <strong>{formatNumber(cheeseSpeedFactor.cost, 2)}x</strong> more ({formatWhole(
          $upgrades.cheeseDuration.bought
        )}/50)
      </UpgradeButton>
    </div>
  </div>

  <div class="flexRowContainer">
    <div style="width:250px; margin-top:4px;">
      {#if $unlocked.cheeseQueue}
        <div transition:fade={{ duration: 1000 }}>
          <div class="slidecontainer">
            <InputRange
              min={0}
              max={$maxCheeseQueue}
              bind:value={$currentCheeseQueue}
              onChange={handleCheeseGenerationInit}
            />
          </div>
          <p>There are currently {$currentCheeseQueue} batches in queue.</p>
        </div>
      {:else}
        <div style="margin-top:10px; text-align: center;">???</div>
      {/if}
    </div>
    <div class="gridColumn">
      <UpgradeButton
        upgradeName="cheeseQueueLength"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.cheeseQueue}
        tooltipText={`Length +${cheeseQueue.capDelta}`}
      >
        Lengthen the <strong style="color:yellow">Cheese Queue</strong> ({$upgrades.cheeseQueueLength.bought}) <br />
        Current Length: {$maxCheeseQueue}
      </UpgradeButton>
    </div>
  </div>

  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton upgradeName="cheeseThoughtMult" {buyMaxUpgrades} btnUnlocked={$unlocked.cheeseQueue}>
        Cheese increases thoughts/s ({$upgrades.cheeseThoughtMult.bought})
        {#if $upgrades.cheeseThoughtMult.bought}
          <br />Currently: {formatNumber($cheeseThoughtMult, 2)}x
        {/if}
      </UpgradeButton>
    </div>
  </div>
</Window>

<Window --bg="linear-gradient(90deg, rgb(121, 119, 0) 0%, yellow 100%)">
  <div class="gridColumn">
    <UnlockButton unlock={unlocks.cheeseQueue}>
      <span>Unlock the <strong style="color:yellow">Cheese Queue</strong></span>
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseQueueLengthBoost} btnUnlocked={$unlocked.cheeseQueue}>
      Cheese Queue Length boosts cheese production<br />
      Currently: {formatNumber($cheeseQueueLengthBoostFactor, 2)}x
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseBoost} btnUnlocked={$unlocked.cheeseQueue}>
      Thought Boost also affects cheese production <br />
      Currently: {formatNumber($currentThoughtBoost, 2)}x
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseCycleAccelerator} btnUnlocked={$unlocked.cheeseQueueLengthBoost}>
      Cheese production speeds up based on amount of cycles completed <br />
      Current Speed Factor: {formatNumber($cheeseCycleAcceleratorFactor, 2)}x
    </UnlockButton>

    <UnlockButton
      unlock={unlocks.thoughtJerk}
      btnUnlocked={$unlocked.cheeseBoost}
      tooltipText={'something something per second cubed'}
    >
      Jerk(?) your thinking
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseModes} btnUnlocked={$unlocked.cheeseCycleAccelerator}>
      Unlock 3 modes to help manage your cheese production
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseCyclesBoostThoughts} btnUnlocked={$unlocked.cheeseModes}>
      Total cheese cycles boost your thinking <br />
      Currently: {formatNumber($cheeseCyclesThoughtMult, 2)}x
    </UnlockButton>

    <!-- <button on:click={() => unlockFeature("cheeseQueueToppedUp")} 
        disabled={$unlocked["cheeseQueueToppedUp"] || cheese < unlockCosts["cheeseQueueToppedUp"]}
        class:maxed={$unlocked["cheeseQueueToppedUp"]} transition:slide={{duration: 500}}
      >
        Activating Thought Boost automatically tops up the Cheese Queue <br> 
        Costs {formatWhole(unlockCosts["cheeseQueueToppedUp"])} cheese
      </button> -->
  </div>
</Window>

<style>
  * {
    --unlockedColor: yellow;
    --maxedColor: var(--unlockedColor);
  }
  .colorText {
    color: var(--unlockedColor);
  }
  #cheeseBar {
    height: 2rem;
  }
  #cheeseFactoryProtocolContainer {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
  #cheeseFactoryProtocolInfo {
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  fieldset {
    width: max-content;
  }
</style>
