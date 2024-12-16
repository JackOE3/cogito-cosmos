<script lang="ts">
    export let top = 0
    export let left = 0
    export let data: unknown = 'No Tooltip'

    /* const style = `top: ${rect.bottom + 10}px; left: ${rect.left + 4}px;` */
    const style = `top: ${top}px; left: ${left}px;`
</script>

<div class="tooltip tooltip-arrow-left" {style}>
    <div class="background">
        {#if typeof data === 'string'}
            {@html data}
        {:else}
            Error: Invalid tooltip data type: {typeof data}
        {/if}
    </div>
</div>

<style>
    :global(.tooltip) {
        background-color: var(--background-color);
        position: absolute;
        width: max-content;
        border-radius: 0px;
        outline: 1px solid var(--dp24);
        box-shadow: 0px 0px 16px 4px black;
    }
    .background {
        padding: 0.5rem;
        /* background-color: rgba(0, 0, 0, 0.25); */
    }

    :global(.tooltip-arrow-up::before) {
        content: ' ';
        position: absolute;
        bottom: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent var(--background-color) transparent;
    }
</style>
