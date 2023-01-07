<script lang="ts">
  import {devToolsEnabled, thoughts, cheese, moldyCheese} from '../stores/mainStore'
</script>

{#if $devToolsEnabled}
  <div id="devTools">
    <div id="devControls">
      <h1>Developer Tools</h1>

      <span>add thoughts</span>
      <div style="display:flex;">
        <button on:click={() => $thoughts += 1}>+1</button>
        <button on:click={() => $thoughts += 10}>+10</button>
        <button on:click={() => $thoughts += 100}>+100</button>
        <button on:click={() => $thoughts += 1000}>+1K</button>
      </div>

      <span>add cheese</span>
      <div style="display:flex;">
        <button on:click={() => $cheese += 1}>+1</button>
        <button on:click={() => $cheese += 10}>+10</button>
        <button on:click={() => $cheese += 100}>+100</button>
        <button on:click={() => $cheese += 1000}>+1K</button>
      </div>

      <span>add moldy cheese</span>
      <div style="display:flex;">
        <button on:click={() => $moldyCheese += 1}>+1</button>
        <button on:click={() => $moldyCheese += 10}>+10</button>
        <button on:click={() => $moldyCheese += 100}>+100</button>
        <button on:click={() => $moldyCheese += 1000}>+1K</button>
      </div>

    </div>
  </div>
{/if}

<style>
  #devTools {
    position: absolute;
    right: 0;
    top: 30px;
    background-color: rgb(0,0,0,.8);
  }
  #devTools > #devControls {
    margin: 24px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>