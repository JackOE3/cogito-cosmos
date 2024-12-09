import { makeStore } from '../customStore'
import { Resource } from './resources'

export interface IUpgrade {
    id: number
    resource: string
    cost: number
    costMultiplier: number
    maxBuy: number | null
    bought: number
}

class Upgrade implements IUpgrade {
    static #id = 0
    public id: number

    constructor(
        public resource: Resource,
        public cost: number,
        public costMultiplier: number,
        public maxBuy: number | null = null,
        public bought = 0
    ) {
        this.id = Upgrade.#id++
    }
}

export const upgradesInitial: Record<string, IUpgrade> = {
    // Cogito Ergo Sum
    thoughtAcceleration: new Upgrade(Resource.THOUGHTS, 10, 1.15),
    thoughtJerk: new Upgrade(Resource.THOUGHTS, 1e8, 1.3),
    thoughtBoostStrength: new Upgrade(Resource.THOUGHTS, 100, 2),
    thoughtBoostDuration: new Upgrade(Resource.THOUGHTS, 150, 4, 11),
    thoughtBoostStack: new Upgrade(Resource.THOUGHTS, 5e7, 5, 8),

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

export const upgrades = makeStore(upgradesInitial)
