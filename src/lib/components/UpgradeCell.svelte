<script lang="ts">
    import { buyUpgrade } from '$lib/gamelogic/buy-upgrade-v2'
    import { derivedGrid, formulas, resource, type GeneratorResource, type UpgradeI, type UpgradeType } from '$lib/store'
    import type { Snippet } from 'svelte'
    import { tooltip } from './tooltips/tooltip.svelte'
    import { formatNumber } from '$lib/gamelogic/utils'

    type Props = {
        upgrade: UpgradeI
        buyMaxUpgrades?: boolean // setContext/getContext better?
        style?: string
        class?: string
        children?: Snippet
    }

    let { upgrade, buyMaxUpgrades = false, style, class: className, children }: Props = $props()

    const canAfford = $derived(resource.value[upgrade.resource] >= upgrade.cost)
    const isMaxed = $derived(upgrade.maxBuy !== undefined && upgrade.count >= upgrade.maxBuy)

    function handleUpgradeClicked(): void {
        buyUpgrade(upgrade, resource.value)(buyMaxUpgrades)
    }

    // very hacky
    let arg: unknown
    if (upgrade.upgradeType === 'addGeneratorGain' || upgrade.upgradeType === 'addGeneratorSpeed') {
        arg = upgrade.forGeneratorResource
    }

    /**
     * Depending on the type of upgrade, supply the formula/function to calculate what value it changes.
     */
    const formulaDict: Record<UpgradeType, (upgrades: UpgradeI[]) => number> = {
        //to insert other dependencies into the formula (there will be others):
        addAttack: upgrades => formulas.attack(upgrades),
        //clean but probably wont be enough:
        multAttack: formulas.attack,
        //paceholder:
        addGeneratorGain: upgrades => formulas.generatorGainForResource(upgrades)[arg as GeneratorResource],
        addGeneratorSpeed: upgrades => formulas.generatorDurationForResource(upgrades)[arg as GeneratorResource] / 1000
    }
    const valueNameDict: Record<UpgradeType, string> = {
        addAttack: 'Attack',
        multAttack: 'Attack',
        addGeneratorGain: 'Red/Fill',
        addGeneratorSpeed: 'Duration'
    }

    const tooltipText = $derived.by(() => {
        if (!upgrade.description) return null
        //console.log('tooltipTextUpgrade')
        const upgradesSnapshot = $state.snapshot(derivedGrid.upgradesInCellGrid) as UpgradeI[]
        const upgradeSnap = upgradesSnapshot.find(u => u.id == upgrade.id)
        const currentValue = formulaDict[upgrade.upgradeType](upgradesSnapshot)
        upgradeSnap!.count++
        const newValue = formulaDict[upgrade.upgradeType](upgradesSnapshot)

        const valueName = valueNameDict[upgrade.upgradeType]

        return `${upgrade.description.join('<br>')} <br> ${valueName}: ${formatNumber(currentValue, 2)} -> ${formatNumber(newValue, 2)} <br> Cost: ${formatNumber(upgrade.cost, 2)} ${upgrade.resource}`
    })
</script>

<button {style} class={className} onclick={handleUpgradeClicked} class:disabled={!canAfford || isMaxed} class:maxed={isMaxed}>
    <div class="full" use:tooltip={() => ({ data: tooltipText })}>
        <!-- {upgrades[upgradeName].title} -->
        {@render children?.()}
    </div>
</button>

<style>
    button {
        padding: 0;
    }
    div {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
