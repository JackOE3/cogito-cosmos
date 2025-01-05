<script lang="ts">
    import { type CheeseFactoryMode, derivedState } from '$lib/store'

    type Props = {
        data: CheeseFactoryMode
        top: number
        left: number
    }
    const { data, top, left }: Props = $props()

    // export let rect: DOMRect
    const style = `top: ${top}px; left: ${left}px;`

    $effect(() => console.log(top, left))

    const cheeseModeDescription: Record<CheeseFactoryMode, string> = {
        meticulous: '"Quality over quantity"',
        nominal: 'Everything is working nominally.',
        warpSpeed: 'Trains the hand speed of your workers.'
    }
</script>

<div class="tooltip" id="cheeseFactoryProtocolInfo" {style}>
    <span style="text-decoration: underline; font-weight: bold; color: yellow; margin-bottom: 0.25rem">Cheesy Info</span>
    <br />
    <span style="display:flex;flex-direction:column;gap:0.25rem;">
        <span>{cheeseModeDescription[data]}</span>
        <span class="effect">
            Relative gain/duration/cost:
            {derivedState.cheeseModeStats[data].yield}x / {derivedState.cheeseModeStats[data].duration}x / {derivedState.cheeseModeStats[data].cost}x
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
