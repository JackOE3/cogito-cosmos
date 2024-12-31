<script lang="ts">
    import { buyUpgrade } from '$lib/gamelogic/buy-upgrade'
    import { upgrades, upgradeCount, resource, LORCA_OVERRIDE, Resource, type UpgradeName, upgradeCost } from '$lib/store'
    import type { Snippet } from 'svelte'
    import { tooltip } from './tooltips/tooltip.svelte'

    type Props = {
        upgradeName: UpgradeName
        tooltipText?: string | null
        buyMaxUpgrades?: boolean // setContext/getContext better?
        btnUnlocked?: boolean
        style?: string
        class?: string
        children?: Snippet
    }

    let { upgradeName, tooltipText = null, buyMaxUpgrades = false, btnUnlocked = true, style, class: className, children }: Props = $props()

    const resourceName = upgrades[upgradeName].resource
    let cost = $derived(upgradeCost.value[upgradeName])
    const canAfford = $derived(resource.value[resourceName as Resource] >= cost)
    const maxBuy = upgrades[upgradeName].maxBuy
    const isMaxed = $derived(maxBuy !== undefined && upgradeCount.value[upgradeName] >= maxBuy)
    const upgradesBought = $derived(upgradeCount.value[upgradeName])

    function handleUpgradeClicked(): void {
        buyUpgrade(upgrades, resource.value, upgradeCount.value, upgradeCost.value)(upgradeName, buyMaxUpgrades)
    }
</script>

<button
    {style}
    class={className}
    onclick={handleUpgradeClicked}
    class:disabled={(!canAfford && !isMaxed) || (!btnUnlocked && !LORCA_OVERRIDE.value)}
    class:maxed={isMaxed}
    data-theme-colors={resourceName}>
    <div class="full" use:tooltip={{ data: tooltipText }}>
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
