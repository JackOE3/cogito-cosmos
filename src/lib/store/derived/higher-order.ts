import { derived } from 'svelte/store'
import { cheeseFactoryMode, currentThoughtBoost, resource, unlocked, upgradeCount } from '../primitive'
import {
    cheeseBoostFactorYield,
    cheeseCycleAcceleratorFactor,
    cheeseCyclesThoughtMult,
    cheeseModeFactor,
    cheeseMonsterCapacityPerUpgrade,
    cheeseMonsterDeathrate,
    cheeseQueueCostDivideBy,
    cheeseQueueOverclockCostMult,
    cheeseQueueOverclockSpeedMult,
    cheeseThoughtMult,
    cheeseYieldDeltaDuration,
    cheeseMonsterCollectiveSentienceMultiplier,
    maxCheeseQueue,
    mcConversionExponent,
    mcHalfLifeSeconds,
    monsterMoldyCheeseFactor,
    monsterThoughtFactor,
    resourceFactorFromBrainMode,
    thoughtMultFromUnlocks,
    thoughtsPerSecBase,
    cheeseMonsterDropRate,
    totalMonsterDeathsLootBoost,
    moldyCheeseChance
} from './from-primitive'
import { checkBoolForNum } from '$lib/gamelogic/utils'

const baseCost = 10
export const cheeseCycleBase = {
    duration: derived(upgradeCount, $upgradeCount => 1000 + cheeseYieldDeltaDuration * $upgradeCount.cheeseYield), // milliseconds
    yield: derived(upgradeCount, $upgradeCount => 1 + 0.5 * ($upgradeCount.cheeseYield + $upgradeCount.cheeseYield * $upgradeCount.cheeseYield)),
    cost: derived([cheeseQueueOverclockCostMult, cheeseQueueCostDivideBy], ([$cheeseQueueOverclockCostMult, $cheeseQueueCostDivideBy]) => {
        return (baseCost * $cheeseQueueOverclockCostMult) / $cheeseQueueCostDivideBy
    })
}

export const cheeseQueueLengthBoostFactor = derived([unlocked, maxCheeseQueue], ([$unlocked, $maxCheeseQueue]) =>
    checkBoolForNum($unlocked.cheeseQueueLengthBoost, ($maxCheeseQueue * $maxCheeseQueue) / 100)
)

export const mcHalflifeBoostFactor = derived([mcHalfLifeSeconds, unlocked], ([$mcHalfLifeSeconds, $unlocked]) =>
    $unlocked.moldyCheeseHalflifeBoost ? 1 + 1e-6 * Math.pow($mcHalfLifeSeconds, 3) : 1
)

/* Reactive variables for Yield, Duration & Cost of the cheese cycle */

export const cheeseCycleBatchSize = derived(
    [cheeseCycleBase.yield, cheeseQueueLengthBoostFactor, cheeseBoostFactorYield, cheeseModeFactor, mcHalflifeBoostFactor],
    ([$cheeseCycleBaseYield, $cheeseQueueLengthBoostFactor, $cheeseBoostFactorYield, $cheeseModeFactor, $mcHalflifeBoostFactor]) =>
        $cheeseCycleBaseYield * $cheeseQueueLengthBoostFactor * $cheeseBoostFactorYield * $cheeseModeFactor.yield * $mcHalflifeBoostFactor
)

export const cheeseCycleDuration = derived(
    [cheeseCycleBase.duration, cheeseQueueOverclockSpeedMult, cheeseModeFactor, cheeseCycleAcceleratorFactor],
    ([$cheeseCycleBaseDuration, $cheeseQueueOverclockSpeedMult, $cheeseModeFactor, $cheeseCycleAcceleratorFactor]) =>
        $cheeseCycleBaseDuration * (1 / $cheeseQueueOverclockSpeedMult) * $cheeseModeFactor.duration * (1 / $cheeseCycleAcceleratorFactor)
)

export const cheeseCycleCost = derived(
    [cheeseCycleBase.cost, cheeseModeFactor],
    ([$cheeseCycleBaseCost, $cheeseModeFactor]) => $cheeseCycleBaseCost * $cheeseModeFactor.cost
)

export const mcCycleDurationBoostFactor = derived(cheeseModeFactor, $cheeseModeFactor => Math.pow($cheeseModeFactor.duration, 1.5))

export const cheeseMonsterCapacity = derived(
    [upgradeCount, cheeseMonsterCapacityPerUpgrade],
    ([$upgradeCount, $cheeseMonsterCapacityPerUpgrade]) => $cheeseMonsterCapacityPerUpgrade * (1 + $upgradeCount.cheeseMonsterCapacity)
)

export const cheeseMonsterDeathsPerSec = derived(
    [cheeseMonsterDeathrate, resource],
    ([$cheeseMonsterDeathrate, $resource]) => $cheeseMonsterDeathrate * $resource.cheeseMonster
)

export const cheeseMonsterMassacreMultiplier = derived([unlocked, cheeseMonsterDeathsPerSec], ([$unlocked, $cheeseMonsterDeathsPerSec]) =>
    $unlocked.cheeseMonsterMassacre ? 1 + Math.pow($cheeseMonsterDeathsPerSec, 1.3) : 1
)

export const cheeseMonsterLootAmount = derived(
    [upgradeCount, cheeseMonsterMassacreMultiplier],
    ([$upgradeCount, $cheeseMonsterMassacreMultiplier]) => (1 + $upgradeCount.cheeseMonsterLoot) * $cheeseMonsterMassacreMultiplier
)

export const approxCheeseBrainsPerSec = derived(
    [cheeseMonsterDeathsPerSec, cheeseMonsterDropRate, cheeseMonsterLootAmount, totalMonsterDeathsLootBoost],
    ([$cheeseMonsterDeathsPerSec, $cheeseMonsterDropRate, $cheeseMonsterLootAmount, $totalMonsterDeathsLootBoost]) =>
        $cheeseMonsterDeathsPerSec * $cheeseMonsterDropRate * $cheeseMonsterLootAmount * $totalMonsterDeathsLootBoost
)

export const monsterThoughtMult = derived(
    [monsterThoughtFactor, resource, resourceFactorFromBrainMode, cheeseMonsterCollectiveSentienceMultiplier],
    ([$monsterThoughtFactor, $resource, $resourceFactorFromBrainMode, $cheeseMonsterCollectiveSentienceMultiplier]) =>
        1 + $monsterThoughtFactor * $cheeseMonsterCollectiveSentienceMultiplier * $resource.cheeseMonster * $resourceFactorFromBrainMode
)

export const monsterMoldyCheeseMult = derived(
    [monsterMoldyCheeseFactor, resource, resourceFactorFromBrainMode],
    ([$monsterMoldyCheeseFactor, $resource, $resourceFactorFromBrainMode]) =>
        1 + $monsterMoldyCheeseFactor * $resource.cheeseMonster * $resourceFactorFromBrainMode
)

export const mcByproductAmount = derived(
    [unlocked, mcConversionExponent, monsterMoldyCheeseMult, cheeseFactoryMode, cheeseCycleBatchSize, mcCycleDurationBoostFactor],
    ([$unlocked, $mcConversionExponent, $monsterMoldyCheeseMult, $cheeseFactoryMode, $cheeseCycleBatchSize, $mcCycleDurationBoostFactor]) =>
        $cheeseFactoryMode !== 'warpSpeed'
            ? Math.pow($cheeseCycleBatchSize, $mcConversionExponent) *
              $monsterMoldyCheeseMult *
              ($unlocked.moldyCheeseCycleDurationBoost ? $mcCycleDurationBoostFactor : 1)
            : 0
)

export const mcManualConversionAmount = derived(
    [resource, unlocked, mcConversionExponent, monsterMoldyCheeseMult],
    ([$resource, $unlocked, $mcConversionExponent, $monsterMoldyCheeseMult]) =>
        Math.pow($resource.cheese, $mcConversionExponent) * $monsterMoldyCheeseMult * ($unlocked.manualMoldyCheeseConversionBoost ? 10 : 1)
)

export const thoughtsPerSec = derived(
    [thoughtsPerSecBase, thoughtMultFromUnlocks, currentThoughtBoost, cheeseThoughtMult, cheeseCyclesThoughtMult, monsterThoughtMult],
    $factors => $factors.reduce((prev, curr) => prev * curr, 1)
)
