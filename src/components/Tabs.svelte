<script lang="ts">
  import {createEventDispatcher} from 'svelte';
  const dispatch = createEventDispatcher();
  export let items: string[];
  export let activeItem: string;
</script>

<div class="tabs">
  <ul>
    {#each items  as item}
      <li on:click={() => dispatch('tabChange', item)}>
        <div class:active={item === activeItem}>{item}</div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .tabs {
    margin-bottom: 30px;
  }
  ul {
    display: flex;
    justify-content: center;
    padding: 0;
    list-style-type: none;
  }
  li {
    margin: 0 10px;
    font-size: 18px;
    cursor: pointer;
  }
  .active {
    color: brown;
    border-bottom: 2px solid brown;
    padding-bottom: 2px;
    
  }
</style>