import {
    unlocked as unlockedState,
    upgradeCount as upgradeCountState,
    resource as resourceState,
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

class FromPrimitive {
    knowledgePerSec = $derived.by(() => {
        if (mood.value === 'neutral') {
            return +unlocked.ponderPassively * 0.1 * Math.pow(resource.thoughts, 0.25) * this.knowledgeMultiplier
        } else return 0
    })

    insightPerSec = $derived.by(() => {
        if (mood.value === 'sad') {
            return 0.1 * Math.pow(resource.knowledge, 0.25)
        } else return 0
    })

    knowledgeMultiplier = $derived(1 + upgradeCount.knowledgeMultiplier)

    knowledgeConversionFactorFormula = (upgradeCount: number) => 0.05 / (1 + upgradeCount)
    knowledgeConversionFactor = $derived(this.knowledgeConversionFactorFormula(upgradeCount.knowledgeConversion))

    thoughtBoostMultiplier = $derived(1.5 + 0.2 * Math.pow(upgradeCount.thoughtBoost, 1.5))

    thoughtBoostDuration = $derived(5000 + 5000 * upgradeCount.thoughtBoost)

    /*thoughtBoostMaxStacks = $derived([upgradeCount, unlocked], ([upgradeCount, unlocked]) =>
        checkBoolForNum(unlocked.thoughtBoost, 2 + upgradeCount.thoughtBoostStack)
    ) */

    thoughtsPerSecBase = $derived.by(() => {
        const fromBasicUpgrades = upgradeCount.thoughtAcceleration * (1 * upgradeCount.thoughtJerk + 1)

        return +unlocked.thinkPassively + fromBasicUpgrades
    })

    thoughtMultFromUnlocks = $derived(checkBoolForNum(unlocked.thoughts50Percent, 1.5))

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
}

export const fromPrimitive = new FromPrimitive()
/* export const knowledgePerSec = $derived(+unlocked.ponderPassively * 0.1 * Math.pow(resource.thoughts, 0.25))

export const insightPerSec = $derived(0.1 * Math.pow(resource.knowledge, 0.25))

export const thoughtBoostMultiplier = $derived(1.5 + 0.2 * Math.pow(upgradeCount.thoughtBoost, 1.5))

export const thoughtBoostDuration = $derived(5000 + 5000 * upgradeCount.thoughtBoost)


export const thoughtsPerSecBase = $derived.by(() => {
    const fromBasicUpgrades = upgradeCount.thoughtAcceleration * (1 * upgradeCount.thoughtJerk + 1)

    return +unlocked.thinkPassively + fromBasicUpgrades
})

export const thoughtMultFromUnlocks = $derived(checkBoolForNum(unlocked.thoughts50Percent, 1.5))

export const cheeseThoughtMult = $derived(1 + Math.log(resource.cheese + 1) * upgradeCount.cheeseThoughtMult * upgradeCount.cheeseThoughtMult)

export const cheeseCyclesPerBarFill = $derived(1 + upgradeCount.multipleCheeseCycles)

export const maxCheeseQueue = $derived(5 + 5 * upgradeCount.cheeseQueueLength)

export const cheeseCyclesThoughtMult = $derived(checkBoolForNum(unlocked.cheeseCyclesBoostThoughts, 1 + 0.001 * Math.pow(cheeseQueueTotalCycles.value, 1.5)))

export const cheeseYieldDeltaDuration = 500 // ms

export const cheeseModeStats: Record<CheeseFactoryMode, { yield: number; duration: number; cost: number }> = {
    meticulous: { yield: 5, duration: 10, cost: 1 },
    nominal: { yield: 1, duration: 1, cost: 1 },
    warpSpeed: { yield: 1 / 100, duration: 1 / 10, cost: 1 / 10 }
}
export const cheeseModeFactor = $derived(cheeseModeStats[cheeseFactoryMode.value])

export const cheeseQueueCostDivideBy = $derived(
    upgradeCount.cheeseQueueOverclockingCost > 0
        ? 1 + 0.25 * (upgradeCount.cheeseQueueOverclockingCost + 1) * (upgradeCount.cheeseQueueOverclockingCost + 1)
        : 1
)

export const cheeseQueueOverclockSpeedMult = $derived(Math.pow(1.05, cheeseQueueOverclockLvl.value))
export const cheeseQueueOverclockCostMult = $derived(1 * Math.pow(2, cheeseQueueOverclockLvl.value))

export const cheeseCycleAcceleratorFactor = $derived(checkBoolForNum(unlocked.cheeseCycleAccelerator, 1 + Math.log(cheeseQueueTotalCycles.value / 100 + 1)))

export const cheeseBoostFactorYield = $derived(checkBoolForNum(unlocked.cheeseBoost, currentThoughtBoost.value))

// MOLDY STUFF

const mcHalfLifeStartingValue = 10
export const mcHalfLifeSeconds = $derived(mcHalfLifeStartingValue + 10 * upgradeCount.moldyCheeseHalfLife)
export const moldyCheeseChance = $derived(0.1 + 0.1 * upgradeCount.moldyCheeseChance)

export const mcConversionCooldownMS = $derived(unlocked.manualMoldyCheeseConversionBoost ? 5000 * 10 : 5000)
// softcap upgrade when exponent > 1? (currently at >323 bought)
export const mcConversionExponent = $derived(0.1 + 0.05 * Math.sqrt(upgradeCount.moldyCheeseConversionExponent + 1))

// CHEESEYARD STUFF

export const cheeseMonsterBrainModeResourceFactors: Record<BrainMode, number> = {
    peaceful: 1,
    neutral: 0.2,
    destructive: 0
}
export const resourceFactorFromBrainMode = $derived(cheeseMonsterBrainModeResourceFactors[brainMode.value])

export const cheeseMonsterCapacityPerUpgrade = $derived(
    upgradeCount.cheeseMonsterCapacityPerUpgrade > 0 ? 0.1 * Math.pow(upgradeCount.cheeseMonsterCapacityPerUpgrade + 10, 2) : 10
)

export const cheeseMonsterDeathsMultiplicity = $derived(1 + Math.pow(upgradeCount.multipleMonsterDeaths, 2))

export const cheeseMonsterSpawnrate = $derived((+unlocked.cheeseyard * upgradeCount.cheeseMonsterSpawnrate) / 3)
export const cheeseMonsterDeathRateStats: Record<BrainMode, number> = {
    peaceful: 0,
    neutral: 0.01,
    destructive: 0.1
}

export const cheeseMonsterDeathrate = $derived(cheeseMonsterDeathRateStats[brainMode.value])

export const cheeseMonsterDropRate = $derived(0.1 + 0.05 * upgradeCount.cheeseMonsterDropRate)

export const totalMonsterDeathsLootBoost = $derived(unlocked.cheeseMonsterTotalDeathsBoost ? 1 + 1e-6 * Math.pow(totalCheeseMonsterDeaths.value, 2) : 1)

export const cheeseMonsterCollectiveSentienceMultiplier = $derived(
    unlocked.cheeseMonsterCollectiveSentience ? 1 + 1e-6 * Math.pow(resource.cheeseMonster, 3) : 1
)

// how much each monster boosts thoughts/s (additive per monster)
export const monsterThoughtFactor = $derived(1 + 1 * upgradeCount.cheeseMonsterSentience)

export const monsterMoldyCheeseFactor = $derived(0.01 * upgradeCount.cheeseMonsterMoldiness) */
