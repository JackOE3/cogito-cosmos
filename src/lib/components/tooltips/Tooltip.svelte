<script lang="ts">
    export let top = 0
    export let left = 0
    export let data: unknown = 'No Tooltip'

    /* const style = `top: ${rect.bottom + 10}px; left: ${rect.left + 4}px;` */
    const style = `top: ${top}px; left: ${left + 4}px;`
</script>

<div class="tooltip-arrow-up" {style}>
    {#if typeof data === 'string'}
        {@html data}
    {:else}
        Error: Invalid tooltip data type
    {/if}
</div>
