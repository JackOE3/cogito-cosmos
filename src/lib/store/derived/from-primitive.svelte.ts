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
    mood,
    enlightenmentStage,
    health,
    enlightenmentSubstage,
    generators
} from '../primitive'
import { checkBoolForNum } from '$lib/gamelogic/utils'

export type HealthStage = 'fit' | 'ok' | 'bad' | 'horrible' | 'dead'

// shorthands:
const unlocked = $derived(unlockedState.value)
const upgradeCount = $derived(upgradeCountState.value)
const resource = $derived(resourceState.value)
const resourceTotal = $derived(resourceTotalState.value)

class Formulas {
    // with this formula, at 40 upgrades its at 0.01 = 1%
    knowledgeConversionFactorFormula = (upgradeCount: number) => 0.05 / (1 + upgradeCount / 10)

    totalEPNeededForStage = function (stage: number, substage: number) {
        const totalPointsForPreviousStages = (5 * 10 * (stage - 1) * stage) / 2
        const pointsForCurrentStage = 10 * stage * substage
        return totalPointsForPreviousStages + pointsForCurrentStage
    }

    resourceLevel = (totalResource: number) => Math.floor(Math.log10(totalResource > 0 ? totalResource : 1))
}
export const formulas = new Formulas()
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
                this.healthMultiplier *
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
            result *= this.healthMultiplier
            if (unlocked.thoughtsBoostKnowledgeGeneration) result *= 1 + 0.1 * Math.pow(resource.thoughts, 0.25) * this.knowledgeMultiplier
            return result
        } else return 0
    })

    insightPerSec = $derived.by(() => {
        if (mood.value === 'sad') {
            // * 0.1 * Math.pow(resource.knowledge, 0.25)
            return 0.01 * upgradeCount.insightGeneration * this.healthMultiplier
        } else return 0
    })

    wisdomPerSec = $derived(1e-3 * Math.log(resource.thoughts + 1) * Math.log(resource.knowledge + 1) * Math.log(resource.insight + 1))

    /**
     * TODO: make this dependent on some upgrade (wisdom?)
     */
    generatorExpPerSecBase = $derived(1)

    generatorBoostFrom = $derived({
        T1: 1 + 0.1 * generators.value.T1.lvl,
        K1: 1 + 0.1 * generators.value.K1.lvl,
        I1: 1 + 0.1 * generators.value.I1.lvl,

        T2: 1 + generators.value.T2.lvl,
        K2: 1 + generators.value.K2.lvl,
        I2: 1 + generators.value.I2.lvl
    })

    /**
     * TODO: make this dependent on upgrades (which decrease exp requirement)
     */
    generatorExpPerSec = $derived({
        T1: this.generatorExpPerSecBase * this.generatorBoostFrom.T2,
        K1: this.generatorExpPerSecBase * this.generatorBoostFrom.K2,
        I1: this.generatorExpPerSecBase * this.generatorBoostFrom.I2,

        T2: this.generatorExpPerSecBase,
        K2: this.generatorExpPerSecBase,
        I2: this.generatorExpPerSecBase
    })

    generatorExpRequirement = $derived.by(() => {
        const count = upgradeCount.decreaseGeneratorExpRequirement
        const growthFactor = 1.05
        const discountFactor = 10
        // basis change fromm discountFactor to growthFactor:
        const T1DiscountExponent = (count * Math.log(discountFactor)) / Math.log(growthFactor)

        return {
            T1: Math.pow(growthFactor, generators.value.T1.lvl - T1DiscountExponent),
            K1: Math.pow(growthFactor, generators.value.K1.lvl),
            I1: Math.pow(growthFactor, generators.value.I1.lvl),

            T2: Math.pow(growthFactor, generators.value.T2.lvl),
            K2: Math.pow(growthFactor, generators.value.K2.lvl),
            I2: Math.pow(growthFactor, generators.value.I2.lvl)
        }
    })

    /**
     * The amount of currently active generators
     */
    numActiveGenerators = $derived(Object.values(generators.value).filter(generator => generator.active).length)
    /**
     * The maximum amount of generators that can be active at the same time
     */
    numMaxActiveGenerators = $derived(2)

    healthStage: HealthStage = $derived.by(() => {
        if (health.value >= 0.7) return 'fit'
        else if (health.value >= 0.4) return 'ok'
        else if (health.value >= 0.2) return 'bad'
        else if (health.value > 0) return 'horrible'
        else return 'dead'
    })

    healthMultiplier = $derived.by(() => {
        switch (this.healthStage) {
            case 'fit':
                return 2
            case 'ok':
                return 1
            case 'bad':
                return 0.5
            case 'horrible':
                return 0.1
            case 'dead':
                return 0
        }
    })

    healthChangePerSec = $derived.by(() => {
        switch (mood.value) {
            case 'happy':
                if (health.value >= 1) return 0
                return 1e-2
            case 'neutral':
                return 0
            case 'sad':
                if (health.value <= 0) return 0
                return -1e-2
        }
    })

    enlightenmentFullStage = $derived(enlightenmentStage.value + 0.1 * enlightenmentSubstage.value)

    resourceLevel = $derived({
        thoughts: formulas.resourceLevel(resourceTotal.thoughts),
        knowledge: formulas.resourceLevel(resourceTotal.knowledge),
        insight: formulas.resourceLevel(resourceTotal.insight)
    })
    /**
     * Shows how many Enlightenment Points you have from different sources
     */
    enlightenmentPointsFrom = $derived.by(() => {
        const totalUpgradeCount = Object.values(upgradeCount).reduce((acc, value) => acc + value, 0)
        const totalUnlockCount = Object.values(unlocked).filter(value => value).length
        return {
            upgrades: totalUpgradeCount * 1, // relative weight is 1 => worth of everything relative to upgrades
            unlocks: totalUnlockCount * 10, // more weighted for EP
            wisdomUpgrade: upgradeCount.gainEP * 4, // 4+1=5 EP per upgrade
            resourceMilestones: this.resourceLevel.thoughts + this.resourceLevel.knowledge + this.resourceLevel.insight
        }
    })
    /**
     * The total amount of Enlightenment Points you have accumulated when playing the game
     */
    enlightenmentPoints = $derived(Object.values(this.enlightenmentPointsFrom).reduce((acc, value) => acc + value, 0))

    /**
     * The (total) amount of Enlightenment Points which are required to advance to the next Enlightenment (Sub-)stage
     *
     * Every stage has 5 substages.
     * Advancing to a new substage takes 10 points while you are in stage 1, 20 while in stage 2, 30 in stage 3 and so on.
     */
    enlightenmentPointsToNextSubstage = $derived(formulas.totalEPNeededForStage(enlightenmentStage.value, enlightenmentSubstage.value))

    /**
     * The maximum amount of skills you can have active at once, selected from your skill pool.
     */
    maxActiveSkills = $derived(3)

    knowledgeMultiplier = $derived(1 + upgradeCount.knowledgeMultiplier)
    /**
     * You lose this fraction of thoughts/s when gaining knowledge.
     */
    knowledgeConversionFactor = $derived(formulas.knowledgeConversionFactorFormula(upgradeCount.knowledgeConversion))

    thoughtsPerSecKnowledgeConversion = $derived(this.knowledgeConversionFactor * resource.thoughts) // 5% decay every sec

    thoughtBoostMultiplier = $derived(1.5 + 0.2 * Math.pow(upgradeCount.thoughtBoostMultiplier, 1.5))

    thoughtBoostDuration = $derived(5000 + 1000 * upgradeCount.thoughtBoostDuration)

    thoughtsPerSecBase = $derived.by(() => {
        const fromBasicUpgrades = upgradeCount.thoughtAcceleration * (1 + upgradeCount.thoughtJerk) * (1 + upgradeCount.thoughtSnap)

        return +unlocked.thinkPassively + fromBasicUpgrades
    })

    thoughtMultFromUnlocks = $derived(checkBoolForNum(unlocked.thoughts50Percent, 1.5))

    //------------------------------------------------------------------------------------------

    /**
     * Manually convert all your thoughts to this amount of enerchee
     */
    convertToEnerchee = $derived(Math.log2(resource.thoughts + 1))

    /**
     * The amount of enerchee per second you generate passively
     */
    enercheePerSec = $derived(1 * upgradeCount.enercheeGeneration)

    /**
     * The max amount of cheese production cycles you can queue up in advance
     */
    maxCheeseQueue = $derived.by(() => {
        if (unlocked.cheeseQueue) {
            return 5 + 5 * upgradeCount.cheeseQueueLength
        } else return 1
    })

    /**
     * The amount of enerchee it costs to complete a cheese cycle
     */
    cheeseCycleCost = $derived.by(() => ((1 * this.cheeseQueueOverclockCostMult) / this.cheeseQueueCostDivideBy) * this.cheeseModeFactor.cost)

    /**
     * The amount of cheese a cheese cycles produces
     */
    cheeseCycleYield = $derived.by(
        () => 1 + Math.pow(upgradeCount.cheeseYield, 2)
        // * this.cheeseQueueLengthBoostFactor * this.cheeseBoostFactorYield * this.cheeseModeFactor.yield * this.mcHalflifeBoostFactor
    )

    /**
     * The estimated duration a cheese cycle takes to complete
     */
    cheeseCycleDuration = $derived.by(() => (5000 + 1000 * upgradeCount.cheeseYield) / this.cheeseQueueOverclockSpeedMult)

    /**
     * The duration of a cheese cycle gets divided by this factor
     */
    cheeseQueueOverclockSpeedMult = $derived(Math.pow(1.2, cheeseQueueOverclockLvl.value))

    /**
     * The cost of a cheese cycle gets multiplied by this factor
     */
    cheeseQueueOverclockCostMult = $derived(Math.pow(2, cheeseQueueOverclockLvl.value))

    /**
     * How the happiness of your swiss workers changes per second.
     * Happiness is a value between 0 and 1.
     */
    cheeseWorkerHappinessChangePerSec = $derived.by(() => {
        //should depend on:
        /**
         * how much overclocking: cheeseQueueOverclockLvl.value
         * which cheese factory procotol: cheeseFactoryMode.value
         * [maybe some Skills/Blessings]
         */
        return 0
    })

    // old stuff:
    /* cheeseCycleBase = $derived.by(() => {
        return {
            duration: 1000 + this.cheeseYieldDeltaDuration * upgradeCount.cheeseYield,
            yield: 1 + 0.5 * (upgradeCount.cheeseYield + upgradeCount.cheeseYield * upgradeCount.cheeseYield),
            cost: (10 * this.cheeseQueueOverclockCostMult) / this.cheeseQueueCostDivideBy
        }
    }) */

    cheeseQueueLengthBoostFactor = $derived.by(() => {
        if (unlocked.cheeseQueueLengthBoost) {
            return (this.maxCheeseQueue * this.maxCheeseQueue) / 100
        } else return 1
    })

    /* Reactive variables for Yield, Duration & Cost of the cheese cycle */

    /* cheeseCycleBatchSize = $derived.by(() =>
        this.cheeseCycleBase.yield * this.cheeseQueueLengthBoostFactor * this.cheeseBoostFactorYield * this.cheeseModeFactor.yield * this.mcHalflifeBoostFactor
    )

    cheeseCycleDuration = $derived.by(() =>
        this.cheeseCycleBase.duration * (1 / this.cheeseQueueOverclockSpeedMult) * this.cheeseModeFactor.duration * (1 / this.cheeseCycleAcceleratorFactor)
    )

    cheeseCycleCost = $derived.by(() => this.cheeseCycleBase.cost * this.cheeseModeFactor.cost) */

    //------------------------------------------------------------------------------------------

    cheeseThoughtMult = $derived(1 + Math.log(resource.cheese + 1) * upgradeCount.cheeseThoughtMult * upgradeCount.cheeseThoughtMult)

    cheeseCyclesPerBarFill = $derived(1 + upgradeCount.multipleCheeseCycles)

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

    mcHalflifeBoostFactor = $derived(unlocked.moldyCheeseHalflifeBoost ? 1 + 1e-6 * Math.pow(this.mcHalfLifeSeconds, 3) : 1)

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

    /* mcByproductAmount = $derived(
        cheeseFactoryMode.value !== 'warpSpeed'
            ? Math.pow(this.cheeseCycleBatchSize, this.mcConversionExponent) *
                  this.monsterMoldyCheeseMult *
                  (unlocked.moldyCheeseCycleDurationBoost ? this.mcCycleDurationBoostFactor : 1)
            : 0
    ) */

    mcManualConversionAmount = $derived(
        Math.pow(resource.cheese, this.mcConversionExponent) * this.monsterMoldyCheeseMult * (unlocked.manualMoldyCheeseConversionBoost ? 10 : 1)
    )
}

export const derivedState = new DerivedState()
