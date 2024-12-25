<script lang="ts">
    import { unlocked, UnlockName } from '$lib/store'

    function toggleUnlock(name: UnlockName): void {
        unlocked.value[name] = !unlocked.value[name]
    }
</script>

<div id="unlockList">
    {#each Object.entries(unlocked.value) as [name, isUnlocked], id}
        <div class="unlockToggle" style="background: var(--background-color); width: max-content;">
            <button onclick={() => toggleUnlock(name as UnlockName)}>
                {id}
                {name}
                {isUnlocked ? '✅' : '❌'}
            </button>
        </div>
    {/each}
</div>

<style>
    #unlockList {
        display: grid;
        position: absolute;
        z-index: 1;
    }
    .unlockToggle {
    }
</style>
