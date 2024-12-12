import { get } from 'svelte/store'
import { resource, type IUpgrade, type UpgradeName } from '$lib/store'
import type { baseStore } from '$lib/store/customStore'

type returnSignature = (upgradeName: UpgradeName, buyMaxUpgrades: boolean) => void

export function buyUpgrade(
    upgrades: Record<string, IUpgrade>,
    upgradeCount: baseStore<Record<UpgradeName, number>>,
    upgradeCost: baseStore<Record<UpgradeName, number>>
): returnSignature {
    // - upgrades is scoped here -

    return function (upgradeName: UpgradeName, buyMaxUpgrades = false): void {
        const upgrade: IUpgrade = upgrades[upgradeName]

        if (typeof upgrade === 'undefined') return

        let checkoutCost = 0
        const res = get(resource)[upgrade.resource]

        const currentCost = get(upgradeCost)[upgradeName]
        if (res < currentCost) return

        if (!buyMaxUpgrades) {
            // PURCHASE SINGLE:
            resource.update($resource => {
                $resource[upgrade.resource] -= currentCost
                return $resource
            })
            upgradeCost.update(cost => {
                cost[upgradeName] *= upgrade.costMultiplier
                return cost
            })
            upgradeCount.update(count => {
                count[upgradeName]++
                return count
            })
        } else {
            // PURCHASE MAX:
            const cost = currentCost
            const costMult = upgrade.costMultiplier
            // used formulas for geometric series (because of the exponential cost curve of the upgrades)
            const numUpgradesAffordable = Math.floor(Math.log((res / cost) * (costMult - 1) + 1) / Math.log(costMult))
            const totalCost = (cost * (Math.pow(costMult, numUpgradesAffordable) - 1)) / (costMult - 1)

            resource.update($resource => {
                $resource[upgrade.resource] -= totalCost
                return $resource
            })
            upgradeCost.update(cost => {
                cost[upgradeName] *= Math.pow(costMult, numUpgradesAffordable)
                return cost
            })
            upgradeCount.update(u => {
                u[upgradeName] += numUpgradesAffordable
                return u
            })
            // alert("Upgrades affordable: " + numUpgradesAffordable + ", Total Prize: " + totalPrice)
        }
    }
}
