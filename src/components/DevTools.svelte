<script lang="ts">
  import { devToolsEnabled, resource } from '@store/primitive'
  import { recalculateStores } from '../gamelogic/saveload'
</script>

{#if $devToolsEnabled}
  <div id="devTools">
    <div id="devControls">
      <strong>Developer Tools</strong>
      <button on:click={recalculateStores}>Recalc Stores</button>

      <span>thoughts</span>
      <input type="number" bind:value={$resource.thoughts} />
      <div style="display:flex;">
        <button on:click={() => ($resource.thoughts += 100)}>+100</button>
        <button on:click={() => ($resource.thoughts += 1000)}>+1K</button>
        <button on:click={() => ($resource.thoughts += 10000)}>+10K</button>
        <button on:click={() => ($resource.thoughts += 100000)}>+100K</button>
        <button on:click={() => ($resource.thoughts += 1000000)}>+1M</button>
      </div>

      <span>cheese</span>
      <input type="number" bind:value={$resource.cheese} />
      <div style="display:flex;">
        <button on:click={() => ($resource.cheese += 100)}>+100</button>
        <button on:click={() => ($resource.cheese += 1000)}>+1K</button>
        <button on:click={() => ($resource.cheese += 10000)}>+10K</button>
        <button on:click={() => ($resource.cheese += 100000)}>+100K</button>
        <button on:click={() => ($resource.cheese += 1000000)}>+1M</button>
      </div>

      <span>moldy cheese</span>
      <input type="number" bind:value={$resource.moldyCheese} />
      <div style="display:flex;">
        <button on:click={() => ($resource.moldyCheese += 100)}>+100</button>
        <button on:click={() => ($resource.moldyCheese += 1000)}>+1K</button>
        <button on:click={() => ($resource.moldyCheese += 10000)}>+10K</button>
        <button on:click={() => ($resource.moldyCheese += 100000)}>+100K</button>
        <button on:click={() => ($resource.moldyCheese += 1000000)}>+1M</button>
      </div>

      <span>cheese monsters</span>
      <input type="number" bind:value={$resource.cheeseMonster} />

      <span>cheese Brains</span>
      <input type="number" bind:value={$resource.cheeseBrains} />

      <span>milk</span>
      <input type="number" bind:value={$resource.milk} />
    </div>
  </div>
{/if}

<style>
  #devTools {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1;
    background-color: rgb(0, 0, 0, 0.8);
  }
  #devTools > #devControls {
    margin: 24px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
