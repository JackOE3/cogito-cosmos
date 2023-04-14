<script lang="ts">
  import Window from './window-model/Window.svelte'
  import UnlockDrawer from '../UnlockDrawer.svelte'
  import { formatNumber, formatTime } from '@gamelogic/utils'
  import UpgradeButton from '../UpgradeButton.svelte'
  import {
    unlocks,
    LORCA_OVERRIDE,
    resource,
    unlocked,
    upgrades,
    currentThoughtBoost,
    currentThoughtBoostTime,
    thoughtBoostMax,
    thoughtBoostDuration,
    thoughtBoostMaxStacks,
    thoughtsPerSec,
    thoughtsPerSecBase,
    UnlockName,
  } from '@store'

  import { onMount } from 'svelte'
  import { derived, get } from 'svelte/store'
  import EffectComponent from '../EffectComponent.svelte'
  import Effect from '../Effect.svelte'

  const buyMaxUpgrades = false
  let thoughtBoostCurrentStacks = 0
  const thoughtBoostDecay = 2000
  let lastTime: number | null = null
  let myReq: number

  $: thoughtAccelDisplay =
    $upgrades.thoughtAcceleration.bought > 0
      ? ($thoughtsPerSec / $upgrades.thoughtAcceleration.bought) * (1 - 1 / $thoughtsPerSecBase)
      : 1
  $: thoughtJerkDisplay = $thoughtsPerSec / $thoughtsPerSecBase

  function handleThink(): void {
    if (!$unlocked.thoughtBoost) {
      $resource.thoughts += 1
      return
    }
    // set multiplier, which expires after a time and starts decaying
    $currentThoughtBoost = $thoughtBoostMax

    if ($unlocked.thoughtBoostStack) {
      if (thoughtBoostCurrentStacks < $thoughtBoostMaxStacks) {
        $currentThoughtBoostTime += $thoughtBoostDuration
        thoughtBoostCurrentStacks++
      } else $currentThoughtBoostTime = $thoughtBoostDuration * $thoughtBoostMaxStacks
    } else $currentThoughtBoostTime = $thoughtBoostDuration

    cancelAnimationFrame(myReq)
    myReq = requestAnimationFrame(animateThoughtBoost)
  }

  function animateThoughtBoost(currentTime: number): void {
    if (lastTime === null) lastTime = currentTime
    const deltaT = Math.max(Math.min(currentTime - lastTime, 1000), 0)
    lastTime = currentTime

    if ($currentThoughtBoostTime > 0) {
      $currentThoughtBoostTime -= deltaT
      thoughtBoostCurrentStacks = Math.ceil($currentThoughtBoostTime / $thoughtBoostDuration)

      if ($currentThoughtBoostTime < 0) $currentThoughtBoostTime = 0
    } else {
      thoughtBoostCurrentStacks = 0
      // decrement evenly over {thoughtBoostDecay} milliseconds
      $currentThoughtBoost -= (($thoughtBoostMax - 1) / thoughtBoostDecay) * deltaT
      if ($currentThoughtBoost <= 1) {
        $currentThoughtBoost = 1
      }
    }
    if ($currentThoughtBoost > 1) myReq = requestAnimationFrame(animateThoughtBoost)
  }

  const thoughtBoostStrengthBought = derived(upgrades, $upgrades => $upgrades.thoughtBoostStrength.bought)
  // handle currentThoughtBoost being updated automatically when its strength is changed
  $: if ($thoughtBoostStrengthBought && get(currentThoughtBoostTime) > 0) currentThoughtBoost.set(get(thoughtBoostMax))

  onMount(() => {
    myReq = requestAnimationFrame(animateThoughtBoost)
  })
</script>

<Window title="Cogito Ergo Sum" themeColor1="rgb(129, 0, 204)" themeColor2="rgb(182, 122, 255)">
  <!-- <div style="position: absolute; right: 8px; top: 8px;">
    <input type="checkbox" name="buyMax" bind:checked={buyMaxUpgrades} />
    <label for="buyMax">Buy Max</label>
  </div> -->

  <div>
    <span class="resourceDisplay">
      You <span style="color:var(--themeColor2); font-weight:bold">thought</span>
      {formatNumber($resource.thoughts, 2)} times<br />
    </span>
    <span>
      {#if $unlocked.thinkPassively || LORCA_OVERRIDE}
        <span class:green={$currentThoughtBoost > 1}>{formatNumber($thoughtsPerSec, 2)}/s</span>
        {#if $currentThoughtBoost > 1}
          - {formatNumber($currentThoughtBoost, 2)}x
          {#if $currentThoughtBoostTime >= 100}
            for {formatTime($currentThoughtBoostTime / 1000, 1)}
            {#if $unlocked.thoughtBoostStack}
              - {thoughtBoostCurrentStacks}/{$thoughtBoostMaxStacks} Stack{$thoughtBoostMaxStacks > 1 ? 's' : ''}
            {/if}
          {/if}
        {/if}
      {/if}
    </span>
  </div>

  <div class="flexRowContainer">
    {#if $unlocked.thoughtBoost}
      <button on:click={handleThink}>
        Thought Boost <span class="iconify" data-icon="icon-park-outline:brain" /><br />
        x{formatNumber($thoughtBoostMax, 2)} thoughts/s for {formatTime($thoughtBoostDuration / 1000)}
      </button>
    {:else}
      <button on:click={handleThink}>
        Think <br />
        (+1 thought)
      </button>
    {/if}
  </div>

  <UnlockDrawer unlocks={unlocks.thoughts} folderName="Swordsman_Skill_Icons_Pack" />

  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton
        upgradeName="thoughtAcceleration"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.thinkFaster}
        tooltipText={`+${formatNumber(thoughtAccelDisplay, 2)} thought${thoughtAccelDisplay > 1 ? 's' : ''}/s`}
      >
        Thought Acceleration
      </UpgradeButton>

      <UpgradeButton
        upgradeName="thoughtJerk"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.thoughtJerk}
        tooltipText={`+${formatNumber(thoughtJerkDisplay, 2)} to Effect of Thought Acceleration `}
      >
        Thought Jerk
      </UpgradeButton>

      <UpgradeButton
        upgradeName="thoughtBoostStrength"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.thoughtBoost}
        tooltipText="Scales ^1.5 with #upgrades"
      >
        Increase the strength of Thought Boosts
      </UpgradeButton>

      <UpgradeButton
        upgradeName="thoughtBoostDuration"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.thoughtBoost}
        tooltipText="Duration +5s"
      >
        Increase the duration of Thought Boosts
      </UpgradeButton>

      <UpgradeButton
        upgradeName="thoughtBoostStack"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.thoughtBoostStack}
        tooltipText="Max stacks +1"
      >
        Increase the maximum stack size of Thought Boosts <br />
      </UpgradeButton>
    </div>

    <div class="gridColumn" style="height:332px; width: 100%">
      <EffectComponent
        title={$upgrades.cheeseThoughtMult.bought > 0 || $unlocked.cheeseQueueLengthBoost ? 'Effects' : '???'}
      >
        <Effect factor={$currentThoughtBoost} unlocked={$unlocked.cheeseBoost}>
          {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_BOOST)?.description}
        </Effect>
      </EffectComponent>
    </div>
  </div>
</Window>

<style>
  .green {
    color: rgb(0, 216, 0);
    font-weight: bold;
  }
</style>
