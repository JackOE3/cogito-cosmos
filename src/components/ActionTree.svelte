<script lang="ts">
  import { currentActions, lockedActionsStore } from '../stores/mainStore'
  import {actionTree} from '../stores/Actions'

</script>


<div id="actions">
  <h1>Actions</h1>
  {#each actionTree.get($currentActions) as action}
    {#if $lockedActionsStore[$currentActions][action.id] == false}
    <div class="action" on:click={() => action.execute()}>
      <span>{action.label}</span>
    </div>
    {/if}
  {/each}

</div>

<style>
  h1 {
    font-size: 20px;
    text-align: center;
  }
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
  .action:hover {
    background-color: var(--Gray800);
  }
  .action:active{
    color: var(--primary)
  }
  
</style>