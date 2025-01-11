<script lang="ts">
    import { buyUpgrade } from '$lib/gamelogic/buy-upgrade-cell'
    import { resource, type Cell, type UpgradeI } from '$lib/store'
    import type { Snippet } from 'svelte'
    import { tooltip } from './tooltips/tooltip.svelte'
    import UpgradeCellTooltip from './tooltips/UpgradeCellTooltip.svelte'

    type Props = {
        cell: Cell & { content: UpgradeI }
        buyMaxUpgrades?: boolean // setContext/getContext better?
        style?: string
        class?: string
        children?: Snippet
    }

    let { cell, buyMaxUpgrades = false, style, class: className, children }: Props = $props()

    const upgrade = cell.content
    const canAfford = $derived(resource.value[upgrade.cost.resource] >= upgrade.cost.current)
    const isMaxed = $derived(upgrade.maxBuy !== undefined && upgrade.count >= upgrade.maxBuy)

    function handleUpgradeClicked(): void {
        buyUpgrade(cell, resource.value)(buyMaxUpgrades)
    }
</script>

<button {style} class={className} onclick={handleUpgradeClicked} class:disabled={!canAfford || isMaxed}>
    <div class="full" class:maxed={isMaxed} use:tooltip={() => ({ data: upgrade, Component: UpgradeCellTooltip })}>
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
    .maxed {
        /* text-decoration: line-through; */
        /* background-color: var(--dp08); */
    }
</style>
