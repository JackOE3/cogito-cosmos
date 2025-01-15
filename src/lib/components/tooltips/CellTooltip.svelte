<script lang="ts">
    import { cellEffectDescription, getAreaOfEffectDescription, getTotalEffectValue } from '$lib/gamelogic/cell-effects.svelte'
    import { formatFactor, formatNumber, formatWhole, square } from '$lib/gamelogic/utils'
    import { resource, type CellContent, type EffectType } from '$lib/store'

    type Props = {
        data: CellContent
        top: number
        left: number
    }
    const { data: content, top, left }: Props = $props()

    let name: string = $state('Unnamed')
    if (content.type === 'upgrade') name = 'Upgrade'
    else if (content.type === 'generator') name = 'Generator'
    else if (content.type === 'skill') name = 'Skill'
    else if (content.type === 'locked') name = 'Locked'

    // export let rect: DOMRect
    const style = `top: ${top}px; left: ${left}px;`

    const effectsWhereYouDivide: EffectType[] = ['decreaseUpgradeCost', 'decreaseSkillExpRequirement']
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
                        Cost:
                        {#if resource.value[content.cost.resource] < content.cost.current}
                            <span style="color: var(--text-disabled);">
                                {formatNumber(content.cost.current, 2)}
                            </span>
                        {:else}
                            {formatNumber(content.cost.current, 2)}
                        {/if}
                        {@html square[content.cost.resource]}
                    </span>
                {/if}
            {:else if content.type === 'generator' || content.type === 'skill'}
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
            {/if}
            {#if 'effect' in content}
                <li>
                    <span style="font-weight: bold; font-size: .75rem;">
                        {cellEffectDescription[content.effect.type]}
                    </span>
                </li>
                <ul>
                    <li>
                        Effect: {content.effect.formula === 'additive' ? '+' : ''}{formatFactor(content.effect.value.current)}
                        {#if 'currentCumulative' in content.effect.value}
                            per
                            {content.type === 'upgrade' ? 'upgrade' : content.type === 'skill' ? 'level' : '[unknown type]'}
                            ({content.effect.formula})
                        {/if}
                    </li>
                    <li>
                        Total Effect:
                        <span style="font-weight: bold; color: var(--accent);">
                            {getTotalEffectValue(content.effect)}x
                        </span>
                        {#if effectsWhereYouDivide.includes(content.effect.type)}
                            <br />
                            <span style="color: var(--text-medium-emphasis)"> (The value is divided by this factor) </span>
                        {/if}
                    </li>
                    <li>Area of Effect: {getAreaOfEffectDescription(content.effect.stencil)}</li>
                </ul>
            {/if}
            {#if content.type === 'skill'}
                <li>
                    Level: {formatWhole(content.level)}
                </li>
                <ul>
                    <li>
                        To next level: {formatNumber(content.currentExp, 1)}/{formatNumber(content.requiredExp.current, 1)} XP
                    </li>
                    <li>
                        XP gain: {formatNumber(content.expPerSec.current, 1)} XP/s
                    </li>
                </ul>
            {:else if content.type === 'upgrade'}
                <li>
                    Count:
                    {#if content.maxBuy}
                        {content.count}/{content.maxBuy}
                    {:else}
                        {content.count}
                    {/if}
                </li>
            {/if}
            {#if content.type === 'generator' || content.type === 'skill'}
                <hr style="margin-left: -0.75rem; width: calc(100% + 0.75rem);" />
                <li class="footer" style="color: var(--text-medium-emphasis)">Uses 1 AP while active</li>
                <li class="footer" style="color: var(--text-medium-emphasis)">Click to toggle</li>
            {:else if content.type === 'upgrade'}
                <hr style="margin-left: -0.75rem; width: calc(100% + 0.75rem);" />
                <li class="footer" style="color: var(--text-medium-emphasis)">Click to purchase</li>
            {/if}
        </ul>
    </div>
</div>

<style>
    .tooltip {
        position: absolute;
        min-width: 300px;
        max-width: 300px;
        box-sizing: border-box;
        background: rgba(19, 19, 19, 0.6);
        backdrop-filter: blur(4px);
    }
    ul {
        list-style-type: '> ';
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
