import { get } from 'svelte/store'
import { noRef } from '../gamelogic/utils'
import { makeStore } from './customStore'
import { resource } from './resources'

export const upgradesInitial = {
  thoughtAcceleration: new Upgrade('thoughtAcceleration', 'thoughts', 10, 1.15),
  thoughtJerk: new Upgrade('thoughtJerk', 'thoughts', 500_000, 1.3),
  thoughtBoostStrength: new Upgrade(
    'thoughtBoostStrength',
    'thoughts',
    100,
    2.0
  ),
  thoughtBoostDuration: new Upgrade(
    'thoughtBoostDuration',
    'thoughts',
    150,
    1.4
  ),
  thoughtBoostStack: new Upgrade('thoughtBoostStack', 'thoughts', 1_000_000, 3),

  cheeseQueueLength: new Upgrade('cheeseQueueLength', 'cheese', 5, 2),
  cheeseYield: new Upgrade('cheeseYield', 'cheese', 15, 1.3),
  cheeseDuration: new Upgrade('cheeseDuration', 'cheese', 50, 1.4, 50),
  cheeseThoughtMult: new Upgrade('cheeseThoughtMult', 'cheese', 300, 2),

  moldyCheeseConversionExponent: new Upgrade(
    'moldyCheeseConversionExponent',
    'moldyCheese',
    3,
    1.5
  ),
  moldyCheeseHalfLife: new Upgrade(
    'moldyCheeseHalfLife',
    'moldyCheese',
    10,
    1.15
  ),
  moldyCheeseChance: new Upgrade(
    'moldyCheeseChance',
    'moldyCheese',
    50,
    1.5,
    9
  ),
  cheeseMonsterSpawnrate: new Upgrade(
    'cheeseMonsterSpawnrate',
    'moldyCheese',
    200,
    2.0
  ),
  cheeseMonsterCapacity: new Upgrade(
    'cheeseMonsterCapacity',
    'moldyCheese',
    400,
    2.5
  ),
}

export const upgrades = makeUpgradesStore()

function makeUpgradesStore() {
  const store = makeStore(upgradesInitial)

  const buy = (name: string, buyMaxUpgrades = false) => {
    store.update(($store) => {
      const upgrade = $store[name]

      let res: number
      const unsubscribe = resource.subscribe(
        ($resource) => (res = $resource[upgrade.resource])
      )

      if (res < upgrade.cost) return
      if (!buyMaxUpgrades) {
        // PURCHASE SINGLE:
        //res -= upgrade.cost
        resource.update(($resource) => {
          $resource[upgrade.resource] -= upgrade.cost
          return $resource
        })
        upgrade.cost *= upgrade.costMultiplier
        upgrade.bought++
        //console.log()
      } else {
        // PURCHASE MAX:
        const cost = upgrade.cost
        const costMult = upgrade.costMultiplier
        // used formulas for geometric series (because of the exponential cost curve of the upgrades)
        const numUpgradesAffordable = Math.floor(
          Math.log((res / cost) * (costMult - 1) + 1) / Math.log(costMult)
        )
        const totalPrice =
          (cost * (Math.pow(costMult, numUpgradesAffordable) - 1)) /
          (costMult - 1)

        res -= totalPrice
        upgrade.cost *= Math.pow(costMult, numUpgradesAffordable)
        upgrade.bought += numUpgradesAffordable
        //alert("Upgrades affordable: " + numUpgradesAffordable + ", Total Prize: " + totalPrice)
      }
      // force an update on the store:
      //$upgrades = $upgrades

      unsubscribe()

      return $store
    })
  }

  return { ...store, buy }
}

function Upgrade(
  name: string,
  resource: string,
  cost: number,
  costMultiplier: number,
  maxBuy: number = null,
  bought: number = 0
) {
  this.name = name
  this.resource = resource
  this.cost = cost
  this.costMultiplier = costMultiplier
  this.maxBuy = maxBuy
  this.bought = bought
}
