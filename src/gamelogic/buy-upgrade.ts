import { get } from 'svelte/store'
import type { baseStore } from '@store/customStore'
import type { IUpgrade } from '@store/primitive/upgrades'
import { resource } from '@store'

type returnSignature = (upgradeName: string, buyMaxUpgrades: boolean) => void

export function buyUpgrade(upgrades: baseStore<Record<string, IUpgrade>>): returnSignature {
  // - upgrades is scoped here -

  return function (upgradeName: string, buyMaxUpgrades = false): void {
    upgrades.update($store => {
      // what if property upgradeName doesnt exist on $store?
      const upgrade: IUpgrade = $store[upgradeName]

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
}
