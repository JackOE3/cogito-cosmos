<script lang="ts">
  import Window from './window-model/Window.svelte'
  import AffixComponent from '../AffixComponent.svelte'
  import Affix from '../Affix.svelte'
  import { formatNumber, formatTime, formatWhole } from '@gamelogic/utils'
  import { fade, slide } from 'svelte/transition'
  import ProgBar from '../misc/ProgBar.svelte'
  import UpgradeButton from '../UpgradeButton.svelte'
  import InputRange from '../misc/InputRange.svelte'
  import {
    LORCA_OVERRIDE,
    resource,
    upgrades,
    unlocked,
    currentCheeseQueue,
    cheeseQueueOverclockLvl,
    cheeseFactoryMode,
    cheeseQueueTotalCycles,
    type CheeseFactoryMode,
    currentThoughtBoost,
  } from '@store'
  import {
    cheeseModeFactor,
    cheeseCycleDuration,
    cheeseCycleBatchSize,
    cheeseCycleCost,
    cheeseQueueCostDivideBy,
    cheeseCycleBase,
    cheeseQueueActive,
    cheeseQueueOverclockSpeedMult,
    maxCheeseQueue,
    cheeseYieldDeltaDuration,
    cheeseQueueLengthBoostFactor,
    cheeseCycleAcceleratorFactor,
    cheeseThoughtMult,
    cheeseCyclesThoughtMult,
    unlocks,
    UnlockName,
  } from '@store'
  import UnlockDrawer from '../UnlockDrawer.svelte'
  import { tooltip } from '../tooltips/tooltip'

  const cheeseModeDescription: Record<CheeseFactoryMode, string> = {
    meticulous: '"Quality over quantity"',
    nominal: 'Everything is working nominally.',
    warpSpeed: 'Trains the hand speed of your workers.',
  }

  const buyMaxUpgrades = false
  // extracting the stores from the cheeseCycleBase object
  const cheeseCycleBaseYield = cheeseCycleBase.yield
  const cheeseCycleBaseDuration = cheeseCycleBase.duration
  const cheeseCycleBaseCost = cheeseCycleBase.cost

  // 1 if it's active, 0 when not
  // $: cheeseQueueActive = cheeseCycleBase.state === 'running'
  $: cheesePerSecFromQueue = +$cheeseQueueActive * 1000 * ($cheeseCycleBatchSize / $cheeseCycleDuration)

  let cheeseBarProgress = 0
  let lastTime: number | null = null

  function resetCheeseBar(): void {
    cheeseBarProgress = 0
  }
  /**
   * Triggered when manually starting the cheese generation (with button or input range)
   */
  function handleCheeseGenerationInit(): void {
    if ($resource.thoughts < $cheeseCycleCost || $cheeseQueueActive) return
    $resource.thoughts -= $cheeseCycleCost
    if ($currentCheeseQueue >= 1) $currentCheeseQueue--
    cheeseQueueActive.set(true)

    lastTime = null

    /* TODO: insert here logic for if cheeseCycleBaseDuration exceeds a certain speed, then no animation, just a static bar with
    statistical averages for calculations */
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
    if ($cheeseQueueActive) requestAnimationFrame(animateCheeseBar)
  }

  /**
   * This function shall be called whenever the cheese bar completes a cycle.
   */
  function handleCheeseGeneration(): void {
    $resource.cheese += $cheeseCycleBatchSize

    if (!cheeseCycleBase.infinite && !$currentCheeseQueue) {
      // 'initial' better than 'paused', because the animation might've already started a small bit
      cheeseQueueActive.set(false)
      return
    }
    if ($resource.thoughts < $cheeseCycleCost) {
      cheeseQueueActive.set(false)
      return
    }

    $resource.thoughts -= $cheeseCycleCost
    if ($currentCheeseQueue >= 1) $currentCheeseQueue--
    $cheeseQueueTotalCycles++
  }
</script>

<Window title="Switzerland Simulator" themeColor1="rgb(168, 143, 2)" themeColor2="rgb(244, 255, 33)">
  <div>
    <span class="resourceDisplay"
      >You have {formatNumber($resource.cheese, 2)} <span class="colorText" style="font-weight:bold">cheese</span>
      <br />
    </span>
    ~ {formatNumber(cheesePerSecFromQueue, 2)}/s
  </div>

  <div>
    <div class="flexRowContainer">
      <button style="width:170px;" on:click={handleCheeseGenerationInit} disabled={$cheeseQueueActive}>
        Make cheese <br />
        {formatNumber($cheeseCycleCost, 2)} thoughts
      </button>

      <div class="gridColumn" style="width: 100%">
        <div id="cheeseBar">
          <ProgBar
            --width="100%"
            --height="24px"
            --barColor="yellow"
            --progress="{(100 * cheeseBarProgress) / $cheeseCycleDuration}%"
          />
        </div>

        <div style="width:100%; height: 16px; margin-top:4px;">
          {#if $unlocked.cheeseQueue}
            <div
              transition:fade={{ duration: 1000 }}
              style="display:grid; grid-template-columns: auto 1fr auto; gap: 8px"
            >
              <span class="flexCenter">Cheese Queue:</span>

              <InputRange
                min={0}
                max={$maxCheeseQueue}
                bind:value={$currentCheeseQueue}
                onChange={handleCheeseGenerationInit}
              />

              <span class="flexCenter" style="width: 40px; background: var(--Gray800);">{$currentCheeseQueue}</span>
            </div>
          {:else}
            <div style="text-align: center;">???</div>
          {/if}
        </div>
      </div>
    </div>

    <p style="margin-bottom: 0px; margin-top: 8px; height: 1.625rem;">
      Industrious swiss workers are producing
      {formatNumber($cheeseCycleBatchSize, 2)}<!--
    -->{#if $cheeseModeFactor.yield !== 1}
        <span style="color:orange;">[{$cheeseModeFactor.yield}x]</span>
      {/if} cheese every
      {formatTime($cheeseCycleDuration / 1000)}<!--
      -->{#if $cheeseModeFactor.duration !== 1}
        <span style="color:orange;">[{$cheeseModeFactor.duration}x]</span>
      {/if}
      <span transition:fade={{ duration: 1000 }}>
        while consuming {formatNumber($cheeseCycleCost, 2)}<!--
        -->{#if $cheeseModeFactor.cost !== 1}
          <span style="color:orange;">[{$cheeseModeFactor.cost}x]</span>
        {/if}
        thoughts. (~{formatNumber(($cheeseCycleCost / $cheeseCycleDuration) * 1000, 2)}
        thoughts/s)
      </span>
    </p>
  </div>

  {#if $unlocked.cheeseQueueOverclocking || $LORCA_OVERRIDE}
    <div class="flexRowContainer" transition:slide={{ duration: 1000 }}>
      <div style="display:flex; flex-direction:row; gap: 2px;">
        <div
          style="display:flex; flex-direction:column; background-color: var(--Gray800)"
          class="button-border"
          use:tooltip={{
            data: 'Increases the speed of a cheese cycle. <br> Every level increases SPEED by 5%, but doubles the COST. <br> (multiplicative)',
          }}
        >
          <div
            style="height:1.25rem; border-bottom: 2px solid rgba(255, 255, 255, 0.4); display:flex; align-items: center; justify-content: center; gap: 0.5rem"
          >
            <span style="font-size:.875rem; font-weight: bold"> Overclocking </span>
            <span style="font-size:.875rem;">LV{$cheeseQueueOverclockLvl}</span>
          </div>

          <div style="height:2.5rem; display:flex; flex-direction:row; ">
            <div
              style="width: 4rem; display:flex; flex-direction:column; justify-content:center; align-items: center; gap: 0.125rem "
            >
              <span
                style="font-weight: bold; color:white; background: rgb(10, 125, 16); padding-left:0.25rem; padding-right: 0.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.4); "
              >
                SPEED
              </span>
              <span> {formatNumber($cheeseQueueOverclockSpeedMult, 2)} Hz</span>
            </div>
            <div
              style="width: 10rem; display:flex; flex-direction:column;  justify-content:center; align-items: center; gap: 0.125rem; border-left: 2px solid rgba(255, 255, 255, 0.4)"
            >
              <span
                style="font-weight: bold; color:white; background: rgb(115, 0, 2); padding-left:0.25rem; padding-right: 0.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.4); "
              >
                COST
              </span>
              <span> {formatNumber($cheeseCycleBaseCost, 2)} thoughts/cycle</span>
            </div>
          </div>
        </div>
        <div style="width: 100%; display:flex; flex-direction:column; justify-content: space-between">
          <button style="height: 2rem; width: 2rem" on:click={() => $cheeseQueueOverclockLvl++}>
            <img
              alt="+1 level"
              src="assets/chevron-arrow-down.png"
              style="width: 50%; transform: rotate(180deg); filter: invert(100%); "
            />
          </button>
          <button style="height: 2rem; width: 2rem" on:click={() => $cheeseQueueOverclockLvl--}>
            <img alt="-1 level" src="assets/chevron-arrow-down.png" style="width: 50%; filter: invert(100%); " />
          </button>
        </div>
      </div>
      <div>
        {#if $unlocked.cheeseCycleAccelerator}
          <span transition:fade={{ duration: 500 }}>
            Total Cheese Cycles: {formatWhole($cheeseQueueTotalCycles)} <br />
            Cycle Duration: {formatNumber($cheeseCycleDuration / 1000, 2)}s <br />
          </span>
        {/if}
      </div>
    </div>
  {/if}

  {#if $unlocked.cheeseModes || $LORCA_OVERRIDE}
    <div id="cheeseFactoryProtocolContainer" transition:slide={{ duration: 1000 }}>
      <fieldset on:change={resetCheeseBar}>
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
        <span class="colorText" style="text-decoration: underline; font-weight: bold">Cheesy Info</span> <br />
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

  <UnlockDrawer unlocks={unlocks.cheese} folderName="Free 50 Aeromancer Skills" />

  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton
        upgradeName="cheeseYield"
        {buyMaxUpgrades}
        tooltipText={`+${formatNumber(
          (($upgrades.cheeseYield.bought + 1) * $cheeseCycleBatchSize) / $cheeseCycleBaseYield,
          2
        )} 
        cheese per cycle <br>
        +${formatTime((cheeseYieldDeltaDuration * $cheeseCycleDuration) / $cheeseCycleBaseDuration / 1000)} 
        cycle duration <br>(without scaling: +0.5s cycle duration)`}
      >
        Your workers create more cheese but also take longer
      </UpgradeButton>

      <UpgradeButton
        upgradeName="cheeseQueueLength"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.cheeseQueue}
        tooltipText={`+${5} capacity <br> Currently: ${$maxCheeseQueue}`}
      >
        <span>Lengthen the <span style="color:yellow; font-weight: bold">Cheese Queue</span></span>
      </UpgradeButton>

      <UpgradeButton
        upgradeName="cheeseThoughtMult"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.cheeseQueue}
        tooltipText={`Currently: ${
          $upgrades.cheeseThoughtMult.bought * $upgrades.cheeseThoughtMult.bought
        }x <br> Scales ^2 with #upgrades`}
      >
        {#if $upgrades.cheeseThoughtMult.bought === 0}
          Cheese increases thought gain
        {:else}
          Increase effect of cheese boosting thought gain
        {/if}
      </UpgradeButton>

      <UpgradeButton
        upgradeName="cheeseQueueOverclockingCost"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.cheeseQueueCostDivide}
        tooltipText={`Current Divisor: ${formatNumber($cheeseQueueCostDivideBy, 2)}`}
      >
        Divide the cost requirement of Overclocking <br />
      </UpgradeButton>
    </div>

    <div class="gridColumn" style="height:264px; width: 100%">
      <AffixComponent
        title={$upgrades.cheeseThoughtMult.bought > 0 || $unlocked.cheeseQueueLengthBoost ? 'Affixes' : '???'}
      >
        <Affix
          factor={$cheeseThoughtMult}
          unlocked={$upgrades.cheeseThoughtMult.bought > 0}
          tooltipText={`Scaling: log(cheese) &times; ${
            $upgrades.cheeseThoughtMult.bought * $upgrades.cheeseThoughtMult.bought
          }`}
        >
          Cheese increases thoughts/s
        </Affix>

        <Affix
          factor={$cheeseQueueLengthBoostFactor}
          unlocked={$unlocked.cheeseQueueLengthBoost}
          tooltipText="Scaling: capacity^2"
        >
          {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_QUEUE_LENGTH_BOOST)?.description}
        </Affix>

        <Affix factor={$currentThoughtBoost} unlocked={$unlocked.cheeseBoost}>
          {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_BOOST)?.description}
        </Affix>

        <Affix
          factor={$cheeseCycleAcceleratorFactor}
          unlocked={$unlocked.cheeseCycleAccelerator}
          tooltipText="Scaling: log(cycles)"
        >
          {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_CYCLE_ACCELERATOR)?.description}
        </Affix>

        <Affix
          factor={$cheeseCyclesThoughtMult}
          unlocked={$unlocked.cheeseCyclesBoostThoughts}
          tooltipText="Scaling: cycles^1.5"
        >
          {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_CYCLES_BOOST_THOUGHTS)?.description}
        </Affix>

        <!-- <Affix
          factor={moldyCheeseCycleDurationBoostFactor}
          unlocked={$unlocked.moldyCheeseCycleDurationBoost}
          tooltipText={`scales ^${moldyCheeseCycleDurationBoostExponent} with relative duration`}
        >
          MC byproduct gain is boosted by the rel. duration of the cheese cycle
        </Affix> -->
      </AffixComponent>
    </div>
  </div>
</Window>

<!-- <Window --width="max-content" --bg="linear-gradient(90deg, rgb(121, 119, 0) 0%, yellow 100%)">
  <div class="gridColumn">
    <UnlockButton unlock={unlocks.cheeseCycleBase}>
      <span>Unlock the <strong style="color:yellow">Cheese Queue</strong></span>
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseQueueLengthBoost} btnUnlocked={$unlocked.cheeseCycleBase}>
      Cheese Queue Length boosts cheese production<br />
      Currently: {formatNumber($cheeseQueueLengthBoostFactor, 2)}x
    </UnlockButton>

    <UnlockButton unlock={unlocks.cheeseBoost} btnUnlocked={$unlocked.cheeseCycleBase}>
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


  </div>
</Window> -->
<style>
  .colorText {
    color: var(--themeColor2);
  }
  #cheeseBar {
    width: 100%;
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
