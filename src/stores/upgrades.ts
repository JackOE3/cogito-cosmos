import { makeStore, type baseStore } from './customStore'
import { resource } from './resources'
import { get } from 'svelte/store'

console.log('upgrades.ts')

interface IUpgrade {
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
  public resource: string
  public cost: number
  public costMultiplier: number
  public maxBuy: number | null
  public bought: number

  constructor(resource: string, cost: number, costMultiplier: number, maxBuy: number | null = null, bought = 0) {
    this.id = Upgrade.#id++
    this.resource = resource
    this.cost = cost
    this.costMultiplier = costMultiplier
    this.maxBuy = maxBuy
    this.bought = bought
  }
}

export const upgradesInitial: Record<string, IUpgrade> = {
  // Cogito Ergo Sum
  thoughtAcceleration: new Upgrade('thoughts', 10, 1.15),
  thoughtJerk: new Upgrade('thoughts', 500_000, 1.3),
  thoughtBoostStrength: new Upgrade('thoughts', 100, 2.0),
  thoughtBoostDuration: new Upgrade('thoughts', 150, 1.4),
  thoughtBoostStack: new Upgrade('thoughts', 1_000_000, 3),

  // Switzerland Simulator
  cheeseQueueLength: new Upgrade('cheese', 5, 2),
  cheeseYield: new Upgrade('cheese', 15, 1.3),
  cheeseDuration: new Upgrade('cheese', 50, 1.4, 50),
  cheeseThoughtMult: new Upgrade('cheese', 300, 2),

  // Moldy Cheese
  moldyCheeseConversionExponent: new Upgrade('moldyCheese', 3, 1.5),
  moldyCheeseHalfLife: new Upgrade('moldyCheese', 10, 1.15),
  moldyCheeseChance: new Upgrade('moldyCheese', 50, 1.5, 9),
  cheeseMonsterSpawnrate: new Upgrade('moldyCheese', 200, 2.0),
  cheeseMonsterCapacity: new Upgrade('moldyCheese', 400, 2.5),

  // Loot
  cheeseMonsterDropRate: new Upgrade('cheeseBrains', 5, 1.5, 18),
  cheeseMonsterLoot: new Upgrade('cheeseBrains', 10, 1.15),
  cheeseMonsterSentience: new Upgrade('cheeseBrains', 20, 1.2),
}

export const upgrades = makeUpgradesStore(upgradesInitial)

interface upgradesStore<T> extends baseStore<T> {
  buy: (name: string, buyMaxUpgrades: boolean) => void
}

function makeUpgradesStore<T>(initialState: T): upgradesStore<T> {
  const store = makeStore(initialState)

  const buy = (name: string, buyMaxUpgrades = false): void => {
    store.update($store => {
      const upgrade: IUpgrade = $store[name]

      let checkoutCost = 0
      const res = get(resource)[upgrade.resource]

      // for displayed and deducted cost, Math.floor() is used for consistency with whole numbers displayed
      if (res < Math.floor(upgrade.cost)) return $store
      if (!buyMaxUpgrades) {
        // PURCHASE SINGLE:
        checkoutCost = Math.floor(upgrade.cost)
        upgrade.cost *= upgrade.costMultiplier
        upgrade.bought++
      } else {
        // PURCHASE MAX:
        const cost = upgrade.cost
        const costMult = upgrade.costMultiplier
        // used formulas for geometric series (because of the exponential cost curve of the upgrades)
        const numUpgradesAffordable = Math.floor(Math.log((res / cost) * (costMult - 1) + 1) / Math.log(costMult))
        const totalPrice = (cost * (Math.pow(costMult, numUpgradesAffordable) - 1)) / (costMult - 1)

        checkoutCost = Math.floor(totalPrice)
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
