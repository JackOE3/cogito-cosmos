<script lang="ts">
  import Resource from './Resource.svelte'
  import {resourceStore} from "../stores/Resources";
  //$resource needs to be passed down as a prop,
  //because the Resource component needs a specific resource, not the whole list
</script>

<div id="resources">
  <h1>Resources</h1>
  {#each $resourceStore as resource}
    <Resource {resource}/>
  {/each}
</div>

<style>
  h1 {
    font-size: 20px;
    text-align: center;
  }
  #resources {
    width: min-content;
    margin: 0 20px;
    /*border: 1px solid black;*/
  }
</style>