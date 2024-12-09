<script lang="ts">
    import { onMount } from 'svelte'

    let container: HTMLElement
    let label: HTMLElement

    /* function handleResize(){
    label.style.width = window.getComputedStyle(container).getPropertyValue('width')
    console.log("resize")
  } */
    onMount(() => {
        // let the barLabel "inherit" the width from the container
        label.style.width = window.getComputedStyle(container).getPropertyValue('width')
    })
</script>

<div>
    <div id="outerContainer" bind:this={container}>
        <div id="innerBar">
            <span id="barLabel" bind:this={label}>
                <slot />
            </span>
        </div>
    </div>
</div>

<style>
    #outerContainer {
        background: var(--barBgColor, var(--Gray800));
        width: var(--width, 4rem);
        height: var(--height);
        overflow: hidden;
        position: relative;
        border-radius: 2px;
    }
    #innerBar {
        background-color: var(--barColor, var(--secondary));
        width: var(--progress, 0);
        /*transition: width .25s ease-in-out;*/
        /* transition: linear 0.2s; */
        height: inherit;
        border-radius: inherit;
    }
    #barLabel {
        display: flex;
        height: inherit;
        justify-content: center;
        align-items: center;
    }
</style>
