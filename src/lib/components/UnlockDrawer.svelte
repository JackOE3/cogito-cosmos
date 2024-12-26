<script lang="ts">
    import { unlocked, type IUnlock } from '$lib/store'
    import UnlockIcon from './UnlockIcon.svelte'

    type Props = {
        unlocks: IUnlock[]
        folderName: string
        themeId: string
    }
    let { unlocks, folderName = '', themeId = '' }: Props = $props()
</script>

<div style="position:relative; width: max-content; height: max-content; display: flex; justify-content: center" data-theme-colors={themeId}>
    <div class="unlock-drawer">
        {#each unlocks as unlock, tempCount}
            <!-- {#if unlocked.value[unlock.availableAt ?? 'start']} -->
            <UnlockIcon {unlock} {tempCount} {folderName} />
            <!-- {/if} -->
        {/each}
    </div>
</div>

<style>
    * {
        --slots: var(--num-slots, 4);
        --pad: 0px;
        --dim: 62.7px;
    }

    .unlock-drawer {
        position: relative;
        /* background-color: var(--Gray800); */
        padding: var(--pad);
        height: max-content;
        width: max-content;
        display: grid;
        grid-template-columns: repeat(var(--slots), var(--dim));
        /* grid-template-rows: repeat(var(--slots), var(--dim)); */ /* -> so overflow is hidden far beneath */
        gap: 0.5rem;
        /* overflow: hidden; */
        justify-items: center;
        /* outline: 1px solid rgba(0, 0, 0, 0.6); */
    }
    /* .unlock-drawer:hover {
    --hover-slots: 5;
    width: calc(var(--hover-slots) * var(--dim) + (var(--hover-slots) - 1) * 2px);
    grid-template-columns: repeat(var(--hover-slots), var(--dim));
  } */
</style>
