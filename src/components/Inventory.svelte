<script lang="ts">
  import { get } from 'svelte/store';
  import { resourceStore } from '../stores/Resources'
  import Resource from './Resource.svelte';

</script>

<div id="inventory">
  <span>Inventory</span>
  {#each $resourceStore as resource}
    {#if resource.amount > 0}
      <div class="resource">{resource.amount} {resource.name}</div>
    {/if}
  {/each}

</div>

<style>
  #inventory {
    display: flex;
    flex-direction: column;
    width: 300px;
    margin: 0 20px;
    /*border: 2px solid black;*/
  }
   
</style>