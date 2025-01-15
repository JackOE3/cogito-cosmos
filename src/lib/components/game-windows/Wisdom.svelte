<script lang="ts">
    import { formatNumber, formatWhole } from '$lib/gamelogic/utils'
    import { unlocks, derivedState, upgradeCount, unlocked, resource, upgrades, generators, type GeneratorName, type GeneratorOld } from '$lib/store'
    import { onMount } from 'svelte'
    import ProgBar from '../misc/ProgBar.svelte'
    import { tooltip } from '../tooltips/tooltip.svelte'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import UpgradeButton from '../UpgradeButton.svelte'
    import Window from './window-model/Window.svelte'

    //const progress = $derived((generators.value.T1.exp / derivedState.generatorExpRequirement.T1) * 100)

    const generatorDescription: Record<GeneratorName, string> = {
        T1: 'Each level boosts thinking by +10%.',
        K1: 'Each level boosts knowledge gain by +10%.',
        I1: 'Each level boosts insight gain by +10%.',

        T2: 'Each level boosts T1 Exp gain by +100%.',
        K2: 'Each level boosts K1 Exp gain by +100%.',
        I2: 'Each level boosts I1 Exp gain by +100%.'
    }

    const checkBoxes: Record<GeneratorName, HTMLInputElement | undefined> = {
        T1: undefined,
        T2: undefined,
        K1: undefined,
        K2: undefined,
        I1: undefined,
        I2: undefined
    }

    function toggleGenerator(name: GeneratorName, generator: GeneratorOld): void {
        if (generator.active) {
            generator.active = false
        } else if (derivedState.numActiveGenerators < derivedState.numMaxActiveGenerators) {
            generator.active = true
        }
        // update the UI
        if (checkBoxes[name]) checkBoxes[name].checked = generator.active
    }

    onMount(() => {
        // check the checkbox if generators active
        Object.entries(checkBoxes).forEach(([name, checkbox]) => {
            if (checkbox) checkbox.checked = generators.value[name as GeneratorName].active
        })
    })
</script>

<Window title="Wisdom" themeId="insight">
    <div style="display:flex; flex-direction:column; gap: 4px">
        <div class="resourceDisplay">
            {formatNumber(resource.value.wisdom, 2)}
            <span style="color: var(--themeColor2); font-weight:bold">Wisdom</span>
        </div>
        <span>{formatNumber(derivedState.wisdomPerSec, 2)}/s </span>
    </div>
    <div class="gridColumn">
        <UpgradeButton upgradeName="gainEP" tooltipText={`Gain ${5} enlightenment points`}></UpgradeButton>
        <UpgradeButton upgradeName="decreaseGeneratorExpRequirement" tooltipText={`Decrease the EXP requirement to <br> level up T1 by a factor of 10.`}
        ></UpgradeButton>
        <button>K1 Discount</button>
    </div>

    <p>Active Generators: {derivedState.numActiveGenerators}/{derivedState.numMaxActiveGenerators}</p>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
        {#each Object.entries(generators.value) as [generatorName, generator] (generatorName)}
            {@const name = generatorName as GeneratorName}
            {@const progress = (generator.exp / derivedState.generatorExpRequirement[name]) * 100}

            <div
                style="display: flex; flex-direction: row; gap: 0.25rem; align-items: center;"
                use:tooltip={() => ({
                    data: `GeneratorOld: ${name} <br> Level: ${formatWhole(generator.lvl)} <hr> ${generatorDescription[name]} <br> Total: ${formatNumber(derivedState.generatorBoostFrom[name], 1)}x <hr> Currently gaining ${formatNumber(derivedState.generatorExpPerSec[name], 2)} Exp/s`
                })}>
                <!-- <span>{name}</span> -->
                <label>
                    <input type="checkbox" bind:this={checkBoxes[name]} onchange={() => toggleGenerator(name, generator)} />
                    {name}
                </label>

                <ProgBar --widthProgBar="100px" --heightProgBar="1.5rem" --progress="{progress}%" --barColor={generator.active ? '#2196f3' : ''}>
                    {formatNumber(generator.exp, 2)} / {formatNumber(derivedState.generatorExpRequirement[name], 2)}
                </ProgBar>
                <span>{formatWhole(generator.lvl)}</span>
            </div>
        {/each}
    </div>
</Window>

<style>
</style>
