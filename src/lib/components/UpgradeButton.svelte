<script lang="ts">
    import { formatResourceName, formatNumber } from '$lib/gamelogic/utils'
    import { buyUpgrade } from '$lib/gamelogic/buy-upgrade'
    import { upgrades, upgradeCount, resource, LORCA_OVERRIDE, Resource, type UpgradeName, upgradeCost } from '$lib/store'
    import { tooltip } from './tooltips/tooltip.svelte'
    import { fade } from 'svelte/transition'

    type Props = {
        upgradeName: UpgradeName
        tooltipText?: string | null
        buyMaxUpgrades?: boolean // setContext/getContext better?
        btnUnlocked?: boolean
    }

    let { upgradeName, tooltipText = null, buyMaxUpgrades = false, btnUnlocked = true }: Props = $props()

    const resourceName = upgrades[upgradeName].resource
    let cost = $derived(upgradeCost.value[upgradeName])
    const canAfford = $derived(resource.value[resourceName as Resource] >= cost)
    const maxBuy = upgrades[upgradeName].maxBuy
    const isMaxed = $derived(maxBuy !== undefined && upgradeCount.value[upgradeName] >= maxBuy)
    const upgradesBought = $derived(upgradeCount.value[upgradeName])

    // beforeUpdate(() => console.log('beforeUpdate'))

    function handleUpgradeClicked(): void {
        buyUpgrade(upgrades, resource.value, upgradeCount.value, upgradeCost.value)(upgradeName, buyMaxUpgrades)
    }
</script>

<button onclick={handleUpgradeClicked} class:disabled={(!canAfford && !isMaxed) || (!btnUnlocked && !LORCA_OVERRIDE.value)} class:maxed={isMaxed}>
    {#if btnUnlocked || LORCA_OVERRIDE.value}
        <div in:fade={{ duration: 1000 }} use:tooltip={{ data: tooltipText }}>
            <div style="display:flex; flex-direction: column; justify-content: end; height: 100%">
                <span id="text">
                    {upgrades[upgradeName].title}
                </span>
                <div id="cost">
                    {#if !isMaxed}
                        {formatNumber(cost, 2)}
                        {formatResourceName(resourceName)}
                    {/if}
                </div>
            </div>

            <div id="upgradeCount" class="border">
                {#if maxBuy !== undefined}
                    {#if isMaxed}
                        MAX
                    {:else}
                        {upgradesBought}/{maxBuy}
                    {/if}
                {:else}
                    {upgradesBought}
                {/if}
            </div>
        </div>
    {:else}
        <div>???</div>
    {/if}
</button>

<style>
    button {
        min-height: 71px;
        /* height: 60px; */
        height: max-content;
        width: 200px;
        position: relative;
        padding: 0px;
    }

    #text {
        height: 2rem; /* ~ 2 lines of text */
        flex-grow: 1;
        padding: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    #cost {
        z-index: 0;
        height: 1rem;
        padding: 2px;
        /* box-sizing: border-box; */
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        border-top: 1px solid var(--dp08);
        background-color: var(--dp04);
    }
    #upgradeCount {
        position: absolute;
        right: 0px;
        bottom: 0px;
        height: 1.125rem;
        min-width: 1.5rem;
        width: max-content;
        padding: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--themeColor1);
        border-radius: 0px;
        border-top-left-radius: 8px;
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
