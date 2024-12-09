import { makeStore, type baseStore } from '../customStore'
import { resource } from './resources'
import { get } from 'svelte/store'

interface IUpgradeTiered {
    id: number
    resource: string
    cost: number
    costMultiplier: number
    effectMultiplierInTier: number[]
    upgradesToNextTier: number[]
    totalEffectMultiplier: number
    tierUpMultipler: number
    tier: number
    maxTier: number
    bought: number
}

class UpgradeTiered implements IUpgradeTiered {
    static #id = 0
    public id: number

    constructor(
        public resource: string,
        public cost: number,
        public costMultiplier: number,
        public effectMultiplierInTier: number[],
        public upgradesToNextTier: number[],
        public totalEffectMultiplier: number = 1,
        public tierUpMultipler: number = 5,
        public tier: number = 1,
        public maxTier: number = 5,
        public bought = 0
    ) {
        this.id = UpgradeTiered.#id++
    }
}

export const upgradesTieredInitial: Record<string, IUpgradeTiered> = {}

export const upgradesTiered = makeUpgradesStore(upgradesTieredInitial)

interface upgradesStore<T> extends baseStore<T> {
    buy: (name: string) => void
}

function makeUpgradesStore<T>(initialState: T): upgradesStore<T> {
    const store = makeStore(initialState)

    const buy = (name: string): void => {
        store.update($store => {
            const upgrade: IUpgradeTiered = $store[name]

            let checkoutCost = 0
            const res = get(resource)[upgrade.resource]

            if (res < upgrade.cost) return $store

            checkoutCost = upgrade.cost
            upgrade.cost *= upgrade.costMultiplier
            upgrade.bought++
            upgrade.totalEffectMultiplier *= upgrade.effectMultiplierInTier[upgrade.tier - 1]

            const toNextTier = upgrade.upgradesToNextTier[upgrade.tier - 1]
            if (toNextTier !== undefined && upgrade.bought >= toNextTier) {
                upgrade.tier++
                upgrade.bought = 0
                // divide thru costMultiplier so it cancels out
                upgrade.cost *= upgrade.tierUpMultipler / upgrade.costMultiplier
                upgrade.totalEffectMultiplier *= 10
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
