<script lang="ts">
    import { formatWhole } from '../gamelogic/utils'
    import { unlocked, resource, type IUnlock, Resource } from '$lib/store'
    import { Direction, tooltip } from './tooltips/tooltip.svelte'
    import UnlockTooltip from './tooltips/UnlockTooltip.svelte'
    import Image from './Image.svelte'

    interface Props {
        unlock: IUnlock
        tempCount: number
        folderName: string
    }

    let { unlock, tempCount, folderName }: Props = $props()

    const canAfford = $derived(resource.value[unlock.resource as Resource] >= unlock.cost)
    const isUnlocked = $derived(unlocked.value[unlock.name])

    function unlockFeature(): void {
        const cost: number = unlock.cost
        if (resource.value[unlock.resource as Resource] < cost || unlocked.value[unlock.name]) return
        resource.value[unlock.resource as Resource] -= cost
        unlocked.value[unlock.name] = true
    }
</script>

<div style="height: 100%; width: 100%;">
    <button
        onclick={unlockFeature}
        class:disabled={!canAfford && !isUnlocked}
        class:unlocked={isUnlocked}
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
        width: 100%;
        aspect-ratio: 1;
        background-color: var(--Gray800);
        border: 1px var(--themeColor2) solid;
        border-radius: 0px;
        outline: 2px solid rgba(0, 0, 0, 0.6);
        padding: 2px;
    }

    button:not(.disabled):not(.unlocked):hover {
        filter: contrast(150%);
        outline: 2px solid rgba(0, 0, 0, 1);
        border: 1px var(--themeColor2) solid;
        /* box-shadow: 0 0 5px 1px var(--themeColor1); */
    }
    button:not(.disabled):not(.unlocked):active {
        border: 2px var(--themeColor2) solid;
        outline: 1px solid rgba(0, 0, 0, 0.6);
    }
    button.unlocked {
        opacity: 1;
        filter: contrast(100%);
        border: 2px var(--themeColor2) solid;
        outline: 1px solid rgba(0, 0, 0, 0.6);
        /* box-shadow: 0 0 2px 1px var(--themeColor1); */
        outline: 1px solid rgba(0, 0, 0, 0.6);
        border-left: var(--themeColor2);
        border-right: var(--themeColor1);
        border-top: var(--themeColor2);
        border-bottom: var(--themeColor1);
        border-width: 2px;
        border-style: solid;
        box-shadow: 0 0 5px 1px var(--themeColor1);
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
</style>
