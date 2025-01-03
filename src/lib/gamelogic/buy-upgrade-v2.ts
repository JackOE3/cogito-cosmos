import { type Resources, type UpgradeBaseI } from '$lib/store'

type returnSignature = (buyMaxUpgrades: boolean) => void

export function buyUpgrade(upgrade: UpgradeBaseI, resource: Resources): returnSignature {
    // - upgrades is scoped here -

    return function (buyMaxUpgrades = false): void {
        if (typeof upgrade === 'undefined') return

        const res = resource[upgrade.resource]

        if (upgrade.maxBuy !== undefined && upgrade.count >= upgrade.maxBuy) return
        if (res < upgrade.cost) return

        if (!buyMaxUpgrades) {
            // PURCHASE SINGLE:
            resource[upgrade.resource] -= upgrade.cost
            upgrade.cost *= upgrade.costMultiplier
            upgrade.count++
        } else {
            // PURCHASE MAX:
            const cost = upgrade.cost
            const costMult = upgrade.costMultiplier
            // used formulas for geometric series (because of the exponential cost curve of the upgrades)
            const numUpgradesAffordable = Math.floor(Math.log((res / cost) * (costMult - 1) + 1) / Math.log(costMult))
            const totalCost = (cost * (Math.pow(costMult, numUpgradesAffordable) - 1)) / (costMult - 1)

            resource[upgrade.resource] -= totalCost
            upgrade.cost *= Math.pow(costMult, numUpgradesAffordable)
            upgrade.count += numUpgradesAffordable
            // alert("Upgrades affordable: " + numUpgradesAffordable + ", Total Prize: " + totalPrice)
        }
    }
}
