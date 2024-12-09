import { get } from 'svelte/store'
import { resource, type IUpgrade, milkUpgradeMultiplies, milkUpgradeBasicMultiplier } from '$lib/store'
import type { baseStore } from '$lib/store/customStore'

type returnSignature = (upgradeName: string) => void

export function buyUpgradeMilk(upgrades: baseStore<Record<string, IUpgrade>>): returnSignature {
  // - upgrades is scoped here -

  return function (upgradeName: string): void {
    upgrades.update($store => {
      // what if property upgradeName doesnt exist on $store?
      const upgrade: IUpgrade = $store[upgradeName]

      let checkoutCost = 0
      const res = get(resource)[upgrade.resource]

      if (res < upgrade.cost) return $store

      milkUpgradeMultiplies.update($mult => {
        let resource: string | undefined
        let v: string | undefined

        if (upgradeName === 'milkThoughtsGain') {
          // get the correct V...
          v = 'V1'
          resource = 'thoughts'
        }
        if (v !== undefined && resource !== undefined) {
          const multipliers = milkUpgradeBasicMultiplier[resource][v]
          const upgradesPerVersion = multipliers.length
          $mult.thoughts *= multipliers[upgrade.bought % upgradesPerVersion]

          // PURCHASE SINGLE:
          checkoutCost = upgrade.cost
          upgrade.cost *= upgrade.costMultiplier
          upgrade.bought++
        }
        return $mult
      })

      resource.update($resource => {
        $resource[upgrade.resource] -= checkoutCost
        return $resource
      })

      return $store
    })
  }
}
