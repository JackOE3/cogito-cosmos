import { type IUpgrade, type Resources, type UpgradeName } from '$lib/store'

type returnSignature = (upgradeName: UpgradeName, buyMaxUpgrades: boolean) => void

export function buyUpgrade(
    upgrades: Record<string, IUpgrade>,
    resource: Resources,
    upgradeCount: Record<UpgradeName, number>,
    upgradeCost: Record<UpgradeName, number>
): returnSignature {
    // - upgrades is scoped here -

    return function (upgradeName: UpgradeName, buyMaxUpgrades = false): void {
        const upgrade: IUpgrade = upgrades[upgradeName]

        if (typeof upgrade === 'undefined') return

        const res = resource[upgrade.resource]

        const currentCost = upgradeCost[upgradeName]
        if (res < currentCost) return

        if (!buyMaxUpgrades) {
            // PURCHASE SINGLE:
            resource[upgrade.resource] -= currentCost
            upgradeCost[upgradeName] *= upgrade.costMultiplier
            upgradeCount[upgradeName]++
        } else {
            // PURCHASE MAX:
            const cost = currentCost
            const costMult = upgrade.costMultiplier
            // used formulas for geometric series (because of the exponential cost curve of the upgrades)
            const numUpgradesAffordable = Math.floor(Math.log((res / cost) * (costMult - 1) + 1) / Math.log(costMult))
            const totalCost = (cost * (Math.pow(costMult, numUpgradesAffordable) - 1)) / (costMult - 1)

            resource[upgrade.resource] -= totalCost
            upgradeCost[upgradeName] *= Math.pow(costMult, numUpgradesAffordable)
            upgradeCount[upgradeName] += numUpgradesAffordable
            // alert("Upgrades affordable: " + numUpgradesAffordable + ", Total Prize: " + totalPrice)
        }
    }
}
