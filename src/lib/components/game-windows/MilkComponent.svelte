<script lang="ts">
    import Window from './window-model/Window.svelte'
    import { formatNumber, formatResourceName, formatWhole } from '$lib/gamelogic/utils'
    import UpgradeButton from '../UpgradeButton.svelte'
    import { derived, get } from 'svelte/store'
    import {
        milkFromReset,
        bacteriaPerSec,
        highestMilk,
        upgrades,
        resource,
        WindowId,
        unlocked,
        bacteriaGrowthFactor,
        unlocks,
        milkUpgradeMultiplies,
        milkUpgradeEffects,
        upgradesInitial,
        UnlockName,
        currentNotation,
        milkResetMilestones,
        totalMilkResets
    } from '$lib/store'
    import { tooltip } from '../tooltips/tooltip.svelte'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import EffectComponent from '../EffectComponent.svelte'
    import Image from '../Image.svelte'

    export let windowId: WindowId

    enum ThemeId {
        THOUGHTS = 'thoughts',
        CHEESE = 'cheese',
        MODLY_CHEESE = 'moldyCheese',
        CHEESEYARD = 'cheeseyard'
    }

    let themeId = 'thoughts'
    let currentUpgradeName = 'milkThoughtsGain'

    function handleMilkReset(): void {
        const milkGain = Math.floor(get(milkFromReset))
        if (milkGain < 1) return
        $resource.milk += milkGain
        $totalMilkResets++
        console.log($totalMilkResets)
    }

    const milkUpgrades = [
        { name: 'milkThoughtsGain', title: 'Think Tank', themeId: ThemeId.THOUGHTS, resource: 'thoughts' },
        { name: 'milkCheeseGain', title: 'Dairy Dream', themeId: ThemeId.CHEESE, resource: 'cheese' },
        { name: 'milkMoldyCheeseGain', title: 'Moldy Madness', themeId: ThemeId.MODLY_CHEESE, resource: 'moldyCheese' },
        { name: 'milkCheeseBrainsGain', title: 'Brawny Brains', themeId: ThemeId.CHEESEYARD, resource: 'cheeseBrains' }
    ]

    function handleMilkUpgrade(upgradeName: string): void {
        if (!(upgradeName in $upgrades)) {
            console.error('property ' + upgradeName + ' is NOT in upgrades store')
            return
        }
        if (!(upgradeName in milkUpgradeEffects)) {
            console.error('property ' + upgradeName + ' is NOT in milkUpgradeEffects')
            return
        }
        for (const effect of milkUpgradeEffects[upgradeName]) {
            if (!Object.values(UnlockName).includes(effect.name)) {
                console.error('property ' + effect.name + ' is NOT an UnlockName')
                continue
            }
            if ($upgrades[upgradeName].bought < effect.upgradesNeeded) $unlocked[effect.name] = false
            else if (get(unlocked)[effect.name] === false) $unlocked[effect.name] = true
        }
    }

    function scrollToBottom(node: HTMLElement, _dependency: any): object {
        const scroll = (): void => {
            let currentIndex = milkResetMilestones.findIndex(m => m.resetsNeeded > $totalMilkResets)
            // show 3 alraedy unlocked items at the top:
            currentIndex -= 3
            if (currentIndex < 0) currentIndex = 0
            let offset = 0
            console.log('scroll', $totalMilkResets)
            if (node.children.length >= currentIndex) {
                offset = (node.children[currentIndex] as HTMLElement).offsetTop - node.offsetTop - 8
            }
            node.scroll({
                top: offset,
                behavior: 'smooth'
            })
        }
        scroll()

        return { update: scroll }
    }
</script>

<Window title="Milk" themeId="milk" {windowId}>
    <div style="display:grid; grid-template-columns: 226px auto; gap: 8px">
        <div>
            <span class="resourceDisplay"
                >You have {formatNumber($resource.milk, 2, $currentNotation)} <strong style="color:white">milk</strong>
                <br />
            </span>
            <span>Highest milk ever: {formatWhole($highestMilk, $currentNotation)}</span>
        </div>
        <span style="align-self:last baseline; margin-bottom:-12px">
            <span
                style="font-weight:bold; font-size: 1rem;"
                use:tooltip={{
                    data: 'These milestones will give quality of life upgrades. <br>You auto-complete them when you have milk reset enough times.'
                }}
                class="bg-on-hover">
                Milkestones
            </span>
            (Total milk resets: {formatWhole($totalMilkResets, $currentNotation)})
        </span>
    </div>

    <div class="flexRowContainer" style="justify-content: space-between; height: 138.7px">
        <div class="gridColumn">
            <button
                style="width: 200px; height: 60px; "
                use:tooltip={{
                    data: 'You keep all your content unlocks. <br/> The reward amount depends on your <br/>current thoughts and cheese.<br/> Scaling: ~thoughts^0.25 * cheese^0.5.'
                }}
                on:click={handleMilkReset}>
                <span style="font-weight:bold">Milk Prestige</span>
                <br />
                Reset all previous progress<br />
                Reward: {formatNumber($milkFromReset, 3, $currentNotation)} milk
            </button>

            <UnlockDrawer unlocks={unlocks.milk} folderName="50 Free Mushroom Icons" />
        </div>
        <div
            class="upgrade-milestones theme-border"
            style="height: 100%"
            data-theme-colors="milk"
            use:scrollToBottom={$totalMilkResets}>
            {#each milkResetMilestones as milestone}
                <div class="milk-milestone flexRowContainer" style="gap:0.5rem">
                    <div class="milestone-number" class:unlocked={milestone.resetsNeeded <= $totalMilkResets}>
                        {milestone.resetsNeeded}
                    </div>
                    <div
                        style="width:100%; {milestone.resetsNeeded > $totalMilkResets
                            ? 'opacity: var(--medium-emphasis)'
                            : ''}"
                        class:bg-on-hover={milestone.tooltipText !== null}
                        use:tooltip={{ data: milestone.tooltipText }}>
                        {milestone.description}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="flexRowContainer" style="gap:8px; height: 264px;">
        <div class="gridColumn">
            {#each milkUpgrades as upgrade}
                <div class="upgrade-button-container">
                    <UpgradeButton
                        upgradeName={upgrade.name}
                        on:click={() => handleMilkUpgrade(upgrade.name)}
                        tooltipText={`Multiplier scales ^2 with #upgrades`}>
                        <span style="font-weight:bold; ">{upgrade.title}</span>
                        <span>
                            [{formatNumber($milkUpgradeMultiplies[upgrade.resource], 2, $currentNotation)}x
                            {formatResourceName(upgrade.resource)}]
                        </span>
                        <!--  Currently: {formatNumber(1, 2)}x -->
                    </UpgradeButton>
                    <button
                        on:click={() => {
                            themeId = upgrade.themeId
                            currentUpgradeName = upgrade.name
                        }}
                        style="height: 100%; width: 1.5rem; display: flex;align-items: center; justify-content: center;"
                        data-theme-colors={themeId}
                        class:theme-border={themeId === upgrade.themeId}>
                        <div style="transform: rotate(-90deg); filter: invert(100%);">
                            <Image name="chevron-arrow-down" alt="extra info for {upgrade.title}" />
                        </div>
                    </button>
                </div>
            {/each}
        </div>

        <div style="height: 100%" data-theme-colors={themeId}>
            <EffectComponent --width="500px" title="Bonus Effects">
                {#if currentUpgradeName in milkUpgradeEffects}
                    {#each milkUpgradeEffects[currentUpgradeName] as effect}
                        <span
                            use:tooltip={{ data: effect.tooltipText }}
                            class:bg-on-hover={effect.tooltipText !== null}>
                            {effect.upgradesNeeded}: {effect.description}
                        </span>
                    {/each}
                {/if}
            </EffectComponent>
        </div>
    </div>
</Window>

<style>
    * {
        --unlockedColor: white --maxedColor: var(--unlockedColor);
    }
    .milestone-number {
        width: 20px;
        border-radius: 4px;
        background-color: var(--Gray600);
        display: flex;
        justify-content: center;
        opacity: var(--medium-emphasis);
    }
    .unlocked {
        background-color: var(--color);
        color: var(--Gray900);
        box-shadow: 0 0 4px 1px var(--themeColor1);
        outline: 1px solid var(--anti-color);
        opacity: 1;
    }

    .upgrade-milestones {
        width: 500px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        box-sizing: border-box;
        padding: 8px;
        background-color: var(--Gray800);
        overflow-y: scroll;
    }
    .upgrade-button-container {
        display: flex;

        gap: 2px;
    }
</style>
