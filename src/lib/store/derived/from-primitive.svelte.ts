import {
    unlocked as unlockedState,
    upgradeCount as upgradeCountState,
    resource as resourceState,
    resourceTotal as resourceTotalState,
    cheeseQueueTotalCycles,
    cheeseFactoryMode,
    cheeseQueueOverclockLvl,
    currentThoughtBoost,
    brainMode,
    totalCheeseMonsterDeaths,
    type CheeseFactoryMode,
    type BrainMode,
    mood
} from '../primitive'
import { checkBoolForNum } from '$lib/gamelogic/utils'

// shorthands:
const unlocked = $derived(unlockedState.value)
const upgradeCount = $derived(upgradeCountState.value)
const resource = $derived(resourceState.value)
const resourceTotal = $derived(resourceTotalState.value)

class Formulas {
    // with this formula, at 40 upgrades its at 0.01 = 1%
    knowledgeConversionFactorFormula = (upgradeCount: number) => 0.05 / (1 + upgradeCount / 10)
}
const formulas = new Formulas()
/**
 * for referencing state in the UI:
 * eg. you buy an upgrade and want to know how some state changes.
 * solution: provide formulas you can plug in {currentUpgradeCount + 1} to calculate the expected change
 * where to put these formulas? separate or combined with state object?
 */
class DerivedState {
    thoughtsPerSec = $derived.by(() => {
        if (mood.value === 'happy') {
            return (
                this.thoughtsPerSecBase *
                this.thoughtMultFromUnlocks *
                currentThoughtBoost.value *
                this.cheeseThoughtMult *
                this.cheeseCyclesThoughtMult *
                this.monsterThoughtMult
            )
        } else if (mood.value === 'neutral') {
            let result = 0
            if (unlocked.thoughtsBoostKnowledgeGeneration) result = -this.thoughtsPerSecKnowledgeConversion
            return result
        } else return 0
    })

    knowledgePerSec = $derived.by(() => {
        if (mood.value === 'neutral') {
            let result = 0.1 * upgradeCount.knowledgeGeneration * (1 + upgradeCount.studySmarter)
            if (unlocked.thoughtsBoostKnowledgeGeneration) result *= 1 + 0.1 * Math.pow(resource.thoughts, 0.25) * this.knowledgeMultiplier
            return result
        } else return 0
    })

    insightPerSec = $derived.by(() => {
        if (mood.value === 'sad') {
            // * 0.1 * Math.pow(resource.knowledge, 0.25)
            return 0.01 * upgradeCount.insightGeneration
        } else return 0
    })

    enlightenmentPerSec = $derived(0.01 * Math.log(resourceTotal.thoughts + 1) * Math.log(resourceTotal.knowledge + 1) * Math.log(resourceTotal.insight + 1))

    knowledgeMultiplier = $derived(1 + upgradeCount.knowledgeMultiplier)
    /**
     * You lose this fraction of thoughts/s when gaining knowledge.
     */

    knowledgeConversionFactor = $derived(formulas.knowledgeConversionFactorFormula(upgradeCount.knowledgeConversion))

    thoughtsPerSecKnowledgeConversion = $derived(this.knowledgeConversionFactor * resource.thoughts) // 5% decay every sec

    thoughtBoostMultiplier = $derived(1.5 + 0.2 * Math.pow(upgradeCount.thoughtBoost, 1.5))

    thoughtBoostDuration = $derived(5000 + 5000 * upgradeCount.thoughtBoost)

    thoughtsPerSecBase = $derived.by(() => {
        const fromBasicUpgrades = upgradeCount.thoughtGeneration * (1 + upgradeCount.thoughtJerk) * (1 + upgradeCount.thoughtSnap)

        return +unlocked.thinkPassively + fromBasicUpgrades
    })

    thoughtMultFromUnlocks = $derived(checkBoolForNum(unlocked.thoughts50Percent, 1.5))

    //========================================================

    cheeseThoughtMult = $derived(1 + Math.log(resource.cheese + 1) * upgradeCount.cheeseThoughtMult * upgradeCount.cheeseThoughtMult)

    cheeseCyclesPerBarFill = $derived(1 + upgradeCount.multipleCheeseCycles)

    maxCheeseQueue = $derived(5 + 5 * upgradeCount.cheeseQueueLength)

    cheeseCyclesThoughtMult = $derived(checkBoolForNum(unlocked.cheeseCyclesBoostThoughts, 1 + 0.001 * Math.pow(cheeseQueueTotalCycles.value, 1.5)))

    cheeseYieldDeltaDuration = 500 // ms

    cheeseModeStats: Record<CheeseFactoryMode, { yield: number; duration: number; cost: number }> = {
        meticulous: { yield: 5, duration: 10, cost: 1 },
        nominal: { yield: 1, duration: 1, cost: 1 },
        warpSpeed: { yield: 1 / 100, duration: 1 / 10, cost: 1 / 10 }
    }
    cheeseModeFactor = $derived(this.cheeseModeStats[cheeseFactoryMode.value])

    cheeseQueueCostDivideBy = $derived(
        upgradeCount.cheeseQueueOverclockingCost > 0
            ? 1 + 0.25 * (upgradeCount.cheeseQueueOverclockingCost + 1) * (upgradeCount.cheeseQueueOverclockingCost + 1)
            : 1
    )

    cheeseQueueOverclockSpeedMult = $derived(Math.pow(1.05, cheeseQueueOverclockLvl.value))
    cheeseQueueOverclockCostMult = $derived(1 * Math.pow(2, cheeseQueueOverclockLvl.value))

    cheeseCycleAcceleratorFactor = $derived(checkBoolForNum(unlocked.cheeseCycleAccelerator, 1 + Math.log(cheeseQueueTotalCycles.value / 100 + 1)))

    cheeseBoostFactorYield = $derived(checkBoolForNum(unlocked.cheeseBoost, currentThoughtBoost.value))

    // MOLDY STUFF

    mcHalfLifeStartingValue = 10
    mcHalfLifeSeconds = $derived(this.mcHalfLifeStartingValue + 10 * upgradeCount.moldyCheeseHalfLife)
    moldyCheeseChance = $derived(0.1 + 0.1 * upgradeCount.moldyCheeseChance)

    mcConversionCooldownMS = $derived(unlocked.manualMoldyCheeseConversionBoost ? 5000 * 10 : 5000)
    // softcap upgrade when exponent > 1? (currently at >323 bought)
    mcConversionExponent = $derived(0.1 + 0.05 * Math.sqrt(upgradeCount.moldyCheeseConversionExponent + 1))

    // CHEESEYARD STUFF

    cheeseMonsterBrainModeResourceFactors: Record<BrainMode, number> = {
        peaceful: 1,
        neutral: 0.2,
        destructive: 0
    }
    resourceFactorFromBrainMode = $derived(this.cheeseMonsterBrainModeResourceFactors[brainMode.value])

    cheeseMonsterCapacityPerUpgrade = $derived(
        upgradeCount.cheeseMonsterCapacityPerUpgrade > 0 ? 0.1 * Math.pow(upgradeCount.cheeseMonsterCapacityPerUpgrade + 10, 2) : 10
    )

    cheeseMonsterDeathsMultiplicity = $derived(1 + Math.pow(upgradeCount.multipleMonsterDeaths, 2))
    /** per second */
    cheeseMonsterSpawnrate = $derived((+unlocked.cheeseyard * upgradeCount.cheeseMonsterSpawnrate) / 3)
    cheeseMonsterDeathRateStats: Record<BrainMode, number> = {
        peaceful: 0,
        neutral: 0.01,
        destructive: 0.1
    }

    cheeseMonsterDeathrate = $derived(this.cheeseMonsterDeathRateStats[brainMode.value])

    cheeseMonsterDropRate = $derived(0.1 + 0.05 * upgradeCount.cheeseMonsterDropRate)

    totalMonsterDeathsLootBoost = $derived(unlocked.cheeseMonsterTotalDeathsBoost ? 1 + 1e-6 * Math.pow(totalCheeseMonsterDeaths.value, 2) : 1)

    cheeseMonsterCollectiveSentienceMultiplier = $derived(unlocked.cheeseMonsterCollectiveSentience ? 1 + 1e-6 * Math.pow(resource.cheeseMonster, 3) : 1)

    // how much each monster boosts thoughts/s (additive per monster)
    monsterThoughtFactor = $derived(1 + 1 * upgradeCount.cheeseMonsterSentience)

    monsterMoldyCheeseFactor = $derived(0.01 * upgradeCount.cheeseMonsterMoldiness)

    // FROM FILE: higherOrder (old)

    cheeseCycleBase = $derived.by(() => {
        return {
            duration: 1000 + this.cheeseYieldDeltaDuration * upgradeCount.cheeseYield,
            yield: 1 + 0.5 * (upgradeCount.cheeseYield + upgradeCount.cheeseYield * upgradeCount.cheeseYield),
            cost: (10 * this.cheeseQueueOverclockCostMult) / this.cheeseQueueCostDivideBy
        }
    })

    cheeseQueueLengthBoostFactor = $derived(checkBoolForNum(unlocked.cheeseQueueLengthBoost, (this.maxCheeseQueue * this.maxCheeseQueue) / 100))

    mcHalflifeBoostFactor = $derived(unlocked.moldyCheeseHalflifeBoost ? 1 + 1e-6 * Math.pow(this.mcHalfLifeSeconds, 3) : 1)

    /* Reactive variables for Yield, Duration & Cost of the cheese cycle */

    cheeseCycleBatchSize = $derived(
        this.cheeseCycleBase.yield * this.cheeseQueueLengthBoostFactor * this.cheeseBoostFactorYield * this.cheeseModeFactor.yield * this.mcHalflifeBoostFactor
    )

    cheeseCycleDuration = $derived(
        this.cheeseCycleBase.duration * (1 / this.cheeseQueueOverclockSpeedMult) * this.cheeseModeFactor.duration * (1 / this.cheeseCycleAcceleratorFactor)
    )

    cheeseCycleCost = $derived(this.cheeseCycleBase.cost * this.cheeseModeFactor.cost)

    mcCycleDurationBoostFactor = $derived(Math.pow(this.cheeseModeFactor.duration, 1.5))

    cheeseMonsterCapacity = $derived(this.cheeseMonsterCapacityPerUpgrade * (1 + upgradeCount.cheeseMonsterCapacity))

    cheeseMonsterDeathsPerSec = $derived(this.cheeseMonsterDeathrate * resource.cheeseMonster)

    cheeseMonsterMassacreMultiplier = $derived(unlocked.cheeseMonsterMassacre ? 1 + Math.pow(this.cheeseMonsterDeathsPerSec, 1.3) : 1)

    cheeseMonsterLootAmount = $derived((1 + upgradeCount.cheeseMonsterLoot) * this.cheeseMonsterMassacreMultiplier)

    approxCheeseBrainsPerSec = $derived(
        this.cheeseMonsterDeathsPerSec * this.cheeseMonsterDropRate * this.cheeseMonsterLootAmount * this.totalMonsterDeathsLootBoost
    )

    monsterThoughtMult = $derived(
        1 + this.monsterThoughtFactor * this.cheeseMonsterCollectiveSentienceMultiplier * resource.cheeseMonster * this.resourceFactorFromBrainMode
    )

    monsterMoldyCheeseMult = $derived(1 + this.monsterMoldyCheeseFactor * resource.cheeseMonster * this.resourceFactorFromBrainMode)

    mcByproductAmount = $derived(
        cheeseFactoryMode.value !== 'warpSpeed'
            ? Math.pow(this.cheeseCycleBatchSize, this.mcConversionExponent) *
                  this.monsterMoldyCheeseMult *
                  (unlocked.moldyCheeseCycleDurationBoost ? this.mcCycleDurationBoostFactor : 1)
            : 0
    )

    mcManualConversionAmount = $derived(
        Math.pow(resource.cheese, this.mcConversionExponent) * this.monsterMoldyCheeseMult * (unlocked.manualMoldyCheeseConversionBoost ? 10 : 1)
    )
}

export const derivedState = new DerivedState()
