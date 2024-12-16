<script lang="ts">
    import { onMount, type Snippet } from 'svelte'
    import { fade } from 'svelte/transition'

    type Props = {
        title: string
        themeId: string
        children: Snippet
    }
    let { title = '', themeId, children }: Props = $props()

    let windowBar: HTMLElement

    onMount(() => {
        windowBar.onmouseenter = (): void => {
            windowBar.style.cursor = 'pointer'
        }
    })
</script>

<div class="window-container" transition:fade|local={{ duration: 1000 }} data-theme-colors={themeId}>
    <div class="window-bar draggable" bind:this={windowBar}>
        {title}
    </div>

    <div class="content">
        {@render children()}
    </div>

    <div class="corner" id="corner-top-right"></div>
    <div class="corner" id="corner-top-left"></div>
    <div class="corner" id="corner-bottom-right"></div>
    <div class="corner" id="corner-bottom-left"></div>
</div>

<style>
    .window-container {
        position: relative;
        width: var(--width, max-content);
        height: max-content;
        /* box-shadow: 0 0 4px 0.25px black; */
        background-color: var(--background-color);

        outline: 1px black solid;

        border-left: var(--themeColor2);
        border-right: var(--themeColor2);
        border-top: var(--themeColor1);
        border-bottom: var(--themeColor1);
        border-width: 2px;
        border-style: solid;
        border-radius: 4px;
        /* box-shadow:
            0 0 5px 1px var(--themeColor1),
            inset 0 0 1px 2px rgba(0, 0, 0, 0.4); */
    }

    .content {
        width: var(--width, max-content);
        display: flex;
        flex-direction: column;
        row-gap: 16px;
        padding: 16px;
        margin-top: 10px;
        box-sizing: border-box;
    }

    .window-bar {
        cursor: pointer;
        font-weight: bold;
        text-align: center;
        color: white;
        text-shadow: 1px 1px 1px black;
        font-size: 1rem;

        position: absolute;
        top: calc(-0.75rem - 1px);
        left: 50%;
        translate: -50%;
        width: 68%;
        height: 1.25rem;
        padding: 2px;
        /*  background: linear-gradient(90deg, var(--themeColor1) 0%, var(--themeColor2) 50%, var(--themeColor1) 100%); */
        background: var(--special-bg, linear-gradient(90deg, var(--themeColor1) 0%, var(--themeColor2) 100%));
        /* linear-gradient(90deg, rgba(206, 147, 208, 1) 5%, rgba(129, 212, 250, 1) 60%, rgba(255, 171, 145, 1) 95%); */

        /* outline: 1px black solid; */
        box-shadow: 0px 1px 2px rgb(0, 0, 0);
        border-left: var(--themeColor2);
        border-right: var(--themeColor2);
        border-top: var(--themeColor2);
        border-bottom: var(--themeColor1);
        border-width: 0px;
        border-style: solid;
        border-bottom-right-radius: 0px;
        border-bottom-left-radius: 16px;
        border-top-right-radius: 16px;
        border-top-left-radius: 0px;
        border-radius: 8px;
        /* -webkit-clip-path: polygon(0% 48%, 20% 0%, 80% 0%, 100% 48%, 100% 52%, 80% 100%, 20% 100%, 0% 52%);
        clip-path: polygon(0% 48%, 20% 0%, 80% 0%, 100% 48%, 100% 52%, 80% 100%, 20% 100%, 0% 52%); */
    }

    .corner {
        --size: 10px;
        /* z-index: 0; */
        position: absolute;
        width: var(--size);
        height: var(--size);
        shape-rendering: geometricPrecision;
    }
    #corner-top-left {
        top: 0;
        left: 0;
        background: conic-gradient(from -45deg, var(--themeColor1), var(--themeColor2));
        border-bottom-right-radius: 10px;
        box-shadow: 1px 1px 0px 1px rgba(0, 0, 0, 0.4);
    }
    #corner-top-right {
        top: 0;
        right: 0;
        background: conic-gradient(from 45deg, var(--themeColor2), var(--themeColor1));
        border-bottom-left-radius: 10px;
        box-shadow: -1px 1px 0px 1px rgba(0, 0, 0, 0.4);
    }
    #corner-bottom-left {
        bottom: 0;
        left: 0;
        background: conic-gradient(from -135deg, var(--themeColor2), var(--themeColor1));
        border-top-right-radius: 10px;
        box-shadow: 1px -1px 0px 1px rgba(0, 0, 0, 0.4);
    }
    #corner-bottom-right {
        bottom: 0;
        right: 0;
        background: conic-gradient(from 135deg, var(--themeColor1), var(--themeColor2));
        border-top-left-radius: 10px;
        box-shadow: -1px -1px 0px 1px rgba(0, 0, 0, 0.4);
    }
</style>
