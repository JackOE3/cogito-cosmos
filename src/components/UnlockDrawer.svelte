<script lang="ts">
  import { unlocked, type IUnlock } from '@store'
  import UnlockIcon from './UnlockIcon.svelte'

  export let unlocks: IUnlock[]
  export let folderName = ''
</script>

<div style="position:relative; width: max-content; height: max-content">
  <div class="unlockDrawer grid theme-border">
    {#each unlocks as unlock, tempCount}
      {#if !$unlocked[unlock.name] && $unlocked[unlock.availableAt ?? 'start']}
        <UnlockIcon {unlock} {tempCount} {folderName} />
      {/if}
    {/each}
  </div>
</div>

<style>
  * {
    --slots: 4;
    --pad: 2px;
  }

  .grid {
    padding: var(--pad);
    height: 60px;
    width: calc(var(--slots) * 60px + (var(--slots) - 1) * 2px);
    display: grid;
    grid-template-columns: repeat(var(--slots), 60px);
    grid-template-rows: 100px; /* -> so overflow is hidden far beneath */
    gap: 2px;
    overflow: hidden;
    justify-items: center;
  }
  .unlockDrawer {
    position: relative;
    background-color: var(--Gray800);

    /* outline: 1px solid rgba(0, 0, 0, 0.6);
    border-left: var(--themeColor2);
    border-right: var(--themeColor1);
    border-top: var(--themeColor2);
    border-bottom: var(--themeColor1);
    border-width: 2px;
    border-style: solid; */
  }
</style>
