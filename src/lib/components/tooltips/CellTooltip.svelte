<script lang="ts">
    import { getAreaOfEffectDescription, getEffectDescription, getTotalEffectValue } from '$lib/gamelogic/cell-effects.svelte'
    import { formatNumber, formatWhole, square } from '$lib/gamelogic/utils'
    import type { CellContent } from '$lib/store'

    type Props = {
        data: CellContent
        top: number
        left: number
    }
    const { data: content, top, left }: Props = $props()

    let name: string = $state('Unnamed')
    if (content.type === 'upgrade') name = 'Upgrade'
    else if (content.type === 'generator') name = 'Basic Generator'
    else if (content.type === 'generatorDerivative') name = 'Derivative Generator'
    else if (content.type === 'locked') name = 'Locked'

    // export let rect: DOMRect
    const style = `top: ${top}px; left: ${left}px;`
</script>

<div class="tooltip" {style}>
    <div class="background">
        <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: bold; font-size: .875rem;">{name}</span>
            {#if content.type === 'upgrade'}
                {#if content.maxBuy !== undefined && content.count >= content.maxBuy}
                    <span style="color: var(--text-medium-emphasis)">This upgrade is maxed.</span>
                {:else}
                    <span>
                        Cost: {formatNumber(content.cost.current, 2)}
                        {@html square[content.cost.resource]}
                    </span>
                {/if}
            {:else if content.type === 'generator' || content.type === 'generatorDerivative'}
                {#if content.active}
                    <span>[Active]</span>
                {:else}
                    <span style="color: var(--text-disabled);">[Inactive]</span>
                {/if}
            {/if}
        </div>
        <hr />
        <ul id="tooltip-body">
            {#if 'description' in content && content.description}
                <li>
                    {@html content.description.join('<br>')}
                </li>
            {/if}
            {#if content.type === 'generator'}
                {@const gainMetric = `+${formatNumber(content.gain.current, 2)} ${square[content.gain.resource]}`}
                {@const costMetric = content.cost ? `/ -${formatNumber(content.cost.current, 2)} ${square[content.cost.resource]}` : ''}
                <li>
                    Get
                    {@html gainMetric}
                    {@html costMetric} every {formatNumber(content.baseDurationMillis / 1000 / content.speed.current, 2)}s
                </li>
            {:else if content.type === 'generatorDerivative'}
                <li>
                    Level: {formatWhole(content.level)} - {formatNumber(content.currentExp, 1)}/{formatNumber(content.requiredExp.current, 1)} XP - {formatNumber(
                        content.expPerSec.current,
                        1
                    )} XP/s
                </li>
            {/if}
            {#if 'effect' in content}
                <li>{getEffectDescription(content)}</li>
                <ul>
                    <li>Total Effect: {getTotalEffectValue(content.effect)}x</li>
                    <li>Area of Effect: {getAreaOfEffectDescription(content.effect.stencil)}</li>
                </ul>
            {/if}
            {#if content.type === 'generator' || content.type === 'generatorDerivative'}
                <li style="color: var(--text-medium-emphasis)">Uses 1 AP while active.</li>
                <li style="color: var(--text-medium-emphasis)">Click to toggle.</li>
            {:else if content.type === 'upgrade'}
                <li style="color: var(--text-medium-emphasis)">Click to purchase.</li>
            {/if}
        </ul>
    </div>
</div>

<style>
    .background {
        min-width: 200px;
        max-width: 280px;
    }
    ul {
        list-style-type: '> ';
        list-style-position: outside;
        padding: 0;
        margin: 0;
        padding-left: 0.75rem; /* Remove default indentation */
    }
    li {
        margin-bottom: 0.25rem; /* Adds space between list items */
    }

    /* Remove the margin for the last item */
    #tooltip-body > li:last-child {
        margin-bottom: 0rem;
    }
</style>
