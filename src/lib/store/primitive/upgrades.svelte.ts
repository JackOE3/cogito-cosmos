import { makeState } from '../customStore.svelte'
import { Resource, type ResourceType } from './resources.svelte'

export interface IUpgrade {
    title: string
    cost: number
    resource: ResourceType
    costMultiplier: number
    maxBuy?: number
}

export const upgrades = {
    // THOUGHTS
    thoughtGeneration: {
        title: 'Accelerate your thinking',
        cost: 10,
        resource: Resource.THOUGHTS,
        costMultiplier: 1.4,
        maxBuy: undefined
    },
    thoughtBoost: {
        title: 'Improve the Thought Boost',
        cost: 100,
        resource: Resource.THOUGHTS,
        costMultiplier: 2,
        maxBuy: undefined
    },

    // KNOWLEDGE
    knowledgeGeneration: {
        title: 'Improve knowledge acquisition',
        cost: 2,
        resource: Resource.KNOWLEDGE,
        costMultiplier: 1.4,
        maxBuy: undefined
    },
    thoughtJerk: {
        title: 'Jerk your thinking',
        cost: 10,
        resource: Resource.KNOWLEDGE,
        costMultiplier: 1.4,
        maxBuy: undefined
    },

    // decrease exponential decay of thoughts
    knowledgeConversion: {
        title: 'Use your head more efficiently when learning',
        cost: 10,
        resource: Resource.KNOWLEDGE,
        costMultiplier: 2,
        maxBuy: 40
    },
    // additional production multiplier
    knowledgeMultiplier: {
        title: 'Increase your rate of knowledge acquisition',
        cost: 20,
        resource: Resource.KNOWLEDGE,
        costMultiplier: 2,
        maxBuy: 10
    },

    // INSIGHT
    insightGeneration: {
        title: 'Increase your rate of gaining insight',
        cost: 1,
        resource: Resource.INSIGHT,
        costMultiplier: 1.2,
        maxBuy: undefined
    },
    studySmarter: {
        title: 'Study smarter',
        cost: 2,
        resource: Resource.INSIGHT,
        costMultiplier: 1.3,
        maxBuy: undefined
    },
    thoughtSnap: {
        title: 'Snappier thinking',
        cost: 100,
        resource: Resource.INSIGHT,
        costMultiplier: 1.4,
        maxBuy: undefined
    },

    //cheese
    cheeseQueueLength: {
        title: 'Placeholder Title',
        cost: 5,
        resource: Resource.CHEESE,
        costMultiplier: 2,
        maxBuy: undefined
    },
    cheeseYield: {
        title: 'Placeholder Title',
        cost: 15,
        resource: Resource.CHEESE,
        costMultiplier: 1.3,
        maxBuy: undefined
    },
    cheeseThoughtMult: {
        title: 'Placeholder Title',
        cost: 300,
        resource: Resource.CHEESE,
        costMultiplier: 2,
        maxBuy: undefined
    },
    cheeseQueueOverclockingCost: {
        title: 'Placeholder Title',
        cost: 5e3,
        resource: Resource.CHEESE,
        costMultiplier: 1.5,
        maxBuy: undefined
    },

    //moldy cheese
    moldyCheeseConversionExponent: {
        title: 'Placeholder Title',
        cost: 5,
        resource: Resource.MOLDY_CHEESE,
        costMultiplier: 1.5,
        maxBuy: undefined
    },
    moldyCheeseHalfLife: {
        title: 'Placeholder Title',
        cost: 20,
        resource: Resource.MOLDY_CHEESE,
        costMultiplier: 1.3,
        maxBuy: undefined
    },
    moldyCheeseChance: {
        title: 'Placeholder Title',
        cost: 200,
        resource: Resource.MOLDY_CHEESE,
        costMultiplier: 2.5,
        maxBuy: 9
    },
    cheeseMonsterSpawnrate: {
        title: 'Placeholder Title',
        cost: 250,
        resource: Resource.MOLDY_CHEESE,
        costMultiplier: 2.0,
        maxBuy: undefined
    },
    cheeseMonsterCapacity: {
        title: 'Placeholder Title',
        cost: 500,
        resource: Resource.MOLDY_CHEESE,
        costMultiplier: 1.3,
        maxBuy: undefined
    },

    //cheese brains
    cheeseMonsterDropRate: {
        title: 'Placeholder Title',
        cost: 5,
        resource: Resource.CHEESE_BRAINS,
        costMultiplier: 2,
        maxBuy: 18
    },
    cheeseMonsterLoot: {
        title: 'Placeholder Title',
        cost: 10,
        resource: Resource.CHEESE_BRAINS,
        costMultiplier: 1.15,
        maxBuy: undefined
    },
    cheeseMonsterSentience: {
        title: 'Placeholder Title',
        cost: 20,
        resource: Resource.CHEESE_BRAINS,
        costMultiplier: 1.2,
        maxBuy: undefined
    },
    cheeseMonsterMoldiness: {
        title: 'Placeholder Title',
        cost: 100,
        resource: Resource.CHEESE_BRAINS,
        costMultiplier: 1.25,
        maxBuy: undefined
    },

    //bacteria
    bacteriaGrowth: {
        title: 'Placeholder Title',
        cost: 100,
        resource: Resource.BACTERIA,
        costMultiplier: 1.3,
        maxBuy: undefined
    },
    cheeseMonsterCapacityPerUpgrade: {
        title: 'Placeholder Title',
        cost: 1000,
        resource: Resource.BACTERIA,
        costMultiplier: 1.5,
        maxBuy: undefined
    },
    multipleCheeseCycles: {
        title: 'Placeholder Title',
        cost: 1000,
        resource: Resource.BACTERIA,
        costMultiplier: 1.5,
        maxBuy: undefined
    },
    multipleMonsterDeaths: {
        title: 'Placeholder Title',
        cost: 1000,
        resource: Resource.BACTERIA,
        costMultiplier: 1.5,
        maxBuy: undefined
    },

    //milk
    milkThoughtsGain: {
        title: 'Placeholder Title',
        cost: 1,
        resource: Resource.MILK,
        costMultiplier: 1.5,
        maxBuy: undefined
    },
    milkCheeseGain: {
        title: 'Placeholder Title',
        cost: 1,
        resource: Resource.MILK,
        costMultiplier: 2,
        maxBuy: undefined
    },
    milkMoldyCheeseGain: {
        title: 'Placeholder Title',
        cost: 1,
        resource: Resource.MILK,
        costMultiplier: 2,
        maxBuy: undefined
    },
    milkCheeseBrainsGain: {
        title: 'Placeholder Title',
        cost: 1,
        resource: Resource.MILK,
        costMultiplier: 1.5,
        maxBuy: undefined
    }
} as const satisfies Record<string, IUpgrade>

export type UpgradeName = keyof typeof upgrades

// only save this:
// object with each upgrade names as keys and #upgrades bought as values
// type is inferred here
export const upgradeCountInitial = Object.fromEntries(Object.keys(upgrades).map(key => [key, 0])) as Record<UpgradeName, number>
export const upgradeCount = makeState(upgradeCountInitial)

// double space requirement for localStorage, but ill deal with that when (if ever) it becomes a problem...
export const upgradeCostInitial = Object.fromEntries(Object.entries(upgrades).map(([key, upgrade]) => [key, upgrade.cost])) as Record<UpgradeName, number>
export const upgradeCost = makeState(upgradeCostInitial)

//console.log('upgrades array:', Object.entries(upgrades))
