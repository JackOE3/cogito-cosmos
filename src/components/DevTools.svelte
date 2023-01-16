<script lang="ts">
  import {devToolsEnabled, thoughts, cheese, moldyCheese} from '../stores/mainStore'
</script>

{#if $devToolsEnabled}
  <div id="devTools">
    <div id="devControls">
      <strong>Developer Tools</strong>

      <span>add thoughts</span>
      <input type=number bind:value={$thoughts}>
      <div style="display:flex;">
        <button on:click={() => $thoughts += 1}>+1</button>
        <button on:click={() => $thoughts += 10}>+10</button>
        <button on:click={() => $thoughts += 100}>+100</button>
        <button on:click={() => $thoughts += 1000}>+1K</button>
        <button on:click={() => $thoughts += 10000}>+10K</button>
        <button on:click={() => $thoughts += 100000}>+100K</button>
      </div>

      <span>add cheese</span>
      <input type=number bind:value={$cheese}>
      <div style="display:flex;">
        <button on:click={() => $cheese += 1}>+1</button>
        <button on:click={() => $cheese += 10}>+10</button>
        <button on:click={() => $cheese += 100}>+100</button>
        <button on:click={() => $cheese += 1000}>+1K</button>
        <button on:click={() => $cheese += 10000}>+10K</button>
        <button on:click={() => $cheese += 100000}>+100K</button>
      </div>

      <span>add moldy cheese</span>
      <input type=number bind:value={$moldyCheese}>
      <div style="display:flex;">
        <button on:click={() => $moldyCheese += 1}>+1</button>
        <button on:click={() => $moldyCheese += 10}>+10</button>
        <button on:click={() => $moldyCheese += 100}>+100</button>
        <button on:click={() => $moldyCheese += 1000}>+1K</button>
        <button on:click={() => $moldyCheese += 10000}>+10K</button>
        <button on:click={() => $moldyCheese += 100000}>+100K</button>
      </div>

    </div>
  </div>
{/if}

<style>
  #devTools {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1;
    background-color: rgb(0,0,0,.8);
  }
  #devTools > #devControls {
    margin: 24px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>