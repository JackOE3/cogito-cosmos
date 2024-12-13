<script lang="ts">
    import { formatWhole, formatResourceName } from '$lib/gamelogic/utils'
    import { unlocked, resource, LORCA_OVERRIDE } from '$lib/store'
    import { tooltip } from './tooltips/tooltip.svelte'
    import type { IUnlock, Resource } from '$lib/store'

    interface Props {
        unlock: IUnlock
        btnUnlocked: boolean
        btnHidden: boolean
    }

    let { unlock, btnUnlocked = true, btnHidden = false }: Props = $props()

    function unlockFeature(): void {
        const cost: number = unlock.cost
        if (resource.value[unlock.resource as Resource] < cost) return
        resource.value[unlock.resource as Resource] -= cost
        unlocked.value[unlock.name] = true
    }
</script>

{#if !btnHidden}
    {#if btnUnlocked || LORCA_OVERRIDE.value}
        <button
            onclick={unlockFeature}
            class:disabled={unlocked.value[unlock.name] || resource.value[unlock.resource as Resource] < unlock.cost}
            use:tooltip={{ data: unlock.tooltipText }}
            class:unlocked={unlocked.value[unlock.name]}>
            Slot Content
            <br />
            <span>Costs {formatWhole(unlock.cost)} {formatResourceName(unlock.resource)}</span>
        </button>
    {:else}
        <button class="btn" disabled>???</button>
    {/if}
{/if}

<style>
    button {
        min-height: 50px;
        height: fit-content;
        background: var(--Gray800);
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    button:not(.disabled):hover {
        outline: 1px var(--unlockedColor, white) solid;
        background-color: black;
        color: var(--unlockedColor, white);
    }

    .unlocked {
        outline: 1px var(--unlockedColor, white) solid;
        background-color: black;
        color: var(--unlockedColor, white);
    }

    button::before {
        content: attr(data-unlockType);
        scale: 2;
        position: absolute;
        top: 2px;
        left: 5px;
    }
</style>
