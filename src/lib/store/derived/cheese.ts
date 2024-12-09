import { derived } from 'svelte/store'
import { unlocked } from '../primitive/unlocks'
import { upgrades } from '../primitive/upgrades'
import { type CheeseFactoryMode, cheeseFactoryMode, cheeseQueueTotalCycles, currentThoughtBoost, cheeseQueueOverclockLvl } from '../primitive'
import { checkBoolForNum } from '../../gamelogic/utils'

export const cheeseSpeedFactor = { duration: 0.95, cost: 1.4 }
export const cheeseYieldDeltaDuration = 500 // ms

// cost is now DEPRECATED with the duration of the cheeseQueue being inherently linked with the cost! (DELETE LATER)
export const cheeseModeStats: Record<CheeseFactoryMode, { yield: number; duration: number; cost: number }> = {
    meticulous: { yield: 1, duration: 10, cost: 1 },
    nominal: { yield: 1, duration: 1, cost: 1 },
    warpSpeed: { yield: 1 / 100, duration: 1 / 10, cost: 1 / 10 }
}
export const cheeseModeFactor = derived(cheeseFactoryMode, $cheeseFactoryMode => cheeseModeStats[$cheeseFactoryMode])

export const cheeseQueueCostDivideBy = derived(upgrades, $upgrades =>
    $upgrades.cheeseQueueOverclockingCost.bought > 0
        ? 1 + 0.25 * ($upgrades.cheeseQueueOverclockingCost.bought + 1) * ($upgrades.cheeseQueueOverclockingCost.bought + 1)
        : 1
)

export const cheeseQueueOverclockSpeedMult = derived(cheeseQueueOverclockLvl, $cheeseQueueOverclockLvl => Math.pow(1.05, $cheeseQueueOverclockLvl))
export const cheeseQueueOverclockCostMult = derived(cheeseQueueOverclockLvl, $cheeseQueueOverclockLvl => 1 * Math.pow(2, $cheeseQueueOverclockLvl))

const baseCost = 10
export const cheeseQueue = {
    infinite: false,
    state: 'initial',
    capDelta: 5,
    cycleDuration: derived(upgrades, $upgrades => 1000 + cheeseYieldDeltaDuration * $upgrades.cheeseYield.bought), // milliseconds
    yield: derived(upgrades, $upgrades => 1 + 0.5 * ($upgrades.cheeseYield.bought + $upgrades.cheeseYield.bought * $upgrades.cheeseYield.bought)),
    cost: derived([cheeseQueueOverclockCostMult, cheeseQueueCostDivideBy], ([$cheeseQueueOverclockCostMult, $cheeseQueueCostDivideBy]) => {
        return (baseCost * $cheeseQueueOverclockCostMult) / $cheeseQueueCostDivideBy
    })
}

export const maxCheeseQueue = derived(upgrades, $upgrades => 5 + cheeseQueue.capDelta * $upgrades.cheeseQueueLength.bought)

export const cheeseCycleAcceleratorFactor = derived([unlocked, cheeseQueueTotalCycles], ([$unlocked, $cheeseQueueTotalCycles]) =>
    checkBoolForNum($unlocked.cheeseCycleAccelerator, 1 + Math.log($cheeseQueueTotalCycles / 100 + 1))
)

export const cheeseBoostFactorYield = derived([unlocked, currentThoughtBoost], ([$unlocked, $currentThoughtBoost]) =>
    checkBoolForNum($unlocked.cheeseBoost, $currentThoughtBoost)
)

export const cheeseQueueLengthBoostFactor = derived([unlocked, maxCheeseQueue], ([$unlocked, $maxCheeseQueue]) =>
    checkBoolForNum($unlocked.cheeseQueueLengthBoost, ($maxCheeseQueue * $maxCheeseQueue) / 100)
)

/* Reactive variables for Yield, Duration & Cost of the cheese cycle */

export const cheeseCycleBatchSize = derived(
    [cheeseQueue.yield, cheeseQueueLengthBoostFactor, cheeseBoostFactorYield, cheeseModeFactor],
    ([$cheeseQueueYield, $cheeseQueueLengthBoostFactor, $cheeseBoostFactorYield, $cheeseModeFactor]) =>
        $cheeseQueueYield * $cheeseQueueLengthBoostFactor * $cheeseBoostFactorYield * $cheeseModeFactor.yield
)

export const cheeseCycleDuration = derived(
    [cheeseQueue.cycleDuration, cheeseQueueOverclockSpeedMult, cheeseModeFactor, cheeseCycleAcceleratorFactor],
    ([$cheeseQueueCycleDuration, $cheeseQueueOverclockSpeedMult, $cheeseModeFactor, $cheeseCycleAcceleratorFactor]) =>
        $cheeseQueueCycleDuration * (1 / $cheeseQueueOverclockSpeedMult) * $cheeseModeFactor.duration * (1 / $cheeseCycleAcceleratorFactor)
)

export const cheeseCycleCost = derived(
    [cheeseQueue.cost, cheeseModeFactor],
    ([$cheeseQueueCost, $cheeseModeFactor]) => $cheeseQueueCost * $cheeseModeFactor.cost
)
