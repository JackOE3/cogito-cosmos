<script lang="ts">
  import Building from './Building.svelte'
  import {building} from "../stores/mainStore";
</script>


<div id="infrastructure">
  <h1>Infrastructure</h1>
  {#each $building as building}
    <Building {building} />
  {/each}
</div>

<style>
  h1 {
    font-size: 20px;
    text-align: center;
  }
  #infrastructure {
    width: 240px;
    margin: 0 20px;
    /*border: 1px solid black;*/
  }
</style>