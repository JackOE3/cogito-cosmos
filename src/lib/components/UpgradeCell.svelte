<script lang="ts">
    import { buyUpgrade } from '$lib/gamelogic/buy-upgrade-cell'
    import { resource, type Cell, type UpgradeI } from '$lib/store'
    import type { Snippet } from 'svelte'
    import { tooltip } from './tooltips/tooltip.svelte'
    import UpgradeCellTooltip from './tooltips/UpgradeCellTooltip.svelte'
    import { applyCellEffects } from '$lib/gamelogic/cell-effects.svelte'

    type Props = {
        cell: Cell & { content: UpgradeI }
        buyMaxUpgrades?: boolean // setContext/getContext better?
        disabledClick?: boolean
        style?: string
        class?: string
        children?: Snippet
    }

    let { cell, buyMaxUpgrades = false, disabledClick = false, style, class: className, children }: Props = $props()

    const upgrade = cell.content
    const canAfford = $derived(resource.value[upgrade.cost.resource] >= upgrade.cost.current)
    const isMaxed = $derived(upgrade.maxBuy !== undefined && upgrade.count >= upgrade.maxBuy)

    function handleUpgradeClicked(): void {
        if (disabledClick) return
        buyUpgrade(cell, resource.value)(buyMaxUpgrades)
        applyCellEffects(cell)
    }
</script>

<button {style} class={className} class:disabledClick onclick={handleUpgradeClicked} class:disabled={(!canAfford || isMaxed) && !disabledClick}>
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
