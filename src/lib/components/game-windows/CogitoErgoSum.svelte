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
        currentThoughtBoost,
        currentThoughtBoostTime,
        //thoughtBoostMultiplier,
        //thoughtBoostDuration,
        //thoughtsPerSec,
        //thoughtsPerSecBase,
        derivedState,
        mood,
        upgradeCount,
        health,
        addResource
    } from '$lib/store'

    import { onDestroy, onMount } from 'svelte'
    import { tooltip } from '../tooltips/tooltip.svelte'
    import Benchmark from '../Benchmark.svelte'
    import ProgBar from '../misc/ProgBar.svelte'
    /* import EffectComponent from '../EffectComponent.svelte'
    import Effect from '../Effect.svelte'
    import Image from '../Image.svelte' */
    //import { insightPerSec, knowledgePerSec } from '$lib/store'

    let buyMaxUpgrades = false
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

    function handlePonder(): void {
        if (resource.value.thoughts < 100) return
        addResource('knowledge', 1)
        addResource('thoughts', -100)
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
    //$: if ($thoughtBoostBought && get(currentThoughtBoostTime) > 0) currentThoughtBoost.set(get(thoughtBoostMultiplier))
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
            return `${formatNumber(derivedState.thoughtBoostMultiplier, 2)}x thoughts/s for ${formatTime(derivedState.thoughtBoostDuration / 1000)}`
        } else return '+1 thought'
    })

    const isGeneratingKnowledge = $derived(upgradeCount.value.knowledgeGeneration >= 1)
</script>

<Window title="Cogito Ergo Sum" themeId="cogitoErgoSum" --width="500px">
    <!-- <div style="position: absolute; right: 8px; top: 8px;">
            <input type="checkbox" name="buyMax" bind:checked={buyMaxUpgrades} />
            <label for="buyMax">Buy Max</label>
        </div> -->
    <div
        style="display: flex; justify-content: start; flex-direction:column; background-color: var(--dp01); padding: 8px; border-radius: 0px; height: 4rem; border: 1px solid var(--dp08);">
        <span style="font-size: .875rem; display: flex; justify-content: start; flex-direction:column; ">
            <span>
                You are <span style="font-weight:bold">{mood.value}</span>.
            </span>
            {#if mood.value === 'happy'}
                <span>
                    You are
                    <span data-theme-colors="thoughts" style="color: var(--themeColor2); font-weight:bold">thinking</span>
                    of
                    <span class:green={currentThoughtBoost.value > 1}>
                        {formatNumber(derivedState.thoughtsPerSec, 2)}
                    </span>
                    things per second
                </span>
                {#if currentThoughtBoost.value > 1}
                    <span>
                        Boosted by
                        {formatNumber(currentThoughtBoost.value, 2)}x
                        {#if currentThoughtBoostTime.value >= 100}
                            for {formatTime(currentThoughtBoostTime.value / 1000, 1)}
                        {/if}
                    </span>
                {/if}
            {:else if mood.value === 'neutral'}
                {#if isGeneratingKnowledge}
                    <span>
                        You are acquiring {formatNumber(derivedState.knowledgePerSec, 2)}
                        <span data-theme-colors="knowledge" style="color: var(--themeColor2); font-weight:bold">knowledge</span> per second<br />
                    </span>
                {:else}
                    <span>
                        You want to acquire <span data-theme-colors="knowledge" style="color: var(--themeColor2); font-weight:bold">knowledge</span>.
                    </span>
                {/if}
            {:else if mood.value === 'sad'}
                <span>
                    You are gaining {formatNumber(derivedState.insightPerSec, 2)}
                    <span data-theme-colors="insight" style="color: var(--themeColor2); font-weight:bold">insight</span> per second.
                </span>
            {/if}
        </span>
    </div>

    <div style="display: flex; justify-content: start; gap: 8px;">
        <div style="display:flex; flex-direction:column; align-items: start; gap:0;">
            {#if unlocked.value.neutralMood}
                <button style="width: 100%" onclick={() => (mood.value = 'happy')}>Happy</button>
                <button style="width: 100%" onclick={() => (mood.value = 'neutral')}>Neutral</button>
            {/if}
            {#if unlocked.value.sadMood}
                <button style="width: 100%" onclick={() => (mood.value = 'sad')}>Sad</button>
            {/if}
        </div>

        <div style="display:flex; flex-direction:row; align-items: center;">
            <div style="font-size: 3rem;">
                {#if mood.value === 'happy'}
                    🙂
                {:else if mood.value === 'neutral'}
                    😐
                {:else if mood.value === 'sad'}
                    🙁
                {/if}
            </div>
        </div>

        <div style="display:flex; flex-direction:column; align-items: start; gap: 8px;">
            {#if mood.value === 'happy'}
                <button use:tooltip={{ data: thinkBtnTooltip }} onclick={handleThink}>
                    {#if unlocked.value.thoughtBoost}
                        Thought Boost
                    {:else}
                        Happy Thoughts
                    {/if}
                </button>
            {:else if mood.value === 'neutral'}
                <button use:tooltip={{ data: '+1 knowledge <br> -100 thoughts' }} onclick={handlePonder} class:disabled={resource.value.thoughts < 100}>
                    Ponder
                </button>
            {:else}
                <button>Cry</button>
            {/if}
        </div>
    </div>

    <p>
        Health: {derivedState.healthStage}
        <span>({derivedState.healthMultiplier}x production)</span>
    </p>

    <ProgBar
        --widthProgBar="300px"
        --heightProgBar="1rem"
        --barColor="linear-gradient(to right, #170000 0%, red 30%, yellow 50%, green 90%)"
        --progress="{Math.abs(health.value * 100)}%"></ProgBar>

    <div class="flexRowContainer" style="display: flex; justify-content: center">
        <!-- <div class="gridColumn" style="height:332px;">
            <EffectComponent title={$upgradeCount.cheeseThoughtMult > 0 || unlocked.value.cheeseQueueLengthBoost ? 'Effects' : '???'}>
                <Effect factor={$currentThoughtBoost} unlocked={unlocked.value.cheeseBoost} tooltipText="Effect is 1:1">
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
