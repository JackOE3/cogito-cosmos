<script lang="ts">
  import { unlocked, type IUnlock } from '$lib/store'
  import UnlockIcon from './UnlockIcon.svelte'

  export let unlocks: IUnlock[]
  export let folderName = ''
</script>

<div style="position:relative; width: max-content; height: max-content">
  <div class="unlock-drawer theme-border">
    {#each unlocks as unlock, tempCount}
      {#if !$unlocked[unlock.name] && $unlocked[unlock.availableAt ?? 'start']}
        <UnlockIcon {unlock} {tempCount} {folderName} />
      {/if}
    {/each}
  </div>
</div>

<style>
  * {
    --slots: var(--num-slots, 3);
    --pad: 2px;
    --dim: 62.7px;
  }

  .unlock-drawer {
    position: relative;
    background-color: var(--Gray800);
    padding: var(--pad);
    height: var(--dim);
    width: calc(var(--slots) * var(--dim) + (var(--slots) - 1) * 2px);
    display: grid;
    grid-template-columns: repeat(var(--slots), var(--dim));
    grid-template-rows: 100px; /* -> so overflow is hidden far beneath */
    gap: 2px;
    overflow: hidden;
    justify-items: center;
  }
  /* .unlock-drawer:hover {
    --hover-slots: 5;
    width: calc(var(--hover-slots) * var(--dim) + (var(--hover-slots) - 1) * 2px);
    grid-template-columns: repeat(var(--hover-slots), var(--dim));
  } */
</style>
