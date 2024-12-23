<script lang="ts">
    import type { Skill } from '$lib/store'

    type Props = {
        data: Skill
        top: number
        left: number
    }
    const { data, top, left }: Props = $props()

    // export let rect: DOMRect
    const style = `top: ${top}px; left: ${left}px;`
</script>

<div id="window" {style}>
    <span id="title">{data.name}</span>
    <hr />
    <span id="description">{@html data.description}</span>
    <span id="tooltip">{@html data.tooltipText}</span>
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
</style>
