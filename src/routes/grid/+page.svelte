<script lang="ts">
    import ProgBar from '$lib/components/misc/ProgBar.svelte'
    import { tooltip } from '$lib/components/tooltips/tooltip.svelte'
    import { colors, formatNumber, uuidv4 } from '$lib/gamelogic/utils'
    import {
        derivedGrid,
        fastFowardFactor,
        gridCell,
        level,
        LORCA_OVERRIDE,
        N_COLS,
        N_ROWS,
        Resource,
        resource,
        type CellContent,
        type CombatI,
        type GeneratorI,
        type GeneratorResource,
        type UpgradeI
    } from '$lib/store'
    import { cubicOut, quartOut } from 'svelte/easing'
    import { fly } from 'svelte/transition'
    import { Tween } from 'svelte/motion'
    import UpgradeCellComponent from '$lib/components/UpgradeCell.svelte'

    const center = Math.floor(N_ROWS / 2)

    function distanceFromCenter(i: number, j: number): number {
        return Math.sqrt((i - center) ** 2 + (j - center) ** 2)
    }

    function getCellHP(i: number, j: number): number {
        const max = 100
        const min = 10
        const random = Math.floor(Math.random() * (max + 1 - min) + min)
        return Math.pow(2, distanceFromCenter(i, j) ** 2)
    }

    function setStartingCell() {
        gridCell.value[center][center].hidden = false
        if (gridCell.value[center][center].content.type !== 'combat') return
        gridCell.value[center][center].content.HP = 1
        gridCell.value[center][center].content.maxHP = 1
    }

    function populateCells(): void {
        for (let i = 0; i < N_ROWS; i++) {
            for (let j = 0; j < N_COLS; j++) {
                const maxHP = getCellHP(i, j)
                gridCell.value[i][j] = {
                    id: uuidv4(),
                    location: { row: i, col: j },
                    hidden: true,
                    content: {
                        type: 'combat',
                        HP: maxHP,
                        maxHP: maxHP,
                        active: false,
                        intervalId: 0,
                        progress: new Tween(100, {
                            duration: 400,
                            easing: cubicOut
                        }),
                        defeated: false
                    },
                    relX: 0,
                    relY: 0
                }
            }
        }
        setStartingCell()
    }

    if (typeof gridCell.value[center][center] === 'undefined') populateCells()

    // This is needed because you cant save a Tween object to localStorage
    gridCell.value.flat().forEach(cell => {
        if (cell.content.type === 'combat')
            cell.content.progress = new Tween((100 * cell.content.HP) / cell.content.maxHP, {
                duration: 400,
                easing: cubicOut
            })
    })

    /**
     * Make the surrounding (adjacent) hidden cells around a point visible and fade in.
     * @param i y-coordinate (bigger = lower)
     * @param j x-coordinate (bigger = more right)
     */
    function unhideSurroundingCells(i: number, j: number) {
        const grid = gridCell.value
        // SET TRANSITION DEPENDING ON RELATIVE LOCATION
        if (i + 1 < grid.length) {
            grid[i + 1][j].relY = 1
        }
        if (i - 1 >= 0) {
            grid[i - 1][j].relY = -1
        }
        if (j + 1 < grid[i].length) {
            grid[i][j + 1].relX = 1
        }
        if (j - 1 >= 0) {
            grid[i][j - 1].relX = -1
        }

        // BLOCK TRANSLATION ON ANIMATION WITH THESE CONDITIONS
        // is a cell 2 down already unhidden? (would overlap the animation)
        if (i + 2 < grid[i].length && !grid[i + 2][j].hidden) {
            grid[i + 1][j].relY = 0
        }
        // is a cell 2 up already unhidden?
        if (i - 2 >= 0 && !grid[i - 2][j].hidden) {
            grid[i - 1][j].relY = 0
        }
        // is a cell 2 right already unhidden?
        if (j + 2 < grid[i].length && !grid[i][j + 2].hidden) {
            grid[i][j + 1].relX = 0
        }
        // is a cell 2 left already unhidden?
        if (j - 2 >= 0 && !grid[i][j - 2].hidden) {
            grid[i][j - 1].relX = 0
        }

        // UNHIDE
        if (i + 1 < grid.length) {
            grid[i + 1][j].hidden = false
        }
        if (i - 1 >= 0) {
            grid[i - 1][j].hidden = false
        }
        if (j + 1 < grid[i].length) {
            grid[i][j + 1].hidden = false
        }
        if (j - 1 >= 0) {
            grid[i][j - 1].hidden = false
        }
    }

    function makeGeneratorCell(resource: GeneratorResource): GeneratorI {
        return {
            type: 'generator',
            resource,
            active: false,
            progress: 0,
            efficiency: 1
        }
    }

    function makeAddAttackUpgrade(addAttack: number, cost: number, resource: GeneratorResource): UpgradeI {
        return {
            type: 'upgrade',
            id: uuidv4(),
            upgradeType: 'addAttack',
            addAttack,
            title: 'ATK++',
            description: ['Increase your attack power. (additive)'],
            cost,
            resource,
            costMultiplier: 1.3,
            count: 0
        }
    }
    function makeMultAttackUpgrade(multAttack: number, cost: number, resource: GeneratorResource): UpgradeI {
        return {
            type: 'upgrade',
            id: uuidv4(),
            upgradeType: 'multAttack',
            multAttack,
            title: 'ATK*',
            description: ['Multiply your attack power.'],
            cost,
            resource,
            costMultiplier: 1.3,
            count: 0
        }
    }
    function makeAddGeneratorGainUpgrade(forGeneratorResource: GeneratorResource, addGain: number, cost: number, resource: GeneratorResource): UpgradeI {
        const titleDict: Record<GeneratorResource, string> = {
            red: 'R++',
            green: 'G++',
            blue: 'B++'
        }
        return {
            type: 'upgrade',
            id: uuidv4(),
            upgradeType: 'addGeneratorGain',
            forGeneratorResource,
            addGain,
            title: titleDict[forGeneratorResource],
            description: [`Get more ${forGeneratorResource} every time the ${forGeneratorResource} bar fills.`],
            cost,
            resource,
            costMultiplier: 1.3,
            count: 0
        }
    }
    function makeAddGeneratorSpeedUpgrade(forGeneratorResource: GeneratorResource, addSpeed: number, cost: number, resource: GeneratorResource): UpgradeI {
        const titleDict: Record<GeneratorResource, string> = {
            red: 'R>>',
            green: 'G>>',
            blue: 'B>>'
        }
        return {
            type: 'upgrade',
            id: uuidv4(),
            upgradeType: 'addGeneratorSpeed',
            forGeneratorResource,
            addSpeed,
            title: titleDict[forGeneratorResource],
            description: [`Increase the speed of the ${forGeneratorResource} bar.`],
            cost,
            resource,
            costMultiplier: 1.3,
            count: 0
        }
    }

    /**
     * deterministic cell content for rapid prototyping
     */
    function setDeterministicCellContent(): CellContent[][] {
        const gridCellContent: CellContent[][] = Array.from({ length: N_ROWS }, () => new Array(N_COLS).fill({ type: 'empty' }))

        gridCellContent[center][center - 1] = makeGeneratorCell(Resource.RED)
        gridCellContent[center][center] = makeGeneratorCell(Resource.GREEN)
        gridCellContent[center][center + 1] = makeGeneratorCell(Resource.BLUE)

        gridCellContent[center + 1][center - 1] = makeAddGeneratorGainUpgrade(Resource.RED, 1, 5, Resource.RED)
        gridCellContent[center + 2][center - 1] = makeAddGeneratorSpeedUpgrade(Resource.RED, 1, 5, Resource.RED)

        gridCellContent[center][center + 2] = makeAddAttackUpgrade(1, 10, Resource.RED)
        gridCellContent[center][center + 3] = makeMultAttackUpgrade(1.5, 10, Resource.RED)

        return gridCellContent
    }

    const gridCellContentDeterministic = setDeterministicCellContent()

    /**
     * When you defeat cells und "uncover" them, the logic here determines
     * which specific cell will be procedurally generated (type & properties).
     * @param i y-coordinate (bigger = lower)
     * @param j x-coordinate (bigger = more right)
     */
    function setCellContent(i: number, j: number) {
        // should not be purely randomly chosen, depends on what cells you have already
        // this will be quite complex and make or break good gameplay
        let content: CellContent

        content = gridCellContentDeterministic[i][j]

        gridCell.value[i][j].content = content
    }

    /**
     * Starts an Interval when attacking a combat cell with combat logic.
     */
    function handleCombatCellClicked(i: number, j: number, cell: CombatI) {
        if (cell.active) {
            console.log('cell is already active')
            cell.active = false
            clearInterval(cell.intervalId)
            return
        }
        // cell not active and no action points available -> do nothing
        if (!cell.active && actionPoints <= 0) {
            clearInterval(cell.intervalId)
            return
        }
        cell.active = true

        if (cell.HP >= 0) cell.progress.target = (cell.HP / cell.maxHP) * 100

        clearInterval(cell.intervalId)
        cell.intervalId = setInterval(() => {
            cell.HP -= derivedGrid.attack
            cell.progress.target = (cell.HP / cell.maxHP) * 100

            if (cell.HP <= 0.1) {
                cell.HP = 0
                cell.progress.target = 0 // Important so progress bar doesnt glitch!

                setTimeout(() => {
                    // dynamically set the content of the cell when you have defeated it
                    setCellContent(i, j)
                    /* console.log('cell is defeated and now set to inactive') */
                    cell.active = false
                    unhideSurroundingCells(i, j)
                }, 400)
                clearInterval(cell.intervalId)
            }
        }, 1000)
    }

    const generatorCellsActive = $derived(
        gridCell.value
            .flat()
            .filter(cell => cell.content.type === 'generator' && cell.content.active)
            .map(cell => cell.content as GeneratorI)
    )
    const numGeneratorCellsActive = $derived(generatorCellsActive.length)

    const combatCellsActive = $derived(
        gridCell.value
            .flat()
            .filter(cell => cell.content.type === 'combat' && cell.content.active)
            .map(cell => cell.content as CombatI)
    )
    const numCombatCellsActive = $derived(combatCellsActive.length)

    let animationId: number

    $effect(() => {
        if (numGeneratorCellsActive > 0) {
            lastTime = null
            animationId = requestAnimationFrame(evolveProgressBars)
        }
        /**
         * You can return a function from $effect, which will run
         * immediately before the effect re-runs, and before it is destroyed.
         */
        return () => {
            cancelAnimationFrame(animationId)
        }
    })

    let lastTime: number | null = null
    function evolveProgressBars(currentTime: number): void {
        if (lastTime === null) lastTime = currentTime
        const deltaTimeMillis = Math.max(Math.min(currentTime - lastTime), 0)
        lastTime = currentTime

        // this can show me the frame rate actually
        //console.log(deltaTimeMillis)

        for (const generator of generatorCellsActive) {
            generator.progress += (deltaTimeMillis / derivedGrid.generatorDurationForResource[generator.resource]) * fastFowardFactor.value
            while (generator.progress >= 1) {
                resource.value[generator.resource] += derivedGrid.generatorGainForResource[generator.resource]
                generator.progress -= 1
                // ensures that the progress bar will always start from 0 and not carry over some remainder:
                if (generator.progress < 1) generator.progress = 0
            }
        }

        if (numGeneratorCellsActive > 0) animationId = requestAnimationFrame(evolveProgressBars)
    }

    /**
     * The maximum number of actions points you have available.
     */
    let maxActionPoints = $state(3)

    /**
     * The amount of currently available action points.
     */
    let actionPoints = $derived.by(() => {
        let points = maxActionPoints
        points -= numGeneratorCellsActive
        points -= numCombatCellsActive
        return points
    })

    /**
     * Handles the logic for when you level up.
     */
    function handleLevelUp(): void {
        if (derivedGrid.expInLevel < derivedGrid.expToNextLevel) return
        level.value++
    }

    function defeatWholeGrid(): void {
        for (let i = 0; i < N_ROWS; i++) {
            for (let j = 0; j < N_ROWS; j++) {
                setCellContent(i, j)
            }
        }
    }

    function test(): void {
        const snappy = $state.snapshot(derivedGrid.upgradesInCellGrid)
        console.log(snappy)
    }
</script>

{#snippet basicCell(callback: () => void)}
    <button
        class="full"
        onclick={() => callback()}
        style="display: flex; flex-direction:column; justify-content: center; gap: 0.25rem;"
        use:tooltip={() => ({
            data: `Get some.`
        })}>
        <span>Basic</span>
    </button>
{/snippet}

{#snippet generatorCell(generator: GeneratorI)}
    <button
        class="full"
        onclick={() => {
            if (!generator.active && actionPoints <= 0) return
            generator.active = !generator.active
            //if (!generatorActive[resourceName] && actionPoints <= 0) return
            //generatorActive[resourceName] = !generatorActive[resourceName]
        }}
        style="display: flex; flex-direction:column; justify-content: center; gap: 0.25rem; {generator.active
            ? `background: ${colors(0.2)[generator.resource]}`
            : ''}"
        use:tooltip={() => ({
            data: `Farm some ${generator.resource}. <br> +${derivedGrid.generatorGainForResource[generator.resource]} ${generator.resource} every ${formatNumber(derivedGrid.generatorDurationForResource[generator.resource] / 1000, 2)}s <br> Uses 1 AP while active.`
        })}>
        <span>GET {generator.resource.toUpperCase()}</span>
        {#if generator.active}
            <ProgBar
                --widthProgBar="100%"
                --heightProgBar="0.5rem"
                --barColor={colors(0.6)[generator.resource]}
                --progBarBgColor="var(--dp24)"
                --progress="{generator.progress * 100}%">
            </ProgBar>
        {/if}
    </button>
{/snippet}

{#snippet upgradeCell(upgrade: UpgradeI)}
    <UpgradeCellComponent {upgrade} class="full">
        {upgrade.title}
        ({upgrade.count})
    </UpgradeCellComponent>
{/snippet}

{#snippet combatCell(i: number, j: number, cell: CombatI)}
    <button
        style="width: 100%; height: 100%; outline: none; position: relative; display: flex; flex-direction:column; justify-content: center; gap: 0.25rem; {cell.active
            ? 'background: rgba(255,255,255,0.4);'
            : ''}"
        onclick={() => handleCombatCellClicked(i, j, cell)}
        use:tooltip={() => ({ data: 'nice' })}>
        {formatNumber(cell.HP, 2)}
        {#if cell.active}
            <ProgBar --widthProgBar="100%" --heightProgBar="0.5rem" --barColor="red" --progBarBgColor="var(--dp24)" --progress="{cell.progress.current}%">
            </ProgBar>
        {/if}
    </button>
{/snippet}

<div style="display: flex; flex-direction:column; gap: 1.5rem; justify-content: center; align-items: center; margin-top: 100px;">
    <div class="stats">
        Red: {formatNumber(resource.value.red, 2)}, Green: {formatNumber(resource.value.green, 2)}, Blue: {formatNumber(resource.value.blue, 2)}, Attack: {derivedGrid.attack},
        AP: {actionPoints}/{maxActionPoints}
        <br />
        Level: {level.value}
        ({derivedGrid.expInLevel} / {derivedGrid.expToNextLevel} XP)
        <button onclick={handleLevelUp}>Level Up</button> Auto?
        <button onclick={populateCells}>Reset Grid</button>
        <button onclick={() => defeatWholeGrid()}> Defeat whole grid </button>
        <button onclick={() => test()}> Test </button>
    </div>

    <div class="grid">
        {#each gridCell.value as row, i}
            {#each row as cell, j}
                <div>
                    {#if !cell.hidden || LORCA_OVERRIDE.value}
                        <div class="full" in:fly={{ duration: 1000, x: cell.relX * 40, y: cell.relY * 40, easing: quartOut }}>
                            {#if cell.content.type === 'combat' && !LORCA_OVERRIDE.value}
                                {@render combatCell(i, j, cell.content)}
                            {:else if cell.content.type === 'generator'}
                                {@render generatorCell(cell.content)}
                            {:else if cell.content.type === 'upgrade'}
                                {@render upgradeCell(cell.content)}
                            {:else}
                                <div class="cell-unlocked"></div>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/each}
        {/each}
    </div>
</div>

<style>
    .stats {
        background: var(--dp01);
        border: 1px solid var(--dp08);
        width: 400px;
        padding: 0.5rem;
    }
    .grid {
        display: grid;
        gap: 0rem;
        --size: 80px;
        grid-template-columns: repeat(9, var(--size));
        grid-template-rows: repeat(9, var(--size));
    }

    .cell-unlocked {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--dp01);
        border: 1px solid var(--dp08);
        box-sizing: border-box;

        /* outline: 1px solid rgba(0, 0, 0, 0.6); */

        border-left: rgba(255, 255, 255, 0.2);
        border-right: rgba(0, 0, 0, 0.4);
        border-top: rgba(255, 255, 255, 0.2);
        border-bottom: rgba(0, 0, 0, 0.4);
        border-width: 1px;
        border-radius: 0px;
        border-style: solid;
    }
</style>
