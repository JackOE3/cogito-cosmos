<script lang="ts">
    import ProgBar from '$lib/components/misc/ProgBar.svelte'
    import { tooltip } from '$lib/components/tooltips/tooltip.svelte'
    import { colors, formatNumber, formatWhole, isDefined, randInt, square, uuidv4 } from '$lib/gamelogic/utils'
    import {
        derivedGrid,
        fastFowardFactor,
        gridCell,
        level,
        LORCA_OVERRIDE,
        N_COLS,
        N_ROWS,
        resource,
        type Cell,
        type CellContent,
        type CombatI,
        type GeneratorDerivativeI,
        type GeneratorI,
        type GeneratorResource,
        type Coordinate,
        type LockedI,
        type ResourceMetric,
        type Stencil,
        type UpgradeI,
        type EffectType,
        type CellShopItem,
        cellShopItems,
        type CellEffect,
        type Formula
    } from '$lib/store'
    import { bounceOut, cubicOut, elasticOut, quartOut } from 'svelte/easing'
    import { fade, fly, scale } from 'svelte/transition'
    import { Tween } from 'svelte/motion'
    import UpgradeCellComponent from '$lib/components/UpgradeCell.svelte'
    import { movable } from '$lib/gamelogic/movable.svelte'
    import {
        applyCellEffects,
        applyEffect,
        getAllAffectedCells,
        getAreaOfEffectDescription,
        getEffectDescription,
        getTotalEffectValue
    } from '$lib/gamelogic/cell-effects.svelte'

    const unicodeChars = {
        upwardsPairedArrows: '&#8648;',
        clockwiseGappedCircleArrow: '&#10227;'
    }

    const center = Math.floor(N_ROWS / 2)

    function distanceFromCenter(i: number, j: number): number {
        return Math.sqrt((i - center) ** 2 + (j - center) ** 2)
    }

    function setStartingCell() {
        insertCellContent({ row: center, col: center }, makeGenerator(2000, { amount: 1, resource: 'red' }))
    }

    function getRandomResource(): GeneratorResource {
        const colors = ['red', 'green', 'blue'] as const
        const randomIndex = Math.floor(Math.random() * colors.length)
        return colors[randomIndex]
    }

    function populateCells(): void {
        console.log('populating')
        for (let i = 0; i < N_ROWS; i++) {
            for (let j = 0; j < N_COLS; j++) {
                gridCell.value[i][j] = {
                    id: uuidv4(),
                    coord: { row: i, col: j },
                    hidden: true,
                    content: { type: 'empty' },
                    dependencies: [],
                    relX: 0,
                    relY: 0
                }
            }
        }
        setStartingCell()
    }

    if (gridCell.value.flat().some(cell => !isDefined(cell))) {
        populateCells()
    }

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

    function makeCombat(hp: number): CombatI {
        return {
            type: 'combat',
            HP: hp,
            maxHP: hp,
            active: false,
            intervalId: 0,
            progress: new Tween(100, {
                duration: 400,
                easing: cubicOut
            }),
            defeated: false
        }
    }
    function makeGenerator(
        duration: number,
        gain: {
            amount: number
            resource: GeneratorResource
        },
        cost?: {
            amount: number
            resource: GeneratorResource
        }
    ): GeneratorI {
        let costGen: ResourceMetric | undefined = undefined
        if (cost) costGen = { base: cost.amount, current: cost.amount, multipliers: [], resource: cost.resource }
        return {
            type: 'generator',
            gain: { base: gain.amount, current: gain.amount, multipliers: [], resource: gain.resource },
            cost: costGen,
            baseDurationMillis: duration,
            speed: {
                base: 1,
                current: 1,
                multipliers: []
            },
            active: false,
            progress: 0
        }
    }

    function makeGeneratorDerivative(stencil: Stencil, effectType: EffectType, effectValue: number, formula: Formula = 'additive'): GeneratorDerivativeI {
        return {
            type: 'generatorDerivative',
            effect: {
                type: effectType,
                stencil,
                value: {
                    base: effectValue,
                    current: effectValue,
                    currentCumulative: 0,
                    multipliers: []
                },
                formula
            },
            currentExp: 0,
            requiredExp: {
                base: 1,
                current: 1,
                multipliers: []
            },
            expPerSec: {
                base: 1,
                current: 1,
                multipliers: []
            },
            level: 0,
            active: false,
            progress: 0
        }
    }
    function makeUpgrade(
        stencil: Stencil,
        effectType: EffectType,
        effectValue: number,
        cost: {
            amount: number
            resource: GeneratorResource
        },
        formula: Formula = 'additive',
        maxBuy?: number
    ): UpgradeI {
        // depending on coord and stencil, update the dependency arrays of affected cells with the id for this cell
        return {
            type: 'upgrade',
            effect: {
                type: effectType,
                stencil,
                value: {
                    base: effectValue,
                    current: effectValue,
                    currentCumulative: 0,
                    multipliers: []
                },
                formula
            },
            cost: {
                base: cost.amount,
                current: cost.amount,
                multipliers: [],
                resource: cost.resource
            },
            costMultiplier: 1.2,
            count: 0,
            maxBuy
        }
    }

    function insertCellContent(coord: Coordinate, content: CellContent): void {
        gridCell.value[coord.row][coord.col].hidden = false
        gridCell.value[coord.row][coord.col].content = content

        // update the dependency arrays of affected cells for future reference (eg. when adding a new cell)
        if ('effect' in content) {
            const cellId = gridCell.value[coord.row][coord.col].id
            const affectedCells = getAllAffectedCells(coord, content.effect.stencil)
            for (const cell of affectedCells) {
                cell.dependencies.push(cellId)
            }
        }
        // if this cell is already affected by other cells, apply their effects to it
        const cell = gridCell.value[coord.row][coord.col]
        if (cell.dependencies.length > 0) {
            for (const id of cell.dependencies) {
                // find the cell from its id
                const cellDep = gridCell.value.flat().find(cell => cell.id === id)
                if (!isDefined(cellDep)) continue
                // check if type of cellDep has an effect property
                if (!('effect' in cellDep.content)) continue
                // console.log('found dependency:', $state.snapshot(cellDep))

                applyEffect[cellDep.content.effect.type](cell, cellDep.content.effect, id)
            }
        }
    }

    const relToCoord = (rel: Coordinate): Coordinate => {
        return {
            row: center + rel.row,
            col: center + rel.col
        }
    }

    /**
     * deterministic cell content for rapid prototyping
     */
    function setDeterministicCellContent(): void {
        insertCellContent(relToCoord({ row: -1, col: 0 }), makeUpgrade('adjacent', 'boostGeneratorGain', 0.5, { amount: 10, resource: 'green' }))
        insertCellContent(relToCoord({ row: 0, col: -1 }), makeUpgrade('row', 'boostGeneratorSpeed', 0.1, { amount: 5, resource: 'green' }))

        insertCellContent(relToCoord({ row: 0, col: 0 }), makeGenerator(1000, { amount: 1, resource: 'green' }))
        insertCellContent(relToCoord({ row: 0, col: 1 }), makeGenerator(1000, { amount: 1, resource: 'red' }, { amount: 2, resource: 'green' }))
        insertCellContent(relToCoord({ row: 0, col: 2 }), makeGeneratorDerivative('rightHalf', 'boostGeneratorGain', 0.1))
        insertCellContent(relToCoord({ row: -1, col: 3 }), makeGeneratorDerivative('adjacent', 'boostGeneratorGain', 0.1))
        insertCellContent(relToCoord({ row: 1, col: 0 }), makeGeneratorDerivative('adjacent', 'boostGeneratorSpeed', 1))

        insertCellContent(relToCoord({ row: 0, col: 3 }), makeGenerator(1000, { amount: 1, resource: 'blue' }))
        insertCellContent(relToCoord({ row: 1, col: 3 }), makeGenerator(1000, { amount: 1, resource: 'blue' }))
        insertCellContent(relToCoord({ row: 1, col: 2 }), makeGenerator(1000, { amount: 1, resource: 'blue' }))
    }

    /**
     * For easy sequential content unlocks. No randomness here.
     */
    function* createIteratorCellContent(): Generator<CellContent, void, unknown> {
        yield makeUpgrade('adjacent', 'boostGeneratorGain', 0.2, { amount: 2, resource: 'red' })
        yield makeGeneratorDerivative('3x3', 'boostGeneratorSpeed', 0.1)
        yield makeGenerator(4000, { amount: 1, resource: 'green' }, { amount: 10, resource: 'red' })
        yield makeGeneratorDerivative('row', 'boostUpgradeEffect', 0.2)
        yield makeUpgrade('3x3', 'boostDerivativeGeneratorExpGain', 2, { amount: 10, resource: 'green' }, 'multiplicative')
        yield makeGeneratorDerivative('all', 'decreaseUpgradeCost', 1)
        yield makeUpgrade('upperHalf', 'decreaseDerivativeGeneratorExpRequirement', 1, { amount: 100, resource: 'red' })
    }
    const getCellContent = createIteratorCellContent()

    /**
     * When you purchase a new cell, the logic here determines
     * which specific cell will be procedurally generated (type & properties).
     * Should not be purely randomly chosen, depends on what cells you have already.
     * This will be quite complex and make or break good gameplay.
     */
    function getNextCellContent(): CellContent | undefined {
        /* let content: CellContent */

        // probability distribution needed for type (gen, genDer, upgrade)
        // pd not static, depends on what cells you have already (and what level-up effects or prestige upgrades you have)
        // also failsafes/overrides (sometimes its impossible to get a type)

        const result = getCellContent.next()
        if (!result.done) {
            return result.value
        } else {
            return undefined
        }

        //start: generator -> pd: genDer (0.5), upgrade (0.5)
        /* if (Math.random() > 0.5) {
            return makeUpgrade('adjacent', 'boostGeneratorGain', 0.2, { amount: 10, resource: 'green' }, 10)
        } else {
            return makeGeneratorDerivative('adjacent', 'boostGeneratorGain', 0.05)
        } */

        /* const res = ['red', 'green', 'blue'] as const
        const rand = randInt(5)
        switch (rand) {
            case 0:
                content = makeGenerator(3000, { amount: 1, resource: res[randInt(2)] }, { amount: 1, resource: res[randInt(2)] })
                break
            case 1:
                content = makeCombat(10 + randInt(100))
                break
            default:
                content = { type: 'empty' }
        }

        return content */
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
                    //setCellContent(i, j)
                    /* console.log('cell is defeated and now set to inactive') */
                    cell.active = false
                    // clear out cell for now:
                    gridCell.value[i][j].content = { type: 'empty' }
                }, 400)
                clearInterval(cell.intervalId)
            }
        }, 1000)
    }

    const generatorCellsActive = $derived(
        gridCell.value.flat().filter(cell => cell.content.type === 'generator' && cell.content.active)
        /* .map(cell => cell.content as GeneratorI) */
    )
    const generatorDerivativeCellsActive = $derived(
        gridCell.value.flat().filter(cell => cell.content.type === 'generatorDerivative' && cell.content.active)
        /* .map(cell => cell.content as GeneratorDerivativeI) */
    )

    const numTotalGeneratorCellsActive = $derived(generatorCellsActive.length + generatorDerivativeCellsActive.length)

    const combatCellsActive = $derived(
        gridCell.value
            .flat()
            .filter(cell => cell.content.type === 'combat' && cell.content.active)
            .map(cell => cell.content as CombatI)
    )
    const numCombatCellsActive = $derived(combatCellsActive.length)

    let animationId: number

    $effect(() => {
        if (numTotalGeneratorCellsActive > 0) {
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
        const deltaTimeMillis = Math.max(Math.min(currentTime - lastTime), 0) * fastFowardFactor.value
        lastTime = currentTime

        // this can show me the frame rate actually
        /* console.log(deltaTimeMillis) */
        for (const cell of generatorDerivativeCellsActive) {
            const generator = cell.content as GeneratorDerivativeI
            generator.currentExp += (generator.expPerSec.current * deltaTimeMillis) / 1000
            while (generator.currentExp >= generator.requiredExp.current) {
                if (generator.cost) {
                    if (resource.value[generator.cost.resource] < generator.cost.current) {
                        generator.progress = 0
                        generator.active = false
                        break
                    }
                    resource.value[generator.cost.resource] -= generator.cost.current
                }
                generator.currentExp -= generator.requiredExp.current
                generator.requiredExp.current *= 1.15
                generator.level++

                applyCellEffects(cell)
            }
        }

        for (const cell of generatorCellsActive) {
            const generator = cell.content as GeneratorI
            generator.progress += (deltaTimeMillis / generator.baseDurationMillis) * generator.speed.current
            while (generator.progress >= 1) {
                if (generator.cost) {
                    if (resource.value[generator.cost.resource] < generator.cost.current) {
                        generator.progress = 0
                        generator.active = false
                        break
                    }
                    resource.value[generator.cost.resource] -= generator.cost.current
                }

                resource.value[generator.gain.resource] += generator.gain.current
                generator.progress -= 1
                // ensures that the progress bar will always start from 0 and not carry over some remainder:
                if (generator.progress < 1) generator.progress = 0
            }
        }

        if (numTotalGeneratorCellsActive > 0) animationId = requestAnimationFrame(evolveProgressBars)
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
        points -= numTotalGeneratorCellsActive
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

    function unlockWholeGrid(): void {
        setDeterministicCellContent()
    }
    function unlockAdditionalTest(): void {
        insertCellContent({ row: 0, col: 4 }, makeGenerator(1000, { amount: 1, resource: 'red' }))
    }

    function handleLockedCell(cell: Cell): void {
        if (cell.content.type !== 'locked') return
        if (resource.value[cell.content.resource] < cell.content.cost) return
        resource.value[cell.content.resource] -= cell.content.cost
        // dynamically set the content of the cell when you have unlocked it
        //setCellContent(cell.coord.row, cell.coord.col)
        //unhideSurroundingCells(cell.coord.row, cell.coord.col)
    }

    /**
     * Get all adjacent (surrounding) cells of the currently shown cells.
     */
    function getAdjacentCells(): Set<Cell> {
        const adjacentCells = new Set<Cell>()
        const delta: Coordinate[] = [
            { row: -1, col: 0 }, // Up
            { row: 1, col: 0 }, // Down
            { row: 0, col: -1 }, // Left
            { row: 0, col: 1 } // Right
        ]

        const shownCells = gridCell.value.flat().filter(cell => !cell.hidden)

        for (const cell of shownCells) {
            for (const d of delta) {
                const row = cell.coord.row + d.row
                const col = cell.coord.col + d.col

                // check if the neighbor is within bounds
                if (row >= 0 && col >= 0 && row < gridCell.value.length && col < gridCell.value[row].length) {
                    // check if the neighbor is hidden
                    if (gridCell.value[row][col].hidden) {
                        adjacentCells.add(gridCell.value[row][col])
                    }
                }
            }
        }

        // convert the set of cells to an array of cells
        return adjacentCells
    }

    let selectionCells: Set<Cell> = new Set()
    let nextCellContent: CellContent | undefined = $state(undefined)
    let cellSelectionActive = $state(false)

    // gets rid of the selection when hot reloading
    $effect(() => {
        return () => {
            selectionCells.forEach(cell => (cell.hidden = true))
        }
    })

    function handleGetCell(item: CellShopItem): void {
        if (selectionCells.size !== 0) return
        if (cellSelectionActive) return
        if (resource.value[item.cost.resource] < item.cost.current) return

        nextCellContent = getNextCellContent()
        if (!isDefined(nextCellContent)) {
            console.log('Error: Undefined cell content.')
            return
        }
        // purchasing logic:
        resource.value[item.cost.resource] -= item.cost.current
        item.cost.current *= item.costMultiplier
        item.count++

        // unhide all surrounding cells and fade em in
        selectionCells = getAdjacentCells()
        cellSelectionActive = true
        for (const cell of selectionCells) {
            cell.hidden = false
        }
    }

    function handleSelectCell(cell: Cell): void {
        if (!isDefined(nextCellContent)) return
        insertCellContent(cell.coord, nextCellContent)
        nextCellContent = undefined

        selectionCells.delete(cell)
        // hide the other selection cells
        selectionCells.forEach(cell => (cell.hidden = true))
        selectionCells.clear()
        setTimeout(() => {
            cellSelectionActive = false
        }, 1500)
    }

    import { crossfade } from 'svelte/transition'
    import CellTooltip from '$lib/components/tooltips/CellTooltip.svelte'
    export const [send, receive] = crossfade({
        duration: 1500,
        easing: quartOut
    })
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

{#snippet lockedCell(cell: Cell)}
    {@const content = cell.content as LockedI}
    {@const tooltipText = `This tile is currently locked. ${content.cost !== 0 ? `<br> Requirement: ${content.cost} ${square[content.resource]}` : ''} <br> <span style="color: var(--text-medium-emphasis)">Click to unlock.</span>`}

    <button
        class="full"
        class:disabled={resource.value[content.resource] < content.cost}
        onclick={() => handleLockedCell(cell)}
        style="display: flex; flex-direction:column; justify-content: center; gap: 0.25rem;"
        use:tooltip={() => ({ data: tooltipText })}>
        <span style="font-size: 0.875rem">&#128274;</span>
        {#if content.cost !== 0}
            <span>{formatWhole(content.cost)} {@html square[content.resource]}</span>
        {/if}
    </button>
{/snippet}

{#snippet generatorCell(generator: GeneratorI, disabledClick = false)}
    <button
        class="full"
        class:disabledClick
        onclick={() => {
            if (disabledClick) return
            if (!generator.active && actionPoints <= 0) return
            generator.active = !generator.active
        }}
        style="display: flex; flex-direction:column; justify-content: center; gap: 0.25rem; {generator.active
            ? `background: ${colors(0.2)[generator.gain.resource]}`
            : ''}"
        use:tooltip={() => ({
            data: generator,
            Component: CellTooltip
        })}>
        <span style="font-size: 1.5rem; display: flex; gap: 0.5rem; justify-content: center;">
            &#120126; {@html square[generator.gain.resource]}
        </span>
        {#if generator.active}
            <ProgBar
                --widthProgBar="100%"
                --heightProgBar="0.5rem"
                --barColor={colors(0.6)[generator.gain.resource]}
                --progBarBgColor="var(--dp24)"
                --progress="{generator.progress * 100}%">
            </ProgBar>
        {/if}
    </button>
{/snippet}

{#snippet generatorDerivativeCell(generator: GeneratorDerivativeI, disabledClick = false)}
    <button
        class="full"
        class:disabledClick
        onclick={() => {
            if (disabledClick) return
            if (!generator.active && actionPoints <= 0) return
            generator.active = !generator.active
        }}
        style="display: flex; flex-direction:column; justify-content: center; gap: 0.25rem; {generator.active ? `background: rgba(255,255,255,0.3)` : ''}"
        use:tooltip={() => ({
            data: generator,
            Component: CellTooltip
        })}>
        <span style="font-size: 1.5rem; display: flex; gap: 0.5rem; justify-content: center;">
            &#120126;
            <span>
                {#if generator.effect.type === 'boostGeneratorGain'}
                    {@html unicodeChars.upwardsPairedArrows}
                {:else if generator.effect.type === 'boostGeneratorSpeed'}
                    {@html unicodeChars.clockwiseGappedCircleArrow}
                {/if}
            </span>
        </span>
        {#if generator.active}
            <ProgBar
                --widthProgBar="100%"
                --heightProgBar="0.5rem"
                --barColor="white"
                --progBarBgColor="var(--dp24)"
                --progress="{(generator.currentExp / generator.requiredExp.current) * 100}%">
            </ProgBar>
        {/if}
    </button>
{/snippet}

{#snippet upgradeCell(cellGeneric: Cell, disabledClick = false)}
    {#if cellGeneric.content.type === 'upgrade'}
        {@const cell = cellGeneric as Cell & { content: UpgradeI }}
        <UpgradeCellComponent {cell} {disabledClick} class="full">
            <div class="flexCenter flexColumn">
                <span style="font-size: 1.5rem; display: flex; gap: 0.5rem; justify-content: center;"> &#120140; </span>
                {#if cell.content.maxBuy}
                    ({cell.content.count}/{cell.content.maxBuy})
                {:else}
                    ({cell.content.count})
                {/if}
            </div>
        </UpgradeCellComponent>
    {/if}
{/snippet}

{#snippet combatCell(i: number, j: number, cell: CombatI)}
    <button
        style="width: 100%; height: 100%; outline: none; position: relative; display: flex; flex-direction:column; justify-content: center; gap: 0.25rem; {cell.active
            ? 'background: rgba(255,0,0,0.2);'
            : ''}"
        onclick={() => handleCombatCellClicked(i, j, cell)}
        use:tooltip={() => ({
            data: 'Combat Tile <hr> <span style="color: var(--text-medium-emphasis)">Use 1 AP while attacking.</span> <br> <span style="color: var(--text-medium-emphasis)">Click to attack this tile.</span>'
        })}>
        <span>
            {formatWhole(cell.HP)}
            <span style="color: #D50000">&#10084;</span>
        </span>

        {#if cell.active}
            <ProgBar --widthProgBar="100%" --heightProgBar="0.5rem" --barColor="red" --progBarBgColor="var(--dp24)" --progress="{cell.progress.current}%">
            </ProgBar>
        {/if}
    </button>
{/snippet}

<div id="display">
    <div id="game" use:movable>
        <div class="grid">
            {#each gridCell.value as row, i}
                {#each row as cell, j}
                    <div>
                        {#if !cell.hidden || LORCA_OVERRIDE.value}
                            <div
                                class="cell full"
                                in:scale={{ delay: 400, duration: 1200, easing: elasticOut, start: 0.7 }}
                                out:fade={{ duration: 400, easing: quartOut }}>
                                {#if cell.content.type === 'locked' && !LORCA_OVERRIDE.value}
                                    {@render lockedCell(cell)}
                                {:else if cell.content.type === 'combat'}
                                    {@render combatCell(i, j, cell.content)}
                                {:else if cell.content.type === 'generator'}
                                    <div class="full" in:receive={{ key: 'cool' }}>
                                        {@render generatorCell(cell.content)}
                                    </div>
                                {:else if cell.content.type === 'generatorDerivative'}
                                    <div class="full" in:receive={{ key: 'cool' }}>
                                        {@render generatorDerivativeCell(cell.content)}
                                    </div>
                                {:else if cell.content.type === 'upgrade'}
                                    <div class="full" in:receive={{ key: 'cool' }}>
                                        {@render upgradeCell(cell)}
                                    </div>
                                {:else}
                                    <button
                                        class="cell-empty"
                                        onclick={() => handleSelectCell(cell)}
                                        use:tooltip={() => ({
                                            data: '<span style="color: var(--text-medium-emphasis)">Click to insert the new cell here.</span>'
                                        })}>
                                        <span style="font-size: 1.5rem; color: rgba(0,0,0,0.8);"> + </span>
                                    </button>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}
            {/each}
        </div>
    </div>
</div>

<div style="position: absolute; top: 60px; left: 50%; transform: translateX(-50%);">
    <div class="stats">
        <div style="background: var(--dp01); padding: 0.5rem;">
            {formatNumber(resource.value.red, 2)}
            {@html square.red}, {formatNumber(resource.value.green, 2)}
            {@html square.green}, {formatNumber(resource.value.blue, 2)}
            {@html square.blue}, Attack: {formatNumber(derivedGrid.attack, 2)}, AP: {actionPoints}/{maxActionPoints}
            <br />
            Level: {level.value}
            ({derivedGrid.expInLevel} / {derivedGrid.expToNextLevel} XP)
            <button onclick={handleLevelUp}>Level Up</button> Auto?
        </div>
    </div>
</div>

<div
    style="position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); background-color: var(--background-color); border: 1px solid var(--dp08);">
    <div style="background: var(--dp01); padding: 0.5rem; display: flex; gap: 0.5rem;">
        <div>
            <div style="text-align: center; margin-bottom: 0.25rem;">Preview</div>
            <div style="width: var(--cell-size); height: var(--cell-size);">
                {#if nextCellContent}
                    <div
                        style="position:absolute; width: var(--cell-size); height: var(--cell-size); background: var(--background-color);"
                        in:fly={{ duration: 1000, easing: bounceOut, y: -40, opacity: 1 }}
                        out:send={{ key: 'cool' }}>
                        {#if nextCellContent.type === 'generator'}
                            {@render generatorCell(nextCellContent, true)}
                        {:else if nextCellContent.type === 'generatorDerivative'}
                            {@render generatorDerivativeCell(nextCellContent, true)}
                        {:else if nextCellContent.type === 'upgrade'}
                            {@const cell = {
                                id: 'fake',
                                coord: { row: 0, col: 0 },
                                hidden: false,
                                content: nextCellContent,
                                dependencies: [],
                                relX: 0,
                                relY: 0
                            }}
                            {@render upgradeCell(cell, true)}
                        {/if}
                    </div>
                {/if}
                <div
                    class="cell-empty"
                    use:tooltip={() => ({
                        data: 'When you buy a new cell, it will be previewed here. <br> What you get is random, however you can choose <br> where to insert the cell.'
                    })}>
                    <span style="font-size: 1.5rem; color: rgba(0,0,0,0.8);">?</span>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-direction: column; justify-content: space-between;">
            <div
                class="flexCenter"
                style="flex-grow:1; font-weight: bold; font-size: .875rem; background: var(--dp01); border: 1px solid var(--dp08); position: relative;">
                The Cell Shop
                <span
                    style="background: var(--dp24); width: 1rem; aspect-ratio: 1; padding: 0.125rem; position: absolute; right: 4px; top: 4px; font-weight: bold; font-size: .875rem; display: flex; justify-content: center; border-radius: 100%"
                    use:tooltip={() => ({
                        data: 'Here you can buy new cells to add to the grid. <br> There are multiple purchasing options below. <br> Each cost scales independently.'
                    })}>
                    ?
                </span>
            </div>
            <div style="height: 60px; display: flex; gap: 0.5rem; flex-direction: row;">
                {#each cellShopItems.value as item}
                    <button
                        style="width: 60px; display: flex; flex-direction: column; justify-content: center"
                        class:disabled={resource.value[item.cost.resource] < item.cost.current || cellSelectionActive}
                        onclick={() => handleGetCell(item)}
                        use:tooltip={() => ({
                            data: `Cost: ${formatWhole(item.cost.current)} ${square[item.cost.resource]} <br> <span style="color: var(--text-medium-emphasis);">Click to get a random cell.</span>`
                        })}>
                        {formatWhole(item.cost.current)}
                        <span style="font-size: 1rem;">{@html square[item.cost.resource]}</span>
                    </button>
                {/each}
            </div>
        </div>
    </div>
</div>
<div style="position: absolute; top: 0; left: 0; display: flex;">
    <button
        onclick={() => {
            selectionCells.clear()
            populateCells()
        }}>
        Reset Grid
    </button>
    <button onclick={() => unlockWholeGrid()}> Unlock whole grid </button>
    <button onclick={() => unlockAdditionalTest()}> Unlock new cell </button>
</div>

<style>
    * {
        --cell-size: 80px;
    }
    #display {
        z-index: -1;
        position: fixed;
        width: 100vw;
        height: 100vh;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
    }
    #game {
        position: absolute; /** also resets positioning of child elements just like relative! */
        transform: translateZ(0);
    }
    .stats {
        background-color: var(--background-color);
        border: 1px solid var(--dp08);
        width: 400px;
        /*  margin-top: 40px; */
    }
    .grid {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(9, var(--cell-size));
        grid-template-rows: repeat(9, var(--cell-size));
    }
    .cell {
        background: var(--background-color);
    }
    .cell-preview {
        width: var(--cell-size);
        height: var(--cell-size);
    }

    .cell-empty {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--text-medium-emphasis);
        border: 1px solid var(--dp08);
        box-sizing: border-box;
        box-shadow: inset 0 0 8px 4px rgba(0, 0, 0, 0.6);
        outline: 1px solid black;

        border-left: rgba(255, 255, 255, 0.2);
        border-right: rgba(0, 0, 0, 0.4);
        border-top: rgba(255, 255, 255, 0.2);
        border-bottom: rgba(0, 0, 0, 0.4);
        border-width: 1px;
        border-radius: 0px;
        border-style: solid;
    }
</style>
