<script lang="ts">
    import Window from './window-model/Window.svelte'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import { formatNumber, formatTime } from '$lib/gamelogic/utils'
    import UpgradeButton from '../UpgradeButton.svelte'
    import {
        unlocks,
        LORCA_OVERRIDE,
        resource,
        unlocked,
        upgrades,
        currentThoughtBoost,
        currentThoughtBoostTime,
        thoughtBoostMax,
        thoughtBoostDuration,
        thoughtBoostMaxStacks,
        thoughtsPerSec,
        thoughtsPerSecBase,
        UnlockName,
        WindowId,
        mood
    } from '$lib/store'

    export let windowId: WindowId

    import { onDestroy, onMount } from 'svelte'
    import { derived, get } from 'svelte/store'
    import EffectComponent from '../EffectComponent.svelte'
    import Effect from '../Effect.svelte'
    import Image from '../Image.svelte'
    import { insightPerSec, knowledgePerSec } from '$lib/store/derived/thoughts'

    let buyMaxUpgrades = false
    let thoughtBoostCurrentStacks = 0
    const thoughtBoostDecay = 2000
    let lastTime: number | null = null
    let myReq: number

    $: thoughtAccelDisplay =
        $upgrades.thoughtAcceleration.bought > 0 ? ($thoughtsPerSec / $upgrades.thoughtAcceleration.bought) * (1 - 1 / $thoughtsPerSecBase) : 1
    $: thoughtJerkDisplay = $thoughtsPerSec / $thoughtsPerSecBase

    function handleThink(): void {
        if (!$unlocked.thoughtBoost) {
            $resource.thoughts += 1
            return
        }
        // set multiplier, which expires after a time and starts decaying
        $currentThoughtBoost = $thoughtBoostMax

        if ($unlocked.thoughtBoostStack) {
            if (thoughtBoostCurrentStacks < $thoughtBoostMaxStacks) {
                $currentThoughtBoostTime += $thoughtBoostDuration
                thoughtBoostCurrentStacks++
            } else $currentThoughtBoostTime = $thoughtBoostDuration * $thoughtBoostMaxStacks
        } else $currentThoughtBoostTime = $thoughtBoostDuration

        cancelAnimationFrame(myReq)
        myReq = requestAnimationFrame(animateThoughtBoost)
    }

    function handlePonder(): void {
        $resource.knowledge += 1
    }

    function animateThoughtBoost(currentTime: number): void {
        if (lastTime === null) lastTime = currentTime
        const deltaT = Math.max(Math.min(currentTime - lastTime, 1000), 0)
        lastTime = currentTime

        if ($currentThoughtBoostTime > 0) {
            $currentThoughtBoostTime -= deltaT
            thoughtBoostCurrentStacks = Math.ceil($currentThoughtBoostTime / $thoughtBoostDuration)

            if ($currentThoughtBoostTime < 0) $currentThoughtBoostTime = 0
        } else {
            thoughtBoostCurrentStacks = 0
            // decrement evenly over {thoughtBoostDecay} milliseconds
            $currentThoughtBoost -= (($thoughtBoostMax - 1) / thoughtBoostDecay) * deltaT
            if ($currentThoughtBoost <= 1) {
                $currentThoughtBoost = 1
            }
        }
        if ($currentThoughtBoost > 1) myReq = requestAnimationFrame(animateThoughtBoost)
    }

    const thoughtBoostStrengthBought = derived(upgrades, $upgrades => $upgrades.thoughtBoostStrength.bought)
    // handle currentThoughtBoost being updated automatically when its strength is changed
    $: if ($thoughtBoostStrengthBought && get(currentThoughtBoostTime) > 0) currentThoughtBoost.set(get(thoughtBoostMax))

    onMount(() => {
        myReq = requestAnimationFrame(animateThoughtBoost)
    })
    onDestroy(() => {
        if (cancelAnimationFrame) cancelAnimationFrame(myReq)
    })
</script>

<Window title="Cogito Ergo Sum" themeId="thoughts" {windowId}>
    <div slot="minimized" class="flexRowContainer">
        <div style="width: 250px">
            <span class="resourceDisplay">
                You <span style="color:var(--themeColor2); font-weight:bold">thought</span>
                {formatNumber($resource.thoughts, 2)} times<br />
            </span>
            <span>
                {#if $unlocked.thinkPassively || LORCA_OVERRIDE}
                    <span class:green={$currentThoughtBoost > 1}>{formatNumber($thoughtsPerSec, 2)}/s</span>
                    {#if $currentThoughtBoost > 1}
                        - {formatNumber($currentThoughtBoost, 2)}x
                        {#if $currentThoughtBoostTime >= 100}
                            for {formatTime($currentThoughtBoostTime / 1000, 1)}
                            {#if $unlocked.thoughtBoostStack}
                                - {thoughtBoostCurrentStacks}/{$thoughtBoostMaxStacks} Stack{$thoughtBoostMaxStacks > 1 ? 's' : ''}
                            {/if}
                        {/if}
                    {/if}
                {/if}
            </span>
        </div>
        <UnlockDrawer --num-slots="1" unlocks={unlocks.thoughts} folderName="Swordsman_Skill_Icons_Pack" />
    </div>

    <div>
        <!-- <div style="position: absolute; right: 8px; top: 8px;">
            <input type="checkbox" name="buyMax" bind:checked={buyMaxUpgrades} />
            <label for="buyMax">Buy Max</label>
        </div> -->
        <span style="display: flex; justify-content: center; font-size: 1rem; margin-bottom: 8px;">You have</span>
        <div class="resources">
            <div class="resource">
                <span>{formatNumber($resource.thoughts, 2)}</span>
                <span style="color: var(--themeColor2); font-weight:bold">Thoughts</span>
            </div>
            <div class="resource">
                <span>{formatNumber($resource.knowledge, 2)}</span>
                <span style="color: lightblue; font-weight:bold">Knowledge</span>
            </div>
            <div class="resource">
                <span>{formatNumber($resource.insight, 2)}</span>
                <span style="color: magenta; font-weight:bold">Insight</span>
            </div>
        </div>
        <div style="display: flex; justify-content: center; font-size: .75rem;">
            <span>
                You are gaining
                {#if $mood === 'happy'}
                    {formatNumber($thoughtsPerSec, 2)} <span style="color: var(--themeColor2); font-weight:bold"> thoughts</span>
                {:else if $mood === 'neutral'}
                    {formatNumber($knowledgePerSec, 2)} <span style="color: lightblue; font-weight:bold">knowledge</span>
                {:else if $mood === 'sad'}
                    {formatNumber($insightPerSec, 2)} <span style="color: magenta; font-weight:bold">insight</span>
                {/if}
                per second.
            </span>
        </div>
        <!-- <span class="resourceDisplay">
            You <span style="color:var(--themeColor2); font-weight:bold">thought</span>
            {formatNumber($resource.thoughts, 2)} times<br />
        </span>
        <span>
            {#if $unlocked.thinkPassively || LORCA_OVERRIDE}
                <span class:green={$currentThoughtBoost > 1}>{formatNumber($thoughtsPerSec, 2)}/s</span>
                {#if $currentThoughtBoost > 1}
                    - {formatNumber($currentThoughtBoost, 2)}x
                    {#if $currentThoughtBoostTime >= 100}
                        for {formatTime($currentThoughtBoostTime / 1000, 1)}
                        {#if $unlocked.thoughtBoostStack}
                            - {thoughtBoostCurrentStacks}/{$thoughtBoostMaxStacks} Stack{$thoughtBoostMaxStacks > 1 ? 's' : ''}
                        {/if}
                    {/if}
                {/if}
            {/if}
        </span> -->
    </div>

    <div style="display:flex; flex-direction:column; align-items: center;">
        <div class="flexRowContainer">
            <div style="display:flex; flex-direction:row; align-items: center;">
                <div style="font-size: 3rem;">
                    {#if $mood === 'happy'}
                        🙂
                    {:else if $mood === 'neutral'}
                        😐
                    {:else if $mood === 'sad'}
                        🙁
                    {/if}
                </div>
                <button on:click={() => ($mood = 'happy')}>Happy</button>
                <button on:click={() => ($mood = 'neutral')}>Neutral</button>
                <button on:click={() => ($mood = 'sad')}>Sad</button>
            </div>

            <div style="display:flex; flex-direction:column; align-items: start; gap: 8px;">
                <div>You are {$mood}.</div>
                {#if $mood === 'happy'}
                    <button on:click={handleThink}>Happy Thoughts</button>
                {:else if $mood === 'neutral'}
                    <button on:click={handlePonder}>Ponder</button>
                {:else}
                    <button>Cry</button>
                {/if}
            </div>
        </div>
    </div>

    <div class="flexRowContainer">
        {#if $unlocked.thoughtBoost}
            <button on:click={handleThink}>
                Thought Boost <span class="iconify" data-icon="icon-park-outline:brain"></span><br />
                x{formatNumber($thoughtBoostMax, 2)} thoughts/s for {formatTime($thoughtBoostDuration / 1000)}
            </button>
        {:else}
            <button on:click={handleThink}>
                Think <br />
                (+1 thought)
            </button>
        {/if}
    </div>

    <div style="display: flex; flex-direction: row; justify-content: center; gap: 16px;">
        <UnlockDrawer unlocks={unlocks.thoughts} folderName="Swordsman_Skill_Icons_Pack" themeId="thoughts" />
        <UnlockDrawer unlocks={unlocks.knowledge} folderName="Swordsman_Skill_Icons_Pack" themeId="knowledge" />
        <UnlockDrawer unlocks={unlocks.insight} folderName="Swordsman_Skill_Icons_Pack" themeId="insight" />
    </div>

    <div class="flexRowContainer">
        <div class="gridColumn">
            <UpgradeButton
                upgradeName="thoughtAcceleration"
                {buyMaxUpgrades}
                btnUnlocked={$unlocked.thinkFaster}
                tooltipText={`+${formatNumber(thoughtAccelDisplay, 2)} thought${thoughtAccelDisplay > 1 ? 's' : ''}/s`}>
                Thought Acceleration
            </UpgradeButton>

            <UpgradeButton
                upgradeName="thoughtJerk"
                {buyMaxUpgrades}
                btnUnlocked={$unlocked.thoughtJerk}
                tooltipText={`+${formatNumber(thoughtJerkDisplay, 2)} to Effect of Thought Acceleration `}>
                Thought Jerk
            </UpgradeButton>

            <UpgradeButton upgradeName="thoughtBoostStrength" {buyMaxUpgrades} btnUnlocked={$unlocked.thoughtBoost} tooltipText="Scales ^1.5 with #upgrades">
                Increase the strength of Thought Boosts
            </UpgradeButton>

            <UpgradeButton upgradeName="thoughtBoostDuration" {buyMaxUpgrades} btnUnlocked={$unlocked.thoughtBoost} tooltipText="Duration +5s">
                Increase the duration of Thought Boosts
            </UpgradeButton>

            <UpgradeButton
                upgradeName="thoughtBoostStack"
                {buyMaxUpgrades}
                btnUnlocked={$unlocked.thoughtBoostStack}
                tooltipText="Max stacks +1 <br> Each stack increases the time by <br>  the duration shown on the button.">
                Increase the maximum stack size of Thought Boosts <br />
            </UpgradeButton>
        </div>

        <!-- <div class="gridColumn" style="height:332px;">
            <EffectComponent title={$upgrades.cheeseThoughtMult.bought > 0 || $unlocked.cheeseQueueLengthBoost ? 'Effects' : '???'}>
                <Effect factor={$currentThoughtBoost} unlocked={$unlocked.cheeseBoost} tooltipText="Effect is 1:1">
                    {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_BOOST)?.description}
                </Effect>
            </EffectComponent>
        </div> -->
    </div>
</Window>

<style>
    .resources {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 48px;
        margin-bottom: 8px;
    }
    .resource {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        font-size: 1rem;
    }
    .green {
        color: rgb(0, 216, 0);
        font-weight: bold;
    }
</style>
