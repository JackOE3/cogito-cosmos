import { makeState } from '../customStore.svelte'
import { Resource, type ResourceType } from './resources.svelte'

export interface IUpgrade {
    resource: ResourceType
    cost: number
    costMultiplier: number
    maxBuy: number | null
}

class Upgrade implements IUpgrade {
    constructor(
        public resource: ResourceType,
        public cost: number,
        public costMultiplier: number,
        public maxBuy: number | null = null
    ) {}
}

export const upgrades = {
    // Cogito Ergo Sum
    // thoughts
    thoughtAcceleration: new Upgrade(Resource.THOUGHTS, 10, 1.15),
    thoughtJerk: new Upgrade(Resource.THOUGHTS, 1e8, 1.3),

    // knowledge
    thoughtBoost: new Upgrade(Resource.KNOWLEDGE, 100, 2),
    //thoughtBoostStrength: new Upgrade(Resource.KNOWLEDGE, 100, 2),
    //thoughtBoostDuration: new Upgrade(Resource.KNOWLEDGE, 150, 4, 11),
    //thoughtBoostStack: new Upgrade(Resource.KNOWLEDGE, 5e7, 5, 8),

    // Switzerland Simulator
    cheeseQueueLength: new Upgrade(Resource.CHEESE, 5, 2),
    cheeseYield: new Upgrade(Resource.CHEESE, 15, 1.3),
    cheeseThoughtMult: new Upgrade(Resource.CHEESE, 300, 2),
    cheeseQueueOverclockingCost: new Upgrade(Resource.CHEESE, 5e3, 1.5),

    // Moldy Cheese
    moldyCheeseConversionExponent: new Upgrade(Resource.MOLDY_CHEESE, 5, 1.5),
    moldyCheeseHalfLife: new Upgrade(Resource.MOLDY_CHEESE, 20, 1.3),
    moldyCheeseChance: new Upgrade(Resource.MOLDY_CHEESE, 200, 2.5, 9),
    cheeseMonsterSpawnrate: new Upgrade(Resource.MOLDY_CHEESE, 250, 2.0),
    cheeseMonsterCapacity: new Upgrade(Resource.MOLDY_CHEESE, 500, 1.3), // multipler for cap should be smaller than for spawnrate, so neutral brainMode doesnt fill up 100% capacity

    // Loot
    cheeseMonsterDropRate: new Upgrade(Resource.CHEESE_BRAINS, 5, 2, 18),
    cheeseMonsterLoot: new Upgrade(Resource.CHEESE_BRAINS, 10, 1.15),
    cheeseMonsterSentience: new Upgrade(Resource.CHEESE_BRAINS, 20, 1.2),
    cheeseMonsterMoldiness: new Upgrade(Resource.CHEESE_BRAINS, 100, 1.25),

    // Bacteria
    bacteriaGrowth: new Upgrade(Resource.BACTERIA, 100, 1.3),
    cheeseMonsterCapacityPerUpgrade: new Upgrade(Resource.BACTERIA, 1000, 1.5),
    multipleCheeseCycles: new Upgrade(Resource.BACTERIA, 1000, 1.5),
    multipleMonsterDeaths: new Upgrade(Resource.BACTERIA, 1000, 1.5),

    // Milk
    milkThoughtsGain: new Upgrade(Resource.MILK, 1, 1.5),
    milkCheeseGain: new Upgrade(Resource.MILK, 1, 2),
    milkMoldyCheeseGain: new Upgrade(Resource.MILK, 1, 2),
    milkCheeseBrainsGain: new Upgrade(Resource.MILK, 1, 1.5)
}

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
