<script lang="ts">
    import { getEffectDescription } from '$lib/gamelogic/cell-effects.svelte'
    import { formatNumber, formatWhole, square } from '$lib/gamelogic/utils'
    import type { UpgradeI } from '$lib/store'

    type Props = {
        data: UpgradeI
        top: number
        left: number
    }
    const { data: upgrade, top, left }: Props = $props()

    // export let rect: DOMRect
    const style = `top: ${top}px; left: ${left}px;`
</script>

<div class="tooltip" {style}>
    <div class="background">
        Upgrade <hr />
        {#if upgrade.description}
            {@html upgrade.description.join('<br>')} <br />
        {/if}
        {getEffectDescription(upgrade)} <br />
        Total Effect: {formatNumber(1 + upgrade.effect.value.currentCumulative!, 2)}x <br />
        Area of Effect: {upgrade.effect.stencil} <br />
        {#if upgrade.maxBuy !== undefined && upgrade.count >= upgrade.maxBuy}
            <span style="color: var(--text-medium-emphasis)">This upgrade is maxed.</span>
        {:else}
            Cost: {formatNumber(upgrade.cost.current, 2)}
            {@html square[upgrade.cost.resource]}
        {/if}
    </div>
</div>

<style>
</style>
