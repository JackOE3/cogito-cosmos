<script lang="ts">
    import { formatResourceName, formatWhole } from '$lib/gamelogic/utils'
    import { resource } from '$lib/store'
    import type { IUnlock, UnlockType } from '$lib/store'

    type Props = {
        data: IUnlock
        top: number
        left: number
    }
    const { data, top, left }: Props = $props()

    // export let rect: DOMRect
    const style = `top: ${top}px; left: ${left}px;`

    const costColor = $derived(resource.value[data.resource] >= data.cost ? 'rgb(102, 255, 102)' : 'rgb(255, 102, 102)')
    //$: costColor = $resource[data.resource] > data.cost ? 'rgb(102, 255, 102)' : 'rgb(255, 102, 102)'

    const background: Record<UnlockType, string> = {
        Boost: 'linear-gradient(to top, var(--Gray400) 20%, white 80%)',
        Unlock: 'linear-gradient(0deg, yellow 20%, rgba(255,251,125,1) 80%',
        Mechanic: 'green',
        Effect: 'blue'
    }
</script>

<div id="window" {style}>
    <span id="title">{data.title}</span>
    <hr />
    <span id="description">{@html data.description}</span>
    <span id="tooltip">{@html data.tooltipText}</span>

    <div style="display: flex; flex-direction:row; justify-content: space-between; margin-top: 4px ">
        <div id="type">{data.type}</div>
        <div id="cost" style="color:{costColor}">{formatWhole(data.cost)} {formatResourceName(data.resource)}</div>
    </div>
</div>

<style>
    * {
        --width: 300px;
        --padding: 12px;
    }
    #window {
        position: relative;
        background: radial-gradient(rgb(40, 40, 40), var(--background-color));
        background-color: var(--background-color);
        border: 1px var(--color) solid;
        box-shadow: 0px 0px 16px 4px black;

        width: var(--width);
        height: max-content;
        /* border: 1px solid var(--secondary); */
        padding: var(--padding);
        position: absolute;
        display: flex;
        flex-direction: column;
        text-align: center;
        gap: 0rem;
        /*     box-shadow: 4px 4px var(--Gray900); */
    }
    hr {
        width: 250px;
        border: 0;
        height: 1px;
        background-image: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.75), transparent);
    }
    #title {
        font-size: 0.875rem;
        font-weight: bold;
    }
    #type {
        font-weight: bold;
        width: max-content;
        border-radius: 9999px;
        /* outline: 1px solid rgba(0, 0, 0, 0.6); */
        /* border: 1px solid var(--Gray500); */
        padding: 4px;
        padding-left: 8px;
        padding-right: 8px;
        /* background: linear-gradient(to top, var(--Gray400) 20%, white 80%); */
        background-color: var(--text-high-emphasis);
        color: rgba(0, 0, 0, 0.87);
        box-shadow: 1px 1px 3px black;
    }
    #description {
        margin-bottom: 8px;
    }
    #tooltip {
        opacity: var(--medium-emphasis);
        font-style: oblique;
        text-align: right;
        margin-bottom: 4px;
        margin-left: 20px;
    }
    #cost {
        align-self: flex-end;
        font-weight: bold;
        text-align: right;
    }
</style>
