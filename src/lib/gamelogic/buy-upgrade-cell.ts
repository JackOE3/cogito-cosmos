import { type Resources, type UpgradeI, type Coordinate } from '$lib/store'
import { applyCellEffects } from './cell-effects'

type returnSignature = (buyMaxUpgrades: boolean) => void

export function buyUpgrade(upgrade: UpgradeI, coord: Coordinate, resource: Resources): returnSignature {
    // - upgrades is scoped here -

    return function (buyMaxUpgrades = false): void {
        if (typeof upgrade === 'undefined') return

        const res = resource[upgrade.cost.resource]

        if (upgrade.maxBuy !== undefined && upgrade.count >= upgrade.maxBuy) return
        if (res < upgrade.cost.current) return

        if (!buyMaxUpgrades) {
            // PURCHASE SINGLE:
            resource[upgrade.cost.resource] -= upgrade.cost.current
            upgrade.cost.current *= upgrade.costMultiplier
            upgrade.count++
            applyCellEffects(coord, upgrade.stencil, upgrade.effect, upgrade.boost, upgrade.id)
        } else {
            // PURCHASE MAX:
            const cost = upgrade.cost.current
            const costMult = upgrade.costMultiplier
            // used formulas for geometric series (because of the exponential cost curve of the upgrades)
            const numUpgradesAffordable = Math.floor(Math.log((res / cost) * (costMult - 1) + 1) / Math.log(costMult))
            const totalCost = (cost * (Math.pow(costMult, numUpgradesAffordable) - 1)) / (costMult - 1)

            resource[upgrade.cost.resource] -= totalCost
            upgrade.cost.current *= Math.pow(costMult, numUpgradesAffordable)
            upgrade.count += numUpgradesAffordable
            applyCellEffects(coord, upgrade.stencil, upgrade.effect, upgrade.boost * numUpgradesAffordable, upgrade.id)
            // alert("Upgrades affordable: " + numUpgradesAffordable + ", Total Prize: " + totalPrice)
        }
    }
}
