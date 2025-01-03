import { makeState } from '../customStore.svelte'
import { Resource, type ResourceType } from './resources.svelte'

export interface IUpgrade {
    title: string
    description?: string[]
    cost: number
    resource: ResourceType
    costMultiplier: number
    maxBuy?: number
}

export const upgrades = {
    // THOUGHTS
    thoughtAcceleration: {
        title: 'Thought Acceleration',
        cost: 10,
        resource: Resource.THOUGHTS,
        costMultiplier: 1.4,
        maxBuy: undefined
    },
    thoughtBoostMultiplier: {
        title: 'Bigger Thought Boost',
        cost: 100,
        resource: Resource.THOUGHTS,
        costMultiplier: 2,
        maxBuy: undefined
    },
    thoughtBoostDuration: {
        title: 'Longer Thought Boost',
        cost: 100,
        resource: Resource.THOUGHTS,
        costMultiplier: 2,
        maxBuy: undefined
    },

    // KNOWLEDGE
    knowledgeGeneration: {
        title: 'Knowledge acquisition',
        cost: 2,
        resource: Resource.KNOWLEDGE,
        costMultiplier: 1.4,
        maxBuy: undefined
    },
    thoughtJerk: {
        title: 'Thought Jerk',
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
        title: 'Insight Generation',
        cost: 1,
        resource: Resource.INSIGHT,
        costMultiplier: 1.2,
        maxBuy: undefined
    },
    studySmarter: {
        title: 'Smart Study',
        cost: 2,
        resource: Resource.INSIGHT,
        costMultiplier: 1.3,
        maxBuy: undefined
    },
    thoughtSnap: {
        title: 'Thought Snap',
        cost: 100,
        resource: Resource.INSIGHT,
        costMultiplier: 1.4,
        maxBuy: undefined
    },

    //WISDOM
    gainEP: {
        title: 'Enlighten yourself',
        cost: 10,
        resource: Resource.WISDOM,
        costMultiplier: 1.5,
        maxBuy: undefined
    },
    decreaseGeneratorExpRequirement: {
        title: 'T1 Discount',
        cost: 10,
        resource: Resource.WISDOM,
        costMultiplier: 2,
        maxBuy: undefined
    },

    //cheese
    enercheeGeneration: {
        title: 'Increase enerchee generation',
        cost: 5,
        resource: Resource.CHEESE,
        costMultiplier: 2,
        maxBuy: undefined
    },
    cheeseYield: {
        title: 'Your workers create more cheese but also take longer',
        cost: 15,
        resource: Resource.CHEESE,
        costMultiplier: 1.3,
        maxBuy: undefined
    },
    cheeseQueueLength: {
        title: 'Lengthen the Cheese Queue',
        cost: 50,
        resource: Resource.CHEESE,
        costMultiplier: 2,
        maxBuy: undefined
    },
    cheeseThoughtMult: {
        title: 'Cheese increases your thinking speed',
        cost: 300,
        resource: Resource.CHEESE,
        costMultiplier: 2,
        maxBuy: undefined
    },
    cheeseQueueOverclockingCost: {
        title: 'Divide the cost requirement of Overclocking ',
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
