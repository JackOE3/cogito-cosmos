<script lang="ts">
  import { devToolsEnabled, resource } from '$lib/store'
  import { recalculateStores } from '$lib/gamelogic/saveload'
</script>

{#if $devToolsEnabled}
  <div id="devTools">
    <div id="devControls">
      <strong>Developer Tools</strong>
      <button on:click={recalculateStores}>Recalc Stores</button>

      <span>thoughts</span>
      <input type="number" bind:value={$resource.thoughts} />
      <div style="display:flex;">
        <button on:click={() => ($resource.thoughts += 1000)}>+1K</button>
        <button on:click={() => ($resource.thoughts += 100000)}>+100K</button>
        <button on:click={() => ($resource.thoughts += 1000000)}>+1M</button>
        <button on:click={() => ($resource.thoughts *= 10)}>*10</button>
        <button on:click={() => ($resource.thoughts /= 10)}>/10</button>
      </div>

      <span>cheese</span>
      <input type="number" bind:value={$resource.cheese} />
      <div style="display:flex;">
        <button on:click={() => ($resource.cheese += 1000)}>+1K</button>
        <button on:click={() => ($resource.cheese += 100000)}>+100K</button>
        <button on:click={() => ($resource.cheese += 1000000)}>+1M</button>
        <button on:click={() => ($resource.cheese *= 10)}>*10</button>
        <button on:click={() => ($resource.cheese /= 10)}>/10</button>
      </div>

      <span>moldy cheese</span>
      <input type="number" bind:value={$resource.moldyCheese} />
      <div style="display:flex;">
        <button on:click={() => ($resource.moldyCheese += 1000)}>+1K</button>
        <button on:click={() => ($resource.moldyCheese += 100000)}>+100K</button>
        <button on:click={() => ($resource.moldyCheese += 1000000)}>+1M</button>
        <button on:click={() => ($resource.moldyCheese *= 10)}>*10</button>
        <button on:click={() => ($resource.moldyCheese /= 10)}>/10</button>
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
