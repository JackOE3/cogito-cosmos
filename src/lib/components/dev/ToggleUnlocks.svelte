<script lang="ts">
  import { unlocked } from '$lib/store'

  function toggleUnlock(name: string): void {
    $unlocked[name] = !$unlocked[name]
  }
</script>

<div>
  {#each Object.entries($unlocked) as [name, isUnlocked], id}
    <button on:click={() => toggleUnlock(name)}>
      {id}
      {name}
      {isUnlocked ? '✅' : '❌'}
    </button>
  {/each}
</div>

<style>
  div {
    display: grid;
    position: absolute;
    z-index: 1;
  }
  button {
    border: 1px solid rgba(0, 0, 0, 1);
  }
</style>
