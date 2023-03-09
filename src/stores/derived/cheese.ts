import { derived } from 'svelte/store'
import { unlocked } from '../unlocks'
import { upgrades } from '../upgrades'
import { type CheeseFactoryMode, cheeseFactoryMode, cheeseQueueTotalCycles, currentThoughtBoost } from '../mainStore'

export const cheeseSpeedFactor = { duration: 0.95, cost: 1.4 }
export const cheeseYieldDeltaDuration = 500 // ms

export const cheeseModeStats: Record<CheeseFactoryMode, { yield: number; duration: number; cost: number }> = {
  meticulous: { yield: 1, duration: 10, cost: 1 },
  nominal: { yield: 1, duration: 1, cost: 1 },
  warpSpeed: { yield: 1 / 100, duration: 1 / 10, cost: 1 / 10 },
}
export const cheeseModeFactor = derived(cheeseFactoryMode, $cheeseFactoryMode => cheeseModeStats[$cheeseFactoryMode])

export const cheeseQueue = {
  infinite: false,
  state: 'initial',
  capDelta: 5,
  cycleDuration: derived(upgrades, $upgrades => 1000 + cheeseYieldDeltaDuration * $upgrades.cheeseYield.bought), // milliseconds
  yield: derived(
    upgrades,
    $upgrades => 1 + 0.5 * ($upgrades.cheeseYield.bought + $upgrades.cheeseYield.bought * $upgrades.cheeseYield.bought)
  ),
  cost: derived(upgrades, $upgrades => 100 * Math.pow(cheeseSpeedFactor.cost, $upgrades.cheeseDuration.bought)),
}

export const maxCheeseQueue = derived(
  upgrades,
  $upgrades => 5 + cheeseQueue.capDelta * $upgrades.cheeseQueueLength.bought
)

export const cheeseCycleAcceleratorFactor = derived(
  [unlocked, cheeseQueueTotalCycles],
  ([$unlocked, $cheeseQueueTotalCycles]) =>
    $unlocked.cheeseCycleAccelerator ? 1 + Math.log($cheeseQueueTotalCycles / 100 + 1) : 1
)

export const cheeseQueueSpeedFactor = derived(upgrades, $upgrades =>
  Math.pow(cheeseSpeedFactor.duration, $upgrades.cheeseDuration.bought)
)

export const cheeseBoostFactorYield = derived([unlocked, currentThoughtBoost], ([$unlocked, $currentThoughtBoost]) =>
  $unlocked.cheeseBoost ? $currentThoughtBoost : 1
)

export const cheeseQueueLengthBoostFactor = derived([unlocked, maxCheeseQueue], ([$unlocked, $maxCheeseQueue]) =>
  $unlocked.cheeseQueueLengthBoost ? $maxCheeseQueue / 10 : 1
)

/* Reactive variables for Yield, Duration & Cost of the cheese cycle */

export const cheeseCycleBatchSize = derived(
  [cheeseQueue.yield, cheeseQueueLengthBoostFactor, cheeseBoostFactorYield, cheeseModeFactor],
  ([$cheeseQueueYield, $cheeseQueueLengthBoostFactor, $cheeseBoostFactorYield, $cheeseModeFactor]) =>
    $cheeseQueueYield * $cheeseQueueLengthBoostFactor * $cheeseBoostFactorYield * $cheeseModeFactor.yield
)

export const cheeseCycleDuration = derived(
  [cheeseQueue.cycleDuration, cheeseQueueSpeedFactor, cheeseModeFactor, cheeseCycleAcceleratorFactor],
  ([$cheeseQueueCycleDuration, $cheeseQueueSpeedFactor, $cheeseModeFactor, $cheeseCycleAcceleratorFactor]) =>
    $cheeseQueueCycleDuration *
    $cheeseQueueSpeedFactor *
    $cheeseModeFactor.duration *
    (1 / $cheeseCycleAcceleratorFactor)
)

export const cheeseCycleCost = derived(
  [cheeseQueue.cost, cheeseModeFactor],
  ([$cheeseQueueCost, $cheeseModeFactor]) => $cheeseQueueCost * $cheeseModeFactor.cost
)
