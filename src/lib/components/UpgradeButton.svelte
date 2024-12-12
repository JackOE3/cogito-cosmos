<script lang="ts">
    import { formatResourceName, formatNumber } from '$lib/gamelogic/utils'
    import { buyUpgrade } from '$lib/gamelogic/buy-upgrade'
    import { upgrades, upgradeCount, resource, LORCA_OVERRIDE, currentNotation, Resource, type UpgradeName, upgradeCost } from '$lib/store'
    import { tooltip } from './tooltips/tooltip.svelte'
    import { derived } from 'svelte/store'
    import { fade } from 'svelte/transition'
    /* import { buyUpgradeMilk } from '@gamelogic/buy-upgrade-milk' */

    export let upgradeName: UpgradeName
    export let tooltipText: string | null = null
    export let buyMaxUpgrades = false // setContext/getContext better?
    export let btnUnlocked = true

    const resourceName = upgrades[upgradeName].resource
    let cost = derived(upgradeCost, $upgradeCost => $upgradeCost[upgradeName])
    const canAfford = derived(resource, $resource => $resource[resourceName as Resource] >= $cost)
    const maxBuy = upgrades[upgradeName].maxBuy
    const isMaxed = derived(upgradeCount, $upgradeCount => {
        return maxBuy !== null && $upgradeCount[upgradeName] >= maxBuy
    })
    const upgradesBought = derived(upgradeCount, $upgradeCount => $upgradeCount[upgradeName])

    // beforeUpdate(() => console.log('beforeUpdate'))

    function handleUpgradeClicked(): void {
        buyUpgrade(upgrades, upgradeCount, upgradeCost)(upgradeName, buyMaxUpgrades)
    }
</script>

{#if btnUnlocked || $LORCA_OVERRIDE}
    <button
        on:click={handleUpgradeClicked}
        on:click
        class:disabled={!$canAfford && !$isMaxed}
        use:tooltip={{ data: tooltipText }}
        class:maxed={$isMaxed}
        transition:fade|local={{ duration: 1000 }}>
        <div style="display:grid; grid-template-rows: auto 14px; height: 100%">
            <div id="text">
                <slot />
            </div>
            <div id="cost">
                {#if !$isMaxed}
                    {formatNumber($cost, 2, $currentNotation)}
                    {formatResourceName(resourceName)}
                {/if}
            </div>
        </div>

        <div id="boughtContainer">
            {#if maxBuy !== null}
                {#if $isMaxed}
                    MAX
                {:else}
                    {$upgradesBought}/{maxBuy}
                {/if}
            {:else}
                {$upgradesBought}
            {/if}
        </div>
    </button>
{:else}
    <button disabled>???</button>
{/if}

<!-- <UpgradeButton
    upgradeName="thoughtAcceleration"
    {buyMaxUpgrades}
    btnUnlocked={$unlocked.thinkFaster}
    tooltipText={`+${formatNumber(thoughtAccelDisplay, 2)} thought${thoughtAccelDisplay > 1 ? 's' : ''}/s`}>
    Thought Acceleration
</UpgradeButton>
 -->
<style>
    #text {
        height: 100%;
        padding-left: 4px;
        padding-right: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    #cost {
        z-index: 0;
        height: max-content;
        display: flex;
        flex-direction: row;
        justify-content: center;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(0, 0, 0, 0.2);

        /* background-color: rgba(8, 248, 0, 0.4);
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, transparent 40%); */
    }
    #boughtContainer {
        position: absolute;
        right: -2px;
        bottom: -2px;
        height: max-content;
        min-width: 24px;
        width: max-content;
        padding: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 0%;
        background-color: var(--themeColor1);
        outline: 1px solid rgba(0, 0, 0, 0.6);
        border-top: 2px solid rgba(255, 255, 255, 0.6);
        border-left: 2px solid rgba(255, 255, 255, 0.6);
        border-bottom: 2px solid rgba(0, 0, 0, 0.6);
        border-right: 2px solid rgba(0, 0, 0, 0.6);
        border-top-left-radius: 8px;
    }
    button {
        min-height: 50px;
        height: 60px;
        width: 200px;
        position: relative;
        padding: 0px;
    }

    button.disabled {
        opacity: var(--disabled); /* override */
    }
    button:not(.disabled):hover {
        /*  outline: 1px solid white; */
        background-color: var(--Gray600);
    }

    .maxed {
        background: linear-gradient(to bottom, var(--themeColor1), rgba(0, 0, 0, 0.6));
        color: var(--themeColor2, white);
        pointer-events: none;

        border-left: var(--themeColor2);
        border-right: var(--themeColor1);
        border-top: var(--themeColor2);
        border-bottom: var(--themeColor1);
        border-width: 2px;
        border-style: solid;
    }
</style>
