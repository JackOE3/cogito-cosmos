<script lang="ts">
    import { formatWhole } from '../gamelogic/utils'
    import { unlocked, resource, type IUnlock } from '$lib/store'
    import { Direction, tooltip } from './tooltips/tooltip.svelte'
    import UnlockTooltip from './tooltips/UnlockTooltip.svelte'
    import { derived } from 'svelte/store'
    import Image from './Image.svelte'

    export let unlock: IUnlock
    export let tempCount: number
    export let folderName: string

    const canAfford = derived(resource, $resource => $resource[unlock.resource] >= unlock.cost)
    const isUnlocked = derived(unlocked, $unlocked => $unlocked[unlock.name])

    function unlockFeature(): void {
        const cost: number = unlock.cost
        if ($resource[unlock.resource] < cost || $unlocked[unlock.name]) return
        $resource[unlock.resource] -= cost
        unlocked.update($unlocked => {
            $unlocked[unlock.name] = true
            return $unlocked
        })
    }
</script>

<div style="height:max-content; width: max-content">
    <button
        on:click={unlockFeature}
        data-cost={formatWhole(unlock.cost)}
        data-unlockType={unlock.type}
        class:disabled={!$canAfford && !$isUnlocked}
        class:unlocked={$isUnlocked}
        use:tooltip={{ data: unlock, Component: UnlockTooltip, direction: Direction.RIGHT, anchor: 'offsetParent' }}>
        <Image name={`${folderName}/PNG/${tempCount + 1}`} alt="upgrade icon" />
    </button>
</div>

<style>
    button.disabled {
        filter: saturate(50%);
    }

    button {
        /* z-index: 1; */
        position: relative;
        width: 62.7px;
        height: 62.7px;
        background-color: var(--Gray800);
        border: 1px var(--Gray500) solid;
        border-radius: 0px;
        outline: 2px solid rgba(0, 0, 0, 0.6);
        padding: 2px;
    }

    button:not(.disabled):not(.unlocked):hover {
        filter: contrast(150%);
        outline: 2px solid rgba(0, 0, 0, 1);
        border: 1px var(--themeColor2) solid;
        box-shadow: 0 0 5px 1px var(--themeColor1);
    }
    button:not(.disabled):not(.unlocked):active {
        border: 2px var(--themeColor2) solid;
        outline: 1px solid rgba(0, 0, 0, 0.6);
    }
    button.unlocked {
        opacity: 1;
        filter: contrast(100%);
        border: 2px rgba(255, 255, 255, 0.6) solid;
        outline: 1px solid rgba(0, 0, 0, 0.6);
        /* box-shadow: 0 0 2px 1px var(--themeColor1); */
    }

    /*  button::before {
    content: attr(data-cost);
    position: absolute;
    height: 14px;
    bottom: -18px;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0);
    outline: 0px solid black;
    margin-right: 2px;
  } */
    /* button::after {
    content: attr(data-unlockType);
    color: rgb(255, 255, 61);
    text-shadow: 1px 1px 4px black;
    position: absolute;
    bottom: 2px;
    left: 4px;
  } */
    button > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
</style>
