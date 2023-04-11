<script lang="ts">
  const logTypes = ['Log', 'Prestige', 'Achievements']
  let active = logTypes[0]
</script>

<div id="log">
  <div class="tabs">
    <ul>
      {#each logTypes as logType}
        <li
          on:click={() => {
            active = logType
          }}
        >
          <div class:active={logType === active}>{logType}</div>
        </li>
      {/each}
    </ul>
  </div>

  <div id="logText">
    {#if active === 'Log'}
      Empty
    {:else if active === 'Prestige'}
      Prestige stuff
    {:else if active === 'Achievements'}
      Achievement stuff
    {/if}
  </div>
</div>

<style>
  #log {
    width: 400px;
    margin-right: 20px;
    margin-left: 20px;
  }
  #logText {
    display: flex;
    flex-direction: column;
    width: inherit;
    margin: 0 0px;
    /*border: 2px solid black;*/
  }

  .tabs {
    margin-bottom: 10px;
  }
  ul {
    display: flex;
    justify-content: left;
    padding: 0;
    margin: 0;
    list-style-type: none;
  }
  li {
    margin-right: 1rem;
    font-size: 1rem;
    cursor: pointer;
  }
  .active {
    color: var(--secondary);
    border-bottom: 1px solid var(--secondary);
    padding-bottom: 2px;
  }
</style>
