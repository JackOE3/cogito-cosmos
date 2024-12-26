<script lang="ts">
    import Window from './window-model/Window.svelte'
    import { formatNumber, formatTime, formatWhole } from '$lib/gamelogic/utils'
    import {
        unlocks,
        LORCA_OVERRIDE,
        resource,
        unlocked,
        derivedState,
        mood,
        upgradeCount,
        enlightenmentStage,
        health,
        enlightenmentSubstage,
        formulas
    } from '$lib/store'

    import { Direction, tooltip } from '../tooltips/tooltip.svelte'
    import ProgBar from '../misc/ProgBar.svelte'
    import { skills } from '$lib/store/primitive/skills.svelte'
    import SkillTooltip from '../tooltips/SkillTooltip.svelte'

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

<Window title="Path to Enlightenment" themeId="cogitoErgoSum" --width="500px">
    <!-- <div style="position: absolute; right: 8px; top: 8px;">
            <input type="checkbox" name="buyMax" bind:checked={buyMaxUpgrades} />
            <label for="buyMax">Buy Max</label>
        </div> -->
    <span style="font-size: .875rem">
        You are at Stage {enlightenmentStage.value}-{enlightenmentSubstage.value}: {enlightenmentSubstageNames[enlightenmentSubstage.value - 1]}
        {enlightenmentStageNames[enlightenmentStage.value - 1] ?? 'Not yet named'}
    </span>
    <div style="height: 2rem; width:100%; display: flex; gap:0.5rem">
        <div style="flex: 1; width: 100%; height: 100%;">
            <ProgBar --widthProgBar="100%" --heightProgBar="2rem" --progress="{stageProgress}%" --progBarBgColor={stageProgress >= 100 ? 'green' : ''}>
                {formatWhole(currentEpProgress)} / {formatWhole(epNeededInCurrentStage)}
            </ProgBar>
        </div>
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
                <button style="aspect-ratio:1; width: 60px;" use:tooltip={{ data: skill, Component: SkillTooltip, direction: Direction.RIGHT }}>
                    {skill.name.slice(0, 3)}
                </button>
            {/each}
        </div>
    </div>
</Window>

<style>
</style>
