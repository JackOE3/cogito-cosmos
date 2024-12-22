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
        background: var(--progBarBgColor, var(--dp01));
        width: var(--widthProgBar, 4rem);
        height: var(--heightProgBar);
        overflow: hidden;
        position: relative;
        border-radius: 0px;
        border: 1px solid var(--dp08);
        box-sizing: border-box;
    }
    #innerBar {
        width: var(--progress, 0);
        /* background: var(--barColor, var(--text-high-emphasis)); */

        /*transition: width .25s ease-in-out;*/
        /* transition: linear 0.1s; should avoid this */
        height: inherit;
        border-radius: inherit;

        /* this will do the magic (clip the background) */
        -webkit-mask: linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0);
    }
    #innerBar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--barColor, var(--text-high-emphasis)); /* your gradient here */
    }
    #barLabel {
        display: flex;
        height: inherit;
        justify-content: center;
        align-items: center;
    }
</style>
