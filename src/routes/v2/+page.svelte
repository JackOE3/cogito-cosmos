<script lang="ts">
    import AutoButton from '$lib/components/AutoButton.svelte'
    import ProgBar from '$lib/components/misc/ProgBar.svelte'
    import { tooltip } from '$lib/components/tooltips/tooltip.svelte'
    import SkillTooltip from '$lib/components/tooltips/SkillTooltip.svelte'
    import UnlockDrawer from '$lib/components/UnlockDrawer.svelte'
    import { formatNumber, formatTime, formatWhole } from '$lib/gamelogic/utils'
    import {
        addResource,
        currentThoughtBoost,
        currentThoughtBoostTime,
        derivedState,
        enlightenmentStage,
        enlightenmentSubstage,
        formulas,
        health,
        mood,
        resource,
        skills,
        unlocked,
        unlocks,
        upgradeCount,
        upgrades
    } from '$lib/store'
    import { onDestroy, onMount } from 'svelte'
    import UpgradeButton from '$lib/components/UpgradeButton.svelte'

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

    const ponderCost = 100
    function handlePonder(): void {
        if (resource.value.thoughts < ponderCost) return
        addResource('knowledge', 1)
        addResource('thoughts', -ponderCost)
    }

    const cryCost = 100
    function handleCry(): void {
        if (resource.value.knowledge < cryCost) return
        addResource('insight', 1)
        addResource('knowledge', -cryCost)
    }

    const enlightenmentStageNames = [
        'Amoeba',
        'Cockroach',
        // ...
        'Buddha'
    ]
    /**
     * The different kind of substages you have to advance through to get to the next main stage
     */
    const enlightenmentSubstageNames = ['Lesser', 'Novice', 'Advanced', 'Expert', 'Master'] as const
    type EnlightenmentSubstageNames = (typeof enlightenmentSubstageNames)[number]

    function handleAdvanceStage(): void {
        const points = derivedState.enlightenmentPoints
        const pointsToNextStage = derivedState.enlightenmentPointsToNextSubstage
        if (points < pointsToNextStage) return

        enlightenmentSubstage.value++
        if (enlightenmentSubstage.value > 5) {
            enlightenmentSubstage.reset()
            enlightenmentStage.value++
        }
    }

    const currentEpProgress = $derived.by(() => {
        const stage = enlightenmentStage.value
        const substage = enlightenmentSubstage.value
        const pointsToLastStage = formulas.totalEPNeededForStage(stage, substage - 1)
        if (derivedState.enlightenmentPoints > formulas.totalEPNeededForStage(stage, substage)) {
            return formulas.totalEPNeededForStage(stage, substage) - pointsToLastStage
        } else return derivedState.enlightenmentPoints - pointsToLastStage
    })

    const epNeededInCurrentStage = $derived(enlightenmentStage.value * 10)

    const stageProgress = $derived((currentEpProgress / epNeededInCurrentStage) * 100)
</script>

<div style="display: flex; flex-direction:column; gap: 1.5rem; align-items: center">
    <div class="box" style="margin-top: 60px">
        <span style="font-size: .875rem">
            Enlightenment Stage: {enlightenmentSubstageNames[enlightenmentSubstage.value - 1]}
            {enlightenmentStageNames[enlightenmentStage.value - 1] ?? 'Not yet named'} ({enlightenmentStage.value}-{enlightenmentSubstage.value})
        </span>
        <div style="height: 2rem; width:max-content; display: flex; gap:0.5rem">
            <ProgBar --widthProgBar="300px" --heightProgBar="2rem" --progress="{stageProgress}%" --progBarBgColor={stageProgress >= 100 ? 'green' : ''}>
                {formatWhole(currentEpProgress)} / {formatWhole(epNeededInCurrentStage)}
            </ProgBar>

            <button class:disabled={stageProgress < 100} onclick={handleAdvanceStage} style="width: 70px;">
                {#if stageProgress < 100}
                    Advance
                {:else}
                    Advance!
                {/if}
            </button>
        </div>
        <span>
            <p>
                You have {formatNumber(derivedState.enlightenmentPoints, 0)} enlightenment points.
            </p>
            <p>Next stage requires {formatNumber(derivedState.enlightenmentPointsToNextSubstage, 0)} EP</p>
        </span>
    </div>

    <div class="box">
        <div style="display: flex; gap: 0.5rem; width: 100%;">
            <AutoButton style="width: 100%" onclick={handleThink} tooltipOptions={{ data: thinkBtnTooltip }}>
                {#if unlocked.value.thoughtBoost}
                    Thought Boost
                {:else}
                    Happy Thoughts
                {/if}
            </AutoButton>
            <AutoButton
                style="width: 100%"
                tooltipOptions={{ data: '+1 knowledge <br> -100 thoughts' }}
                onclick={handlePonder}
                disabled={resource.value.thoughts < ponderCost}>
                Ponder
            </AutoButton>
            <AutoButton
                style="width: 100%"
                tooltipOptions={{ data: '+1 insight <br> -100 knowledge' }}
                onclick={handleCry}
                disabled={resource.value.knowledge < cryCost}>
                Cry
            </AutoButton>
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
            --widthProgBar="100%"
            --heightProgBar="1rem"
            --barColor="linear-gradient(to right, #170000 0%, red 30%, yellow 50%, green 90%)"
            --progress="{Math.abs(health.value * 100)}%">
        </ProgBar>

        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <span>
                <p>Your active <strong>Blessings</strong>: (0/{derivedState.maxActiveSkills})</p>
                <p style="color:var(--text-medium-emphasis)">Click a slot to assign a blessing to it.</p>
            </span>
            <!-- <div style="display:flex;gap:0px">
            {#each skills as skill}
                <button style="aspect-ratio:1; width: 60px;" use:tooltip={{ data: skill, Component: SkillTooltip, direction: Direction.RIGHT }}>
                    {skill.name.slice(0, 3)}
                </button>
            {/each}
        </div> -->
            <div style="display: flex; gap: 0rem">
                {#each { length: skills.length }, rank}
                    {@const skill = skills[rank]}
                    <button style="aspect-ratio:1; width: 60px;" use:tooltip={() => ({ data: skill, Component: SkillTooltip })}>
                        {skill.name.slice(0, 3)}
                    </button>
                {/each}
            </div>
        </div>
    </div>

    <div style="display: flex; flex-direction: row; gap: 1.5rem;">
        <div class="box" data-theme-colors="thoughts">
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
            <div class="gridColumn">
                <UpgradeButton
                    upgradeName="thoughtAcceleration"
                    btnUnlocked={unlocked.value.thinkFaster}
                    tooltipText={`You think faster. <br>Change: +${(1 + upgradeCount.value.thoughtJerk) * (1 + upgradeCount.value.thoughtSnap)} thoughts/s <br>`}>
                </UpgradeButton>
                <UpgradeButton
                    upgradeName="thoughtJerk"
                    tooltipText={`Increase the potency of the upgrade <br> "${upgrades.thoughtAcceleration.title}" by adding <br> +${1 + upgradeCount.value.thoughtSnap} to its effect. <br>Change: +${upgradeCount.value.thoughtAcceleration * (1 + upgradeCount.value.thoughtSnap)} thoughts/s`}>
                </UpgradeButton>
                <UpgradeButton
                    upgradeName="thoughtSnap"
                    tooltipText={`Increase the potency of the upgrade <br> "${upgrades.thoughtJerk.title}" by adding <br> +1 to its effect. <br>Change: +${upgradeCount.value.thoughtAcceleration} thoughts/s`}>
                </UpgradeButton>

                <UpgradeButton
                    upgradeName="thoughtBoostMultiplier"
                    btnUnlocked={unlocked.value.thoughtBoost}
                    tooltipText="Increase the multiplier of Thought Boost">
                </UpgradeButton>

                <UpgradeButton
                    upgradeName="thoughtBoostDuration"
                    btnUnlocked={unlocked.value.thoughtBoost}
                    tooltipText="Increase the duration of Thought Boost">
                </UpgradeButton>
            </div>
        </div>
        <div class="box" data-theme-colors="knowledge">
            <div style="display:flex; flex-direction:column; gap: 4px">
                <div class="resourceDisplay">
                    {formatNumber(resource.value.knowledge, 2)}
                    <span style="color: var(--themeColor2); font-weight:bold">Knowledge</span>
                </div>
                <span>{formatNumber(derivedState.knowledgePerSec, 2)}/s </span>
            </div>
            <div class="gridColumn">
                <UpgradeButton upgradeName="knowledgeGeneration" tooltipText={`Acquire more knowledge. <br> Change: +${0.1} knowledge/s`}></UpgradeButton>
                <UpgradeButton
                    upgradeName="studySmarter"
                    tooltipText={`Increase the potency of the upgrade <br> "${upgrades.knowledgeGeneration.title}" by adding <br> +1 to its effect.`}>
                </UpgradeButton>
            </div>
        </div>
        <div class="box" data-theme-colors="insight">
            <div style="display:flex; flex-direction:column; gap: 4px">
                <div class="resourceDisplay">
                    {formatNumber(resource.value.insight, 2)}
                    <span style="color: var(--themeColor2); font-weight:bold">Insight</span>
                </div>
                <span>{formatNumber(derivedState.insightPerSec, 2)}/s </span>
            </div>
            <div class="gridColumn">
                <UpgradeButton upgradeName="insightGeneration" tooltipText={`Gain more insight. <br> Change: +${0.01} insight/s`}></UpgradeButton>
            </div>
        </div>
    </div>

    <div style="display: flex; gap: 0.5rem">
        <UnlockDrawer unlocks={unlocks.thoughts} folderName="Swordsman_Skill_Icons_Pack" themeId="thoughts" />
        <UnlockDrawer unlocks={unlocks.knowledge} folderName="Free Alchemical Ingredient Icons Pack" themeId="knowledge" />
        <UnlockDrawer unlocks={unlocks.insight} folderName="Free 50 Aeromancer Skills" themeId="insight" />
        <UnlockDrawer unlocks={unlocks.cheese} folderName="Free 50 Aeromancer Skills" themeId="cheese" />
    </div>
</div>

<style>
    .box {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: var(--dp01);
        border: 1px solid var(--dp04);
        padding: 1rem;
    }
</style>
