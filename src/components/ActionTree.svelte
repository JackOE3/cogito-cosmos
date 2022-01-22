<script lang="ts">
  import { currentActionSet, actionFlagStore } from '../stores/Actions'
  import { actionTree } from '../stores/Actions'
  import { get } from 'svelte/store';
  import { saveData  } from '../gamelogic/saveload'

  // keep track of which action is on cooldown, to assign a class conditionally
  let isOnCooldown: boolean[] = []

</script>


<div id="actions">
  <label class="switch">
    <span>hide disabled options</span>
    <input type="checkbox" bind:checked={saveData.hideDisabledActions}>
  </label>

  {#each actionTree.get($currentActionSet) as action (action.id)}
    {#if !$actionFlagStore[get(currentActionSet)].locked[action.id]
      && !($actionFlagStore[get(currentActionSet)].disabled[action.id] && saveData.hideDisabledActions)}
    <div class="action" 
      on:click={() => {
        // if no cooldown, instantly execute the action and exit the onClick function
        if (!action.cooldown) {
          action.execute()
          return
        }
        // else:
        isOnCooldown[action.id] = true
        setTimeout(() => {
          action.execute()
          isOnCooldown[action.id] = false
        }, action.cooldown)
      }} 
      class:disabled={$actionFlagStore[$currentActionSet].disabled[action.id] || isOnCooldown[action.id]}>
      <span>{action.label}</span>
    </div>
    {/if}
  {/each}

</div>

<style>
  #actions {
    display: flex;
    flex-direction: column;
    width: 300px;
    margin: 0 20px;
    /*border: 2px solid black;*/
  }
  .action {
    background-color: var(--Gray900);
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 5px var(--primary);
    border-style: none none none solid;
    margin: 2px 0;
  }
  .disabled{
    opacity: var(--disabled);
    pointer-events: none;
  }
  .action:hover {
    background-color: var(--Gray800);
    font-weight: bold;
  }
  .action:active{
    color: var(--primary);
  }

</style>