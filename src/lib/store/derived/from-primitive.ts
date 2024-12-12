import { derived } from 'svelte/store'
import {
    unlocked,
    upgradeCount,
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

export const knowledgePerSec = derived([unlocked, resource], ([$unlocked, $resource]) => {
    return +$unlocked.ponderPassively * 0.1 * Math.pow($resource.thoughts, 0.25)
})

export const insightPerSec = derived([resource], ([$resource]) => {
    return 0.1 * Math.pow($resource.knowledge, 0.25)
})

export const thoughtBoostMultiplier = derived(upgradeCount, $upgradeCount => 1.5 + 0.2 * Math.pow($upgradeCount.thoughtBoost, 1.5))
export const thoughtBoostDuration = derived(upgradeCount, $upgradeCount => 5000 + 5000 * $upgradeCount.thoughtBoost)

/* export const thoughtBoostMaxStacks = derived([upgradeCount, unlocked], ([$upgradeCount, $unlocked]) =>
    checkBoolForNum($unlocked.thoughtBoost, 2 + $upgradeCount.thoughtBoostStack)
) */

export const thoughtsPerSecBase = derived([unlocked, upgradeCount], ([$unlocked, $upgradeCount]) => {
    const fromBasicUpgrades = $upgradeCount.thoughtAcceleration * (1 * $upgradeCount.thoughtJerk + 1)

    return +$unlocked.thinkPassively + fromBasicUpgrades
})
export const thoughtMultFromUnlocks = derived(unlocked, $unlocked => checkBoolForNum($unlocked.thoughts50Percent, 1.5))

export const cheeseThoughtMult = derived(
    [resource, upgradeCount],
    ([$resource, $upgradeCount]) => 1 + Math.log($resource.cheese + 1) * $upgradeCount.cheeseThoughtMult * $upgradeCount.cheeseThoughtMult
)

export const cheeseCyclesPerBarFill = derived(upgradeCount, $upgradeCount => 1 + $upgradeCount.multipleCheeseCycles)

export const maxCheeseQueue = derived(upgradeCount, $upgradeCount => 5 + 5 * $upgradeCount.cheeseQueueLength)

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

export const cheeseQueueCostDivideBy = derived(upgradeCount, $upgradeCount =>
    $upgradeCount.cheeseQueueOverclockingCost > 0
        ? 1 + 0.25 * ($upgradeCount.cheeseQueueOverclockingCost + 1) * ($upgradeCount.cheeseQueueOverclockingCost + 1)
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
export const mcHalfLifeSeconds = derived(upgradeCount, $upgradeCount => mcHalfLifeStartingValue + 10 * $upgradeCount.moldyCheeseHalfLife)
export const moldyCheeseChance = derived(upgradeCount, $upgradeCount => 0.1 + 0.1 * $upgradeCount.moldyCheeseChance)

export const mcConversionCooldownMS = derived(unlocked, $unlocked => ($unlocked.manualMoldyCheeseConversionBoost ? 5000 * 10 : 5000))
// softcap upgrade when exponent > 1? (currently at >323 bought)
export const mcConversionExponent = derived(upgradeCount, $upgradeCount => 0.1 + 0.05 * Math.sqrt($upgradeCount.moldyCheeseConversionExponent + 1))

// CHEESEYARD STUFF

export const cheeseMonsterBrainModeResourceFactors: Record<BrainMode, number> = {
    peaceful: 1,
    neutral: 0.2,
    destructive: 0
}
export const resourceFactorFromBrainMode = derived(brainMode, $brainMode => cheeseMonsterBrainModeResourceFactors[$brainMode])

export const cheeseMonsterCapacityPerUpgrade = derived(upgradeCount, $upgradeCount =>
    $upgradeCount.cheeseMonsterCapacityPerUpgrade > 0 ? 0.1 * Math.pow($upgradeCount.cheeseMonsterCapacityPerUpgrade + 10, 2) : 10
)

export const cheeseMonsterDeathsMultiplicity = derived(upgradeCount, $upgradeCount => 1 + Math.pow($upgradeCount.multipleMonsterDeaths, 2))
/** per second */
export const cheeseMonsterSpawnrate = derived(
    [unlocked, upgradeCount],
    ([$unlocked, $upgradeCount]) => (+$unlocked.cheeseyard * $upgradeCount.cheeseMonsterSpawnrate) / 3
)
export const cheeseMonsterDeathRateStats: Record<BrainMode, number> = {
    peaceful: 0,
    neutral: 0.01,
    destructive: 0.1
}

export const cheeseMonsterDeathrate = derived(brainMode, $brainMode => cheeseMonsterDeathRateStats[$brainMode])

export const cheeseMonsterDropRate = derived(upgradeCount, $upgradeCount => 0.1 + 0.05 * $upgradeCount.cheeseMonsterDropRate)

export const totalMonsterDeathsLootBoost = derived([unlocked, totalCheeseMonsterDeaths], ([$unlocked, $totalDeaths]) =>
    $unlocked.cheeseMonsterTotalDeathsBoost ? 1 + 1e-6 * Math.pow($totalDeaths, 2) : 1
)

export const cheeseMonsterCollectiveSentienceMultiplier = derived([resource, unlocked], ([$resource, $unlocked]) =>
    $unlocked.cheeseMonsterCollectiveSentience ? 1 + 1e-6 * Math.pow($resource.cheeseMonster, 3) : 1
)

// how much each monster boosts thoughts/s (additive per monster)
export const monsterThoughtFactor = derived(upgradeCount, $upgradeCount => 1 + 1 * $upgradeCount.cheeseMonsterSentience)

export const monsterMoldyCheeseFactor = derived(upgradeCount, $upgradeCount => 0.01 * $upgradeCount.cheeseMonsterMoldiness)
