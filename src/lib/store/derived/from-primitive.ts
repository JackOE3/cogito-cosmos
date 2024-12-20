import { derived } from 'svelte/store'
import {
    unlocked,
    upgrades,
    resource,
    cheeseQueueTotalCycles,
    cheeseFactoryMode,
    cheeseQueueOverclockLvl,
    currentThoughtBoost,
    brainMode,
    totalCheeseMonsterDeaths,
    type CheeseFactoryMode,
    type BrainMode
} from '../primitive'
import { checkBoolForNum } from '$lib/gamelogic/utils'

export const thoughtBoostMax = derived(upgrades, $upgrades => 1.5 + 0.2 * Math.pow($upgrades.thoughtBoostStrength.bought, 1.5))
export const thoughtBoostDuration = derived(upgrades, $upgrades => 5000 + 5000 * $upgrades.thoughtBoostDuration.bought)
export const thoughtBoostMaxStacks = derived([upgrades, unlocked], ([$upgrades, $unlocked]) =>
    checkBoolForNum($unlocked.thoughtBoost, 2 + $upgrades.thoughtBoostStack.bought)
)

export const thoughtsPerSecBase = derived([unlocked, upgrades], ([$unlocked, $upgrades]) => {
    const fromBasicUpgrades = $upgrades.thoughtAcceleration.bought * (1 * $upgrades.thoughtJerk.bought + 1)

    return +$unlocked.thinkPassively + fromBasicUpgrades
})
export const thoughtMultFromUnlocks = derived(unlocked, $unlocked => checkBoolForNum($unlocked.thoughts50Percent, 1.5))

export const cheeseThoughtMult = derived(
    [resource, upgrades],
    ([$resource, $upgrades]) => 1 + Math.log($resource.cheese + 1) * $upgrades.cheeseThoughtMult.bought * $upgrades.cheeseThoughtMult.bought
)

export const cheeseCyclesPerBarFill = derived(upgrades, $upgrades => 1 + $upgrades.multipleCheeseCycles.bought)

export const maxCheeseQueue = derived(upgrades, $upgrades => 5 + 5 * $upgrades.cheeseQueueLength.bought)

export const cheeseCyclesThoughtMult = derived([unlocked, cheeseQueueTotalCycles], ([$unlocked, $cheeseQueueTotalCycles]) =>
    checkBoolForNum($unlocked.cheeseCyclesBoostThoughts, 1 + 0.001 * Math.pow($cheeseQueueTotalCycles, 1.5))
)

export const cheeseYieldDeltaDuration = 500 // ms

export const cheeseModeStats: Record<CheeseFactoryMode, { yield: number; duration: number; cost: number }> = {
    meticulous: { yield: 5, duration: 10, cost: 1 },
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

export const cheeseCycleAcceleratorFactor = derived([unlocked, cheeseQueueTotalCycles], ([$unlocked, $cheeseQueueTotalCycles]) =>
    checkBoolForNum($unlocked.cheeseCycleAccelerator, 1 + Math.log($cheeseQueueTotalCycles / 100 + 1))
)

export const cheeseBoostFactorYield = derived([unlocked, currentThoughtBoost], ([$unlocked, $currentThoughtBoost]) =>
    checkBoolForNum($unlocked.cheeseBoost, $currentThoughtBoost)
)

// MOLDY STUFF

const mcHalfLifeStartingValue = 10
export const mcHalfLifeSeconds = derived(upgrades, $upgrades => mcHalfLifeStartingValue + 10 * $upgrades.moldyCheeseHalfLife.bought)
export const moldyCheeseChance = derived(upgrades, $upgrades => 0.1 + 0.1 * $upgrades.moldyCheeseChance.bought)

export const mcConversionCooldownMS = derived(unlocked, $unlocked => ($unlocked.manualMoldyCheeseConversionBoost ? 5000 * 10 : 5000))
// softcap upgrade when exponent > 1? (currently at >323 bought)
export const mcConversionExponent = derived(upgrades, $upgrades => 0.1 + 0.05 * Math.sqrt($upgrades.moldyCheeseConversionExponent.bought + 1))

// CHEESEYARD STUFF

export const cheeseMonsterBrainModeResourceFactors: Record<BrainMode, number> = {
    peaceful: 1,
    neutral: 0.2,
    destructive: 0
}
export const resourceFactorFromBrainMode = derived(brainMode, $brainMode => cheeseMonsterBrainModeResourceFactors[$brainMode])

export const cheeseMonsterCapacityPerUpgrade = derived(upgrades, $upgrades =>
    $upgrades.cheeseMonsterCapacityPerUpgrade.bought > 0 ? 0.1 * Math.pow($upgrades.cheeseMonsterCapacityPerUpgrade.bought + 10, 2) : 10
)

export const cheeseMonsterDeathsMultiplicity = derived(upgrades, $upgrades => 1 + Math.pow($upgrades.multipleMonsterDeaths.bought, 2))
/** per second */
export const cheeseMonsterSpawnrate = derived(
    [unlocked, upgrades],
    ([$unlocked, $upgrades]) => (+$unlocked.cheeseyard * $upgrades.cheeseMonsterSpawnrate.bought) / 3
)
export const cheeseMonsterDeathRateStats: Record<BrainMode, number> = {
    peaceful: 0,
    neutral: 0.01,
    destructive: 0.1
}

export const cheeseMonsterDeathrate = derived(brainMode, $brainMode => cheeseMonsterDeathRateStats[$brainMode])

export const cheeseMonsterDropRate = derived(upgrades, $upgrades => 0.1 + 0.05 * $upgrades.cheeseMonsterDropRate.bought)

export const totalMonsterDeathsLootBoost = derived([unlocked, totalCheeseMonsterDeaths], ([$unlocked, $totalDeaths]) =>
    $unlocked.cheeseMonsterTotalDeathsBoost ? 1 + 1e-6 * Math.pow($totalDeaths, 2) : 1
)

export const cheeseMonsterCollectiveSentienceMultiplier = derived([resource, unlocked], ([$resource, $unlocked]) =>
    $unlocked.cheeseMonsterCollectiveSentience ? 1 + 1e-6 * Math.pow($resource.cheeseMonster, 3) : 1
)

// how much each monster boosts thoughts/s (additive per monster)
export const monsterThoughtFactor = derived(upgrades, $upgrades => 1 + 1 * $upgrades.cheeseMonsterSentience.bought)

export const monsterMoldyCheeseFactor = derived(upgrades, $upgrades => 0.01 * $upgrades.cheeseMonsterMoldiness.bought)
