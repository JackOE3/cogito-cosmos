<script lang="ts">
    import { fade } from 'svelte/transition'

    export let title = ''
</script>

<div class="container" transition:fade={{ duration: 1000 }}>
    <div class="header">
        <span class="windowTitle">{title}</span>
    </div>
    <div class="content">
        <slot />
    </div>
</div>

<style>
    .container {
        width: max-content;
        height: max-content;
        box-shadow: 0 0 4px 0.25px black;
        background-color: var(--Gray900);
        outline: 1px black solid;
        border: 2px rgb(255, 255, 255) ridge;
    }
    .content {
        background-color: var(--Gray900);
        width: var(--width, var(--window-width));
        height: max-content;
        display: flex;
        flex-direction: column;
        row-gap: 16px;
        padding: 12px;
        /*border-radius: 8px;*/
        position: relative;
    }
    .header {
        background: var(--bg);
        background-color: var(--Gray900);
        height: 2rem;
        margin: 0px;
        padding-left: 8px;
        display: flex;
        /* justify-content: center; */
    }
    .windowTitle {
        margin: 0;
        font-size: 1rem;
        font-weight: bold;
        align-self: center;
        text-shadow: 1px 1px 2px black;
    }
</style>
