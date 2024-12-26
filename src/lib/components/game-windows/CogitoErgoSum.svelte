<script lang="ts">
    import Window from './window-model/Window.svelte'
    import { formatNumber, formatTime } from '$lib/gamelogic/utils'
    import {
        unlocks,
        LORCA_OVERRIDE,
        resource,
        unlocked,
        currentThoughtBoost,
        currentThoughtBoostTime,
        derivedState,
        mood,
        upgradeCount,
        health,
        addResource
    } from '$lib/store'
    import { tooltip } from '../tooltips/tooltip.svelte'
    import ProgBar from '../misc/ProgBar.svelte'

    let buyMaxUpgrades = false

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
        <fieldset>
            <legend>Change Mood</legend>
            {#if unlocked.value.neutralMood}
                <label class="form-control">
                    <input type="radio" name="mood" bind:group={mood.value} value="happy" />
                    Happy
                </label>

                <label class="form-control">
                    <input type="radio" name="mood" bind:group={mood.value} value="neutral" />
                    Neutral
                </label>
            {/if}
            {#if unlocked.value.sadMood}
                <label class="form-control">
                    <input type="radio" name="mood" bind:group={mood.value} value="sad" />
                    Sad
                </label>
            {/if}
        </fieldset>

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
</style>
