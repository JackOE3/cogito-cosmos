import { makeStore, type baseStore } from '../customStore'
import { resource } from './resources'
import { get } from 'svelte/store'

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
    public resource: string,
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
  thoughtAcceleration: new Upgrade('thoughts', 10, 1.15),
  thoughtJerk: new Upgrade('thoughts', 1e8, 1.3),
  thoughtBoostStrength: new Upgrade('thoughts', 100, 2),
  thoughtBoostDuration: new Upgrade('thoughts', 150, 4, 11),
  thoughtBoostStack: new Upgrade('thoughts', 1e7, 5, 9),

  // Switzerland Simulator
  cheeseQueueLength: new Upgrade('cheese', 5, 2),
  cheeseYield: new Upgrade('cheese', 15, 1.3),
  cheeseThoughtMult: new Upgrade('cheese', 300, 2),
  cheeseQueueOverclockingCost: new Upgrade('cheese', 5e3, 1.5),

  // Moldy Cheese
  moldyCheeseConversionExponent: new Upgrade('moldyCheese', 5, 1.5),
  moldyCheeseHalfLife: new Upgrade('moldyCheese', 20, 1.3),
  moldyCheeseChance: new Upgrade('moldyCheese', 200, 2.5, 9),
  cheeseMonsterSpawnrate: new Upgrade('moldyCheese', 250, 2.0),
  cheeseMonsterCapacity: new Upgrade('moldyCheese', 500, 1.3), // multipler for cap should be smaller than for spawnrate, so neutral brainMode doesnt fill up 100% capacity

  // Loot
  cheeseMonsterDropRate: new Upgrade('cheeseBrains', 5, 2, 18),
  cheeseMonsterLoot: new Upgrade('cheeseBrains', 10, 1.15),
  cheeseMonsterSentience: new Upgrade('cheeseBrains', 20, 1.2),
  cheeseMonsterMoldiness: new Upgrade('cheeseBrains', 100, 1.25),

  // Milk Power
  milkPowerGain: new Upgrade('milkPower', 100, 2),
  cheeseMonsterCapacityPerUpgrade: new Upgrade('milkPower', 1000, 1.5),

  // Milk
  milkThoughtsGain: new Upgrade('milk', 10, 1.5),
  milkCheeseGain: new Upgrade('milk', 10, 1.5),
  milkMoldyCheeseGain: new Upgrade('milk', 10, 1.5),
  milkMonsterGain: new Upgrade('milk', 10, 1.5),
}

export const upgrades = makeStore(upgradesInitial)

interface upgradesStore<T> extends baseStore<T> {
  buy: (name: string, buyMaxUpgrades: boolean) => void
}

function makeUpgradesStore<T>(initialState: T): upgradesStore<T> {
  const store = makeStore<T>(initialState)

  const buy = (name: string, buyMaxUpgrades = false): void => {
    store.update($store => {
      const upgrade: IUpgrade = $store[name]

      let checkoutCost = 0
      const res = get(resource)[upgrade.resource]

      if (res < upgrade.cost) return $store

      if (!buyMaxUpgrades) {
        // PURCHASE SINGLE:
        checkoutCost = upgrade.cost
        upgrade.cost *= upgrade.costMultiplier
        upgrade.bought++
      } else {
        // PURCHASE MAX:
        const cost = upgrade.cost
        const costMult = upgrade.costMultiplier
        // used formulas for geometric series (because of the exponential cost curve of the upgrades)
        const numUpgradesAffordable = Math.floor(Math.log((res / cost) * (costMult - 1) + 1) / Math.log(costMult))
        const totalPrice = (cost * (Math.pow(costMult, numUpgradesAffordable) - 1)) / (costMult - 1)

        checkoutCost = totalPrice
        upgrade.cost *= Math.pow(costMult, numUpgradesAffordable)
        upgrade.bought += numUpgradesAffordable
        // alert("Upgrades affordable: " + numUpgradesAffordable + ", Total Prize: " + totalPrice)
      }

      resource.update($resource => {
        $resource[upgrade.resource] -= checkoutCost
        return $resource
      })

      return $store
    })
  }

  return { ...store, buy }
}
