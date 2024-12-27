<script lang="ts">
    import { debounce } from 'ts-debounce'
    import { formatNumber, formatTime } from '$lib/gamelogic/utils'
    import { unlocks, derivedState, upgradeCount, unlocked, resource, upgrades, addResource, currentThoughtBoost, currentThoughtBoostTime } from '$lib/store'
    import { onDestroy, onMount } from 'svelte'
    import { tooltip } from '../tooltips/tooltip.svelte'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import UpgradeButton from '../UpgradeButton.svelte'
    import Window from './window-model/Window.svelte'
    import AutoButton from '../AutoButton.svelte'

    const thoughtBoostDecay = 2000
    let lastTime: number | null = null
    let myReq: number

    function handleThink(): void {
        if (!unlocked.value.thoughtBoost) {
            addResource('thoughts', 1)
            return
        }
        // set multiplier, which expires after a time and starts decaying
        currentThoughtBoost.value = derivedState.thoughtBoostMultiplier
        currentThoughtBoostTime.value = derivedState.thoughtBoostDuration

        cancelAnimationFrame(myReq)
        myReq = requestAnimationFrame(animateThoughtBoost)
    }

    function animateThoughtBoost(currentTime: number): void {
        if (lastTime === null) lastTime = currentTime
        const deltaT = Math.max(Math.min(currentTime - lastTime, 1000), 0)
        lastTime = currentTime

        if (currentThoughtBoostTime.value > 0) {
            currentThoughtBoostTime.value -= deltaT
            if (currentThoughtBoostTime.value < 0) currentThoughtBoostTime.value = 0
        } else {
            // decrement evenly over {thoughtBoostDecay} milliseconds
            currentThoughtBoost.value -= ((derivedState.thoughtBoostMultiplier - 1) / thoughtBoostDecay) * deltaT
            if (currentThoughtBoost.value <= 1) {
                currentThoughtBoost.value = 1
            }
        }
        if (currentThoughtBoost.value > 1) myReq = requestAnimationFrame(animateThoughtBoost)
    }

    // handle currentThoughtBoost being updated automatically when its strength is changed
    const thoughtBoostActive = $derived(currentThoughtBoostTime.value > 0)
    $effect(() => {
        if (thoughtBoostActive) currentThoughtBoost.value = derivedState.thoughtBoostMultiplier
    })

    onMount(() => {
        myReq = requestAnimationFrame(animateThoughtBoost)
    })
    onDestroy(() => {
        if (cancelAnimationFrame) cancelAnimationFrame(myReq)
    })

    const thinkBtnTooltip = $derived.by(() => {
        if (unlocked.value.thoughtBoost) {
            return `Boost your thinking by ${formatNumber(derivedState.thoughtBoostMultiplier, 2)}x for ${formatTime(derivedState.thoughtBoostDuration / 1000)}`
        } else return '+1 thought'
    })
</script>

<Window title="Cogito" themeId="thoughts">
    <div style="display:flex; flex-direction:column; gap: 4px;">
        <div class="resourceDisplay">
            {formatNumber(resource.value.thoughts, 2)}
            <span style="color: var(--themeColor2); font-weight:bold">Thoughts</span>
        </div>
        <div>
            <span class:green={currentThoughtBoost.value > 1}>
                {formatNumber(derivedState.thoughtsPerSec, 2)}/s
            </span>
            {#if currentThoughtBoost.value > 1}
                <span>
                    -
                    {formatNumber(currentThoughtBoost.value, 2)}x
                    {#if currentThoughtBoostTime.value >= 100}
                        for {formatTime(currentThoughtBoostTime.value / 1000, 1)}
                    {/if}
                </span>
            {/if}
        </div>
    </div>
    <AutoButton onclick={handleThink} tooltipOptions={{ data: thinkBtnTooltip }}>
        {#if unlocked.value.thoughtBoost}
            Thought Boost
        {:else}
            Happy Thoughts
        {/if}
    </AutoButton>
    <UnlockDrawer unlocks={unlocks.thoughts} folderName="Swordsman_Skill_Icons_Pack" themeId="thoughts" />
    <div class="gridColumn">
        <UpgradeButton
            upgradeName="thoughtAcceleration"
            btnUnlocked={unlocked.value.thinkFaster}
            tooltipText={`You think faster. <br>Change: +${(1 + upgradeCount.value.thoughtJerk) * (1 + upgradeCount.value.thoughtSnap)} thoughts/s <br>`}
        ></UpgradeButton>

        <UpgradeButton upgradeName="thoughtBoostMultiplier" btnUnlocked={unlocked.value.thoughtBoost} tooltipText="Increase the multiplier of Thought Boost"
        ></UpgradeButton>

        <UpgradeButton upgradeName="thoughtBoostDuration" btnUnlocked={unlocked.value.thoughtBoost} tooltipText="Increase the duration of Thought Boost"
        ></UpgradeButton>
    </div>
</Window>

<style>
    .green {
        color: rgb(0, 216, 0);
        font-weight: bold;
    }
</style>
