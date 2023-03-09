<script lang="ts">
  import { formatNumber, formatWhole } from '../gamelogic/utils'
  import Window from './Window.svelte'
  import { derived } from 'svelte/store'
  import UpgradeButton from './UpgradeButton.svelte'
  import UnlockButton from './UnlockButton.svelte'
  import { unlocks } from '../stores/unlocks'
  import {
    LORCA_OVERRIDE,
    resource,
    unlocked,
    upgrades,
    currentThoughtBoost,
    currentCheeseQueue,
  } from '../stores/mainStore'
  import {
    thoughtBoostMax,
    thoughtBoostDuration,
    thoughtBoostMaxStacks,
    thoughtsPerSec,
    thoughtsPerSecBase,
  } from '../stores/derived/thoughts'
  import { maxCheeseQueue } from '../stores/derived/cheese'

  const GAME_FPS = 60
  let buyMaxUpgrades = false
  let thoughtBoostCurrentStacks = 0
  let currentThoughtBoostTime = 0
  const thoughtBoostDecay = 2000
  let thoughtBoostIntervalId: number

  // $: thoughtAccelDisplay = ($upgrades.thoughtJerk.bought + 1 )
  $: thoughtAccelDisplay = ($thoughtsPerSec / $upgrades.thoughtAcceleration.bought) * (1 - 1 / $thoughtsPerSecBase)
  $: thoughtJerkDisplay = $thoughtsPerSec / $thoughtsPerSecBase

  function handleThink(): void {
    if (!$unlocked.thoughtBoost) {
      $resource.thoughts += 1
      return
    }
    if ($unlocked.cheeseQueueToppedUp) $currentCheeseQueue = $maxCheeseQueue
    // set multiplier, which expires after a time and starts decaying
    $currentThoughtBoost = $thoughtBoostMax

    if ($unlocked.thoughtBoostStack) {
      if (thoughtBoostCurrentStacks < $thoughtBoostMaxStacks) {
        currentThoughtBoostTime += $thoughtBoostDuration
        thoughtBoostCurrentStacks++
      } else currentThoughtBoostTime = $thoughtBoostDuration * $thoughtBoostMaxStacks
    } else currentThoughtBoostTime = $thoughtBoostDuration

    clearInterval(thoughtBoostIntervalId)
    let lastRunTime = Date.now()
    let deltaT = 0

    thoughtBoostIntervalId = setInterval(() => {
      const currentTime = Date.now()
      deltaT = Math.max(Math.min(currentTime - lastRunTime, 1000), 0)
      lastRunTime = currentTime

      thoughtBoostCurrentStacks = Math.ceil(currentThoughtBoostTime / $thoughtBoostDuration)

      if (currentThoughtBoostTime > 0) {
        currentThoughtBoostTime -= deltaT
        if (currentThoughtBoostTime < 0) currentThoughtBoostTime = 0
      } else {
        thoughtBoostCurrentStacks = 0
        // decrement evenly over {thoughtBoostDecay} milliseconds
        $currentThoughtBoost -= (($thoughtBoostMax - 1) / thoughtBoostDecay) * GAME_FPS
        if ($currentThoughtBoost < 1) {
          // spooky
          clearInterval(thoughtBoostIntervalId)
          $currentThoughtBoost = 1
        }
      }
    }, 1000 / GAME_FPS)
  }

  // derived for UI so the DOM only updates when the specific value changes, not the object itself
  const thoughtAccelBought = derived(upgrades, $upg => $upg.thoughtAcceleration.bought)
  const thoughtJerkBought = derived(upgrades, $upg => $upg.thoughtJerk.bought)
  const thoughtBoostStrengthBought = derived(upgrades, $upg => $upg.thoughtBoostStrength.bought)
  const thoughtBoostDurationBought = derived(upgrades, $upg => $upg.thoughtBoostDuration.bought)
  const thoughtBoostStackBought = derived(upgrades, $upg => $upg.thoughtBoostStack.bought)
</script>

<Window title="Cogito Ergo Sum" --bg="linear-gradient(90deg, rgb(129, 0, 204) 0%, rgb(182, 122, 255) 100%)">
  <div style="position: absolute; right: 8px; top: 8px;">
    <input type="checkbox" name="buyMax" bind:checked={buyMaxUpgrades} />
    <label for="buyMax">Buy Max</label>
  </div>

  <div>
    <span class="resourceDisplay">You thought {formatNumber($resource.thoughts, 2)} times<br /></span>
    <span>
      {#if $unlocked.thinkPassively || LORCA_OVERRIDE}
        <span class:green={$currentThoughtBoost > 1}>{formatNumber($thoughtsPerSec, 2)}/s</span>
        {#if $currentThoughtBoost > 1}
          - {formatNumber($currentThoughtBoost, 2)}x for
          {formatNumber(currentThoughtBoostTime / 1000, 1)}s
          {#if $unlocked.thoughtBoostStack}
            - {thoughtBoostCurrentStacks}/{$thoughtBoostMaxStacks} Stack{$thoughtBoostMaxStacks > 1 ? 's' : ''}
          {/if}
        {:else}{''}{/if}
      {:else}
        _
      {/if}
    </span>
  </div>

  <div class="flexRowContainer">
    {#if $unlocked.thoughtBoost}
      <button on:click={handleThink}>
        Thought Boost <span class="iconify" data-icon="icon-park-outline:brain" /><br />
        x{formatNumber($thoughtBoostMax, 2)} thoughts/s for {formatNumber($thoughtBoostDuration / 1000, 2)}s
      </button>
    {:else}
      <button on:click={handleThink}>
        Think <br />
        (+1 thought)
      </button>
    {/if}
  </div>

  <div class="flexRowContainer">
    <div class="gridColumn">
      <span>Upgrades</span>

      <UpgradeButton
        upgradeName="thoughtAcceleration"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.thinkFaster}
        tooltipText={`+${formatNumber(thoughtAccelDisplay, 2)} thought${thoughtAccelDisplay > 1 ? 's' : ''}/s`}
      >
        Thought Acceleration ({$thoughtAccelBought})
      </UpgradeButton>

      <UpgradeButton
        upgradeName="thoughtJerk"
        {buyMaxUpgrades}
        btnUnlocked={$unlocked.thoughtJerk}
        tooltipText={`Effect of Thought Acceleration +${formatNumber(thoughtJerkDisplay, 2)}`}
      >
        Thought Jerk ({$thoughtJerkBought})
      </UpgradeButton>

      <UpgradeButton upgradeName="thoughtBoostStrength" {buyMaxUpgrades} btnUnlocked={$unlocked.thoughtBoost}>
        Increase strength of Thought Boost ({$thoughtBoostStrengthBought}) <br />
        Currently: {formatNumber($thoughtBoostMax, 2)}x
      </UpgradeButton>

      <UpgradeButton upgradeName="thoughtBoostDuration" {buyMaxUpgrades} btnUnlocked={$unlocked.thoughtBoost}>
        Increase duration of Thought Boost ({$thoughtBoostDurationBought}) <br />
        Currently: {formatNumber($thoughtBoostDuration / 1000, 2)}s
      </UpgradeButton>

      <UpgradeButton upgradeName="thoughtBoostStack" {buyMaxUpgrades} btnUnlocked={$unlocked.thoughtBoostStack}>
        Increase the maximum stack size of Thought Boosts ({$thoughtBoostStackBought}/20) <br />
        Currently: {formatWhole($thoughtBoostMaxStacks)}
      </UpgradeButton>
    </div>

    <div class="gridColumn">
      <span>Unlocks</span>

      <UnlockButton
        unlock={unlocks.thinkPassively}
        btnHidden={$unlocked.thinkPassively}
        tooltipText={'"I think, therefore I am."'}
      >
        Learn to think passively
      </UnlockButton>

      <UnlockButton
        unlock={unlocks.thinkFaster}
        btnUnlocked={$unlocked.thinkPassively}
        btnHidden={$unlocked.thinkFaster}
        tooltipText={'Really makes you think...'}
      >
        Accelerate your thinking
      </UnlockButton>

      <UnlockButton
        unlock={unlocks.thoughtBoost}
        btnUnlocked={$unlocked.thinkFaster}
        btnHidden={$unlocked.thoughtBoost}
        tooltipText={'"i dont want to spam click a gazillion times to play ur stupid game" <br> <strong>- HentaiEnjoyer1978'}
      >
        Boost your thinking
      </UnlockButton>

      <UnlockButton
        unlock={unlocks.switzerland}
        btnUnlocked={$unlocked.thoughtBoost}
        tooltipText={'The land of cheese'}
        --btn-bg="linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)"
      >
        <span style="font-weight:bold; font-size: 16px; text-shadow:1px 1px 2px black;">Travel to Switzerland</span>
      </UnlockButton>

      <UnlockButton
        unlock={unlocks.thoughtBoostStack}
        btnUnlocked={$unlocked.cheeseQueue}
        tooltipText={'Viagra for the brain'}
      >
        Ability to stack Thought Boosts
      </UnlockButton>

      <UnlockButton unlock={unlocks.moldyCheese} btnUnlocked={$unlocked.cheeseQueue} tooltipText={'Is it okay to eat?'}>
        Unlock Moldy Cheese
      </UnlockButton>

      <UnlockButton
        unlock={unlocks.milk}
        btnUnlocked={$unlocked.cheeseyard}
        tooltipText={'From cheese you get milk...I think.'}
      >
        <span>Unlock <strong>Milk</strong></span>
      </UnlockButton>
    </div>
  </div>
</Window>

<style>
  * {
    --unlockedColor: var(--primary);
    --maxedColor: var(--unlockedColor);
  }
  .colorText {
    color: rgb(60, 255, 0);
  }
  .green {
    color: rgb(0, 216, 0);
    font-weight: bold;
  }
  label {
    display: inline-block;
  }
</style>
