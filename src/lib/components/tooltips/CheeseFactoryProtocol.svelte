<script lang="ts">
    import { type CheeseFactoryMode, cheeseModeStats } from '$lib/store'

    export let data: CheeseFactoryMode
    export let top = 0
    export let left = 0
    const style = `top: ${top}px; left: ${left - 75}px;`

    const cheeseModeDescription: Record<CheeseFactoryMode, string> = {
        meticulous: '"Quality over quantity"',
        nominal: 'Everything is working nominally.',
        warpSpeed: 'Trains the hand speed of your workers.'
    }
</script>

<div class="tooltip-arrow-up" id="cheeseFactoryProtocolInfo" {style}>
    <span style="text-decoration: underline; font-weight: bold; color: yellow; margin-bottom: 0.25rem">Cheesy Info</span>
    <br />
    <span style="display:flex;flex-direction:column;gap:0.25rem;">
        <span>{cheeseModeDescription[data]}</span>
        <span class="effect">
            Relative gain/duration/cost:
            {cheeseModeStats[data].yield}x / {cheeseModeStats[data].duration}x / {cheeseModeStats[data].cost}x
        </span>
        {#if data === 'warpSpeed'}
            <span class="effect"> In this mode you are unable to produce byprodcuts. </span>
        {/if}
    </span>
</div>

<style>
    #cheeseFactoryProtocolInfo {
        width: 320px;
        text-align: left;
    }
    .effect::before {
        content: '⯁ ';
        color: yellow;
    }
</style>
