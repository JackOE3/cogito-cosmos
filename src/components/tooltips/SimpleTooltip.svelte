<script lang="ts">
  export let rect: DOMRect
  export let data = 'No Tooltip'
</script>

<div style="top: {rect.bottom + 10}px; left: {rect.left + 4}px;">
  {@html data}
</div>

<style>
  div {
          background-color: black;
    color: #e2e2e2;
    /* border: 1px var(--color) solid; */

    /* box-shadow: 4px 4px 4px black; */
    border-radius: 4px;

    width: fit-content;
    padding: 12px;
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
    border-color: transparent transparent black transparent;
  }
  /* div::after {
    border-color: transparent transparent black transparent;
    margin-left: -5px;
    border-width: 5px;
  } */
</style>
