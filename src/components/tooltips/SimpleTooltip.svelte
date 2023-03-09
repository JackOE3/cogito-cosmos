<script lang="ts">
  export let data: string
  export let x: number
  export let y: number
</script>

<div style="top: {y + 10}px; left: {x + 5}px;">
  {@html data}
</div>

<style>
  div {
    background-color: rgb(10, 10, 10);
    color: white;
    border: 1px white solid;
    box-shadow: 4px 4px 4px black;

    width: fit-content;
    /* border: 1px solid var(--secondary); */
    padding: 12px;
    position: absolute;
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 0rem;
    /*     box-shadow: 4px 4px var(--Gray900); */
  }
</style>
