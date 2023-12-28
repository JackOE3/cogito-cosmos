<script lang="ts">
  export let src: string
  export let height = '100%'
  export let width = '100%'
</script>

<button on:click style="height: {height}; width: {width};">
  <img alt="expand info" {src} />
</button>

<style>
  button {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  img {
    width: 100%;
    transform: rotate(-90deg);
    filter: invert(100%);
  }
</style>
