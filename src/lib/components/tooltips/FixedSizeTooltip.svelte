<script lang="ts">
    export let top = 0
    export let left = 0
    export let data: unknown = 'No Tooltip'

    const style = `top: ${top}px; left: ${left - 300 / 2 + 100 / 2 - 12 / 2}px;`
</script>

<div {style}>
    {@html data}
</div>

<style>
    * {
        --width: 300px;
        --padding: 12px;
    }
    div {
        background-color: rgb(10, 10, 10);
        color: white;
        border: 1px white solid;
        box-shadow: 4px 4px 4px black;

        width: var(--width);
        /* border: 1px solid var(--secondary); */
        padding: var(--padding);
        position: absolute;
        display: flex;
        flex-direction: column;
        text-align: center;
        gap: 0rem;
        /*     box-shadow: 4px 4px var(--Gray900); */
    }
    div::before,
    div::after {
        content: ' ';
        position: absolute;
        bottom: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent white transparent;
    }
    /* div::after {
    border-color: transparent transparent black transparent;
    margin-left: -5px;
    border-width: 5px;
  } */
</style>
