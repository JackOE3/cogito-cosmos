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
        fromPrimitive,
        higherOrder,
        mood,
        upgradeCount
    } from '$lib/store'

    import { onDestroy, onMount } from 'svelte'
    import { tooltip } from '../tooltips/tooltip.svelte'
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
            resource.value.thoughts += 1
            return
        }
        // set multiplier, which expires after a time and starts decaying
        currentThoughtBoost.value = fromPrimitive.thoughtBoostMultiplier
        currentThoughtBoostTime.value = fromPrimitive.thoughtBoostDuration

        cancelAnimationFrame(myReq)
        myReq = requestAnimationFrame(animateThoughtBoost)
    }

    function handlePonder(): void {
        if (resource.value.thoughts < 100) return
        resource.value.knowledge += 1
        resource.value.thoughts -= 100
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
            currentThoughtBoost.value -= ((fromPrimitive.thoughtBoostMultiplier - 1) / thoughtBoostDecay) * deltaT
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
        if (thoughtBoostActive) currentThoughtBoost.value = fromPrimitive.thoughtBoostMultiplier
    })

    onMount(() => {
        myReq = requestAnimationFrame(animateThoughtBoost)
    })
    onDestroy(() => {
        if (cancelAnimationFrame) cancelAnimationFrame(myReq)
    })

    const thinkBtnTooltip = $derived.by(() => {
        if (unlocked.value.thoughtBoost) {
            return `${formatNumber(fromPrimitive.thoughtBoostMultiplier, 2)}x thoughts/s for ${formatTime(fromPrimitive.thoughtBoostDuration / 1000)}`
        } else return '+1 thought'
    })
</script>

<Window title="Cogito Ergo Sum" themeId="cogitoErgoSum" --width="500px">
    <!-- <div style="position: absolute; right: 8px; top: 8px;">
            <input type="checkbox" name="buyMax" bind:checked={buyMaxUpgrades} />
            <label for="buyMax">Buy Max</label>
        </div> -->

    <div style="display: flex; justify-content: start; flex-direction:column; background-color: var(--dp02); padding: 8px; border-radius: 4px; height: 4rem;">
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
                        {formatNumber(higherOrder.thoughtsPerSec, 2)}
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
                {#if unlocked.value.ponderPassively}
                    <span>
                        You are acquiring {formatNumber(fromPrimitive.knowledgePerSec, 2)}
                        <span data-theme-colors="knowledge" style="color: var(--themeColor2); font-weight:bold">knowledge</span> per second<br />
                    </span>
                    <span>
                        while thinking away {formatNumber(-higherOrder.thoughtsPerSec, 2)}
                        <span data-theme-colors="thoughts" style="color: var(--themeColor2); font-weight:bold">thoughts</span> per second
                    </span>
                {:else}
                    <span>
                        You want to acquire <span data-theme-colors="knowledge" style="color: var(--themeColor2); font-weight:bold">knowledge</span>.
                    </span>
                {/if}
            {:else if mood.value === 'sad'}
                <span>
                    You are gaining {formatNumber(fromPrimitive.insightPerSec, 2)}
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
