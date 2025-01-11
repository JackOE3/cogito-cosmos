<script lang="ts">
    import { formatNumber, formatWhole, square } from '$lib/gamelogic/utils'
    import type { EffectType, UpgradeI } from '$lib/store'

    type Props = {
        data: UpgradeI
        top: number
        left: number
    }
    const { data: upgrade, top, left }: Props = $props()

    // export let rect: DOMRect
    const style = `top: ${top}px; left: ${left}px;`

    const descriptionDict: Partial<Record<EffectType, string>> = {
        boostGeneratorGain: `Boost the gain of basic generators <br> by ${formatWhole(upgrade.effect.value.current * 100)}% per upgrade.`,
        boostGeneratorSpeed: `Boost the speed of basic generators <br> by ${formatWhole(upgrade.effect.value.current * 100)}% per upgrade.`
    }
</script>

<div class="tooltip" {style}>
    <div class="background">
        Upgrade <hr />
        {#if upgrade.description}
            {@html upgrade.description.join('<br>')} <br />
        {/if}
        {@html descriptionDict[upgrade.effect.type]} <br />
        Area of Effect: {upgrade.effect.stencil} <br />
        Total Effect: {formatNumber(1 + upgrade.effect.value.current * upgrade.count, 2)}x <br />
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
