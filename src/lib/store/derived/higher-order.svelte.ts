import { cheeseFactoryMode, currentThoughtBoost, unlocked as unlockedState, upgradeCount as upgradeCountState, resource as resourceState } from '../primitive'
import {
    /* cheeseBoostFactorYield,
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
    moldyCheeseChance */
    fromPrimitive
} from './from-primitive.svelte'
import { checkBoolForNum } from '$lib/gamelogic/utils'

// shorthands:
const unlocked = $derived(unlockedState.value)
const upgradeCount = $derived(upgradeCountState.value)
const resource = $derived(resourceState.value)

class HigherOrder {
    cheeseCycleBase = $derived.by(() => {
        return {
            duration: 1000 + fromPrimitive.cheeseYieldDeltaDuration * upgradeCount.cheeseYield,
            yield: 1 + 0.5 * (upgradeCount.cheeseYield + upgradeCount.cheeseYield * upgradeCount.cheeseYield),
            cost: (10 * fromPrimitive.cheeseQueueOverclockCostMult) / fromPrimitive.cheeseQueueCostDivideBy
        }
    })

    cheeseQueueLengthBoostFactor = $derived(
        checkBoolForNum(unlocked.cheeseQueueLengthBoost, (fromPrimitive.maxCheeseQueue * fromPrimitive.maxCheeseQueue) / 100)
    )

    mcHalflifeBoostFactor = $derived(unlocked.moldyCheeseHalflifeBoost ? 1 + 1e-6 * Math.pow(fromPrimitive.mcHalfLifeSeconds, 3) : 1)

    /* Reactive variables for Yield, Duration & Cost of the cheese cycle */

    cheeseCycleBatchSize = $derived(
        this.cheeseCycleBase.yield *
            this.cheeseQueueLengthBoostFactor *
            fromPrimitive.cheeseBoostFactorYield *
            fromPrimitive.cheeseModeFactor.yield *
            this.mcHalflifeBoostFactor
    )

    cheeseCycleDuration = $derived(
        this.cheeseCycleBase.duration *
            (1 / fromPrimitive.cheeseQueueOverclockSpeedMult) *
            fromPrimitive.cheeseModeFactor.duration *
            (1 / fromPrimitive.cheeseCycleAcceleratorFactor)
    )

    cheeseCycleCost = $derived(this.cheeseCycleBase.cost * fromPrimitive.cheeseModeFactor.cost)

    mcCycleDurationBoostFactor = $derived(Math.pow(fromPrimitive.cheeseModeFactor.duration, 1.5))

    cheeseMonsterCapacity = $derived(fromPrimitive.cheeseMonsterCapacityPerUpgrade * (1 + upgradeCount.cheeseMonsterCapacity))

    cheeseMonsterDeathsPerSec = $derived(fromPrimitive.cheeseMonsterDeathrate * resource.cheeseMonster)

    cheeseMonsterMassacreMultiplier = $derived(unlocked.cheeseMonsterMassacre ? 1 + Math.pow(this.cheeseMonsterDeathsPerSec, 1.3) : 1)

    cheeseMonsterLootAmount = $derived((1 + upgradeCount.cheeseMonsterLoot) * this.cheeseMonsterMassacreMultiplier)

    approxCheeseBrainsPerSec = $derived(
        this.cheeseMonsterDeathsPerSec * fromPrimitive.cheeseMonsterDropRate * this.cheeseMonsterLootAmount * fromPrimitive.totalMonsterDeathsLootBoost
    )

    monsterThoughtMult = $derived(
        1 +
            fromPrimitive.monsterThoughtFactor *
                fromPrimitive.cheeseMonsterCollectiveSentienceMultiplier *
                resource.cheeseMonster *
                fromPrimitive.resourceFactorFromBrainMode
    )

    monsterMoldyCheeseMult = $derived(1 + fromPrimitive.monsterMoldyCheeseFactor * resource.cheeseMonster * fromPrimitive.resourceFactorFromBrainMode)

    mcByproductAmount = $derived(
        cheeseFactoryMode.value !== 'warpSpeed'
            ? Math.pow(this.cheeseCycleBatchSize, fromPrimitive.mcConversionExponent) *
                  this.monsterMoldyCheeseMult *
                  (unlocked.moldyCheeseCycleDurationBoost ? this.mcCycleDurationBoostFactor : 1)
            : 0
    )

    mcManualConversionAmount = $derived(
        Math.pow(resource.cheese, fromPrimitive.mcConversionExponent) * this.monsterMoldyCheeseMult * (unlocked.manualMoldyCheeseConversionBoost ? 10 : 1)
    )

    thoughtsPerSec = $derived(
        fromPrimitive.thoughtsPerSecBase *
            fromPrimitive.thoughtMultFromUnlocks *
            currentThoughtBoost.value *
            fromPrimitive.cheeseThoughtMult *
            fromPrimitive.cheeseCyclesThoughtMult *
            this.monsterThoughtMult
    )
}

export const higherOrder = new HigherOrder()

/*
export const cheeseCycleBase = $derived.by(() => {
    return {
        duration: 1000 + cheeseYieldDeltaDuration * upgradeCount.cheeseYield,
        yield: 1 + 0.5 * (upgradeCount.cheeseYield + upgradeCount.cheeseYield * upgradeCount.cheeseYield),
        cost: (10 * cheeseQueueOverclockCostMult) / cheeseQueueCostDivideBy
    }
})

export const cheeseQueueLengthBoostFactor = $derived(checkBoolForNum(unlocked.cheeseQueueLengthBoost, (maxCheeseQueue * maxCheeseQueue) / 100))

export const mcHalflifeBoostFactor = $derived(unlocked.moldyCheeseHalflifeBoost ? 1 + 1e-6 * Math.pow(mcHalfLifeSeconds, 3) : 1)

// Reactive variables for Yield, Duration & Cost of the cheese cycle

export const cheeseCycleBatchSize = $derived(
    cheeseCycleBase.yield * cheeseQueueLengthBoostFactor * cheeseBoostFactorYield * cheeseModeFactor.yield * mcHalflifeBoostFactor
)

export const cheeseCycleDuration = $derived(
    cheeseCycleBase.duration * (1 / cheeseQueueOverclockSpeedMult) * cheeseModeFactor.duration * (1 / cheeseCycleAcceleratorFactor)
)

export const cheeseCycleCost = $derived(cheeseCycleBase.cost * cheeseModeFactor.cost)

export const mcCycleDurationBoostFactor = $derived(Math.pow(cheeseModeFactor.duration, 1.5))

export const cheeseMonsterCapacity = $derived(cheeseMonsterCapacityPerUpgrade * (1 + upgradeCount.cheeseMonsterCapacity))

export const cheeseMonsterDeathsPerSec = $derived(cheeseMonsterDeathrate * resource.cheeseMonster)

export const cheeseMonsterMassacreMultiplier = $derived(unlocked.cheeseMonsterMassacre ? 1 + Math.pow(cheeseMonsterDeathsPerSec, 1.3) : 1)

export const cheeseMonsterLootAmount = $derived((1 + upgradeCount.cheeseMonsterLoot) * cheeseMonsterMassacreMultiplier)

export const approxCheeseBrainsPerSec = $derived(cheeseMonsterDeathsPerSec * cheeseMonsterDropRate * cheeseMonsterLootAmount * totalMonsterDeathsLootBoost)

export const monsterThoughtMult = $derived(
    1 + monsterThoughtFactor * cheeseMonsterCollectiveSentienceMultiplier * resource.cheeseMonster * resourceFactorFromBrainMode
)

export const monsterMoldyCheeseMult = $derived(1 + monsterMoldyCheeseFactor * resource.cheeseMonster * resourceFactorFromBrainMode)

export const mcByproductAmount = $derived(
    cheeseFactoryMode.value !== 'warpSpeed'
        ? Math.pow(cheeseCycleBatchSize, mcConversionExponent) *
              monsterMoldyCheeseMult *
              (unlocked.moldyCheeseCycleDurationBoost ? mcCycleDurationBoostFactor : 1)
        : 0
)

export const mcManualConversionAmount = $derived(
    Math.pow(resource.cheese, mcConversionExponent) * monsterMoldyCheeseMult * (unlocked.manualMoldyCheeseConversionBoost ? 10 : 1)
)

export const thoughtsPerSec = $derived(
    thoughtsPerSecBase * thoughtMultFromUnlocks * currentThoughtBoost.value * cheeseThoughtMult * cheeseCyclesThoughtMult * monsterThoughtMult
) */
