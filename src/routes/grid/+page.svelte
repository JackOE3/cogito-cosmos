<script lang="ts">
    import AutoButton from '$lib/components/AutoButton.svelte'
    import ProgBar from '$lib/components/misc/ProgBar.svelte'
    import { tooltip } from '$lib/components/tooltips/tooltip.svelte'
    import UpgradeButton from '$lib/components/UpgradeButton.svelte'
    import UpgradeButtonUnstyled from '$lib/components/UpgradeButtonUnstyled.svelte'
    import { formatNumber, formatResourceName } from '$lib/gamelogic/utils'
    import { derivedState, fastFowardFactor, resource, upgradeCost, upgradeCount, upgrades, type UpgradeName } from '$lib/store'
    import type { Snippet } from 'svelte'
    import { cubicOut, quartIn, quartOut } from 'svelte/easing'
    import { fade, fly } from 'svelte/transition'
    import { Tween } from 'svelte/motion'

    type Cell = {
        id: number
        HP: number
        maxHP: number
        progress: Tween<number>
        hidden: boolean
        defeated: boolean
        content?: Snippet
        upgrade?: UpgradeName
        relX: number
        relY: number
    }

    const rows = 9
    const cols = 9
    const gridCell: Cell[][] = $state(Array.from({ length: rows }, () => new Array(cols).fill(0)))

    const center = Math.floor(rows / 2)

    function distanceFromCenter(i: number, j: number): number {
        return Math.sqrt((i - center) ** 2 + (j - center) ** 2)
    }

    function getCellHP(i: number, j: number): number {
        const max = 100
        const min = 10
        const random = Math.floor(Math.random() * (max + 1 - min) + min)
        return Math.pow(2, distanceFromCenter(i, j) ** 2)
    }

    function populateCells(): void {
        let _id = 0
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < rows; j++) {
                const maxHP = getCellHP(i, j)
                gridCell[i][j] = {
                    id: _id++,
                    HP: maxHP,
                    maxHP: maxHP,
                    progress: new Tween(100, {
                        duration: 400,
                        easing: cubicOut
                    }),
                    hidden: true,
                    defeated: false,
                    relX: 0,
                    relY: 0
                }
            }
        }
        gridCell[center][center].hidden = false
        gridCell[center][center].HP = 1
        gridCell[center][center].maxHP = 1
        gridCell[center][center].content = gainGold

        gridCell[center][center + 1].upgrade = 'increaseDamage'
        gridCell[center + 1][center].upgrade = 'increaseGoldGain'
        gridCell[center + 2][center].upgrade = 'increaseGoldSpeed'
    }

    populateCells()

    function unhideSurroundingCells(i: number, j: number) {
        if (i + 1 < gridCell.length) {
            gridCell[i + 1][j].hidden = false
            gridCell[i + 1][j].relY = 1
        }
        if (i - 1 >= 0) {
            gridCell[i - 1][j].hidden = false
            gridCell[i - 1][j].relY = -1
        }
        if (j + 1 < gridCell[i].length) {
            gridCell[i][j + 1].hidden = false
            gridCell[i][j + 1].relX = 1
        }
        if (j - 1 >= 0) {
            gridCell[i][j - 1].hidden = false
            gridCell[i][j - 1].relX = -1
        }

        // BLOCK TRANSLATION ON ANIMATION WITH THESE CONDITIONS:
        // is a cell 2 down already unhidden? (would overlap the animation)
        if (i + 2 < gridCell[i].length && !gridCell[i + 2][j].hidden) {
            gridCell[i + 1][j].relY = 0
        }
        // is a cell 2 up already unhidden?
        if (i - 2 >= 0 && !gridCell[i - 2][j].hidden) {
            gridCell[i - 1][j].relY = 0
        }
        // is a cell 2 right already unhidden?
        if (j + 2 < gridCell[i].length && !gridCell[i][j + 2].hidden) {
            gridCell[i][j + 1].relX = 0
        }
        // is a cell 2 left already unhidden?
        if (j - 2 >= 0 && !gridCell[i][j - 2].hidden) {
            gridCell[i][j - 1].relX = 0
        }
    }

    let activeCellId = $state(-1)
    /* $inspect(activeCellId) */
    let damageInterval: number
    function handleGridCellClicked(i: number, j: number, id: number) {
        if (id === activeCellId) {
            console.log('cell is already active')
            activeCellId = -1
            clearInterval(damageInterval)
            return
        }
        // no active cell and no action points available
        if (activeCellId === -1 && actionPoints <= 0) {
            clearInterval(damageInterval)
            return
        }
        //console.log('clicked at', i, j)
        activeCellId = id
        const cell = gridCell[i][j]

        if (cell.HP >= 0) cell.progress.target = (cell.HP / cell.maxHP) * 100

        clearInterval(damageInterval)
        damageInterval = setInterval(() => {
            cell.HP -= derivedState.damagePerSec
            cell.progress.target = (cell.HP / cell.maxHP) * 100

            if (cell.HP <= 0.1) {
                cell.HP = 0
                setTimeout(() => {
                    cell.defeated = true
                    console.log('cell is defeated and now set to inactive')
                    activeCellId = -1
                    unhideSurroundingCells(i, j)
                }, 400)
                clearInterval(damageInterval)
            }
        }, 1000)
    }

    let goldGenerationActive = $state(false)
    let goldBarProgress = $state(0)

    let goldAnimation: number

    $effect(() => {
        if (goldGenerationActive) {
            lastTime = null
            goldAnimation = requestAnimationFrame(animateGoldBar)
        }
        /**
         * You can return a function from $effect, which will run
         * immediately before the effect re-runs, and before it is destroyed.
         */
        return () => {
            cancelAnimationFrame(goldAnimation)
        }
    })

    let lastTime: number | null = null
    function animateGoldBar(currentTime: number): void {
        if (lastTime === null) lastTime = currentTime
        const deltaTimeMillis = Math.max(Math.min(currentTime - lastTime), 0)
        lastTime = currentTime
        // the value of cheeseBarProgress is fed to CSSs
        goldBarProgress += (deltaTimeMillis / derivedState.goldDurationMillis) * fastFowardFactor.value

        while (goldBarProgress >= 1) {
            /* console.log('gold++') */
            resource.value.gold += derivedState.goldYield
            goldBarProgress -= 1
            // ensures that the progress bar will always start from 0 and not carry over some remainder:
            if (goldBarProgress < 1) goldBarProgress = 0
        }
        if (goldGenerationActive) requestAnimationFrame(animateGoldBar)
    }

    let maxActionPoints = $state(1)

    let actionPoints = $derived.by(() => {
        let points = maxActionPoints
        if (goldGenerationActive) points--
        if (activeCellId >= 0) points--
        return points
    })
</script>

{#snippet gainGold()}
    <button
        class="full"
        onclick={() => {
            if (!goldGenerationActive && actionPoints <= 0) return
            goldGenerationActive = !goldGenerationActive
        }}
        style="display: flex; flex-direction:column; justify-content: center; gap: 0.25rem; {goldGenerationActive ? 'background: rgba(255,215,0, 0.2)' : ''}"
        use:tooltip={{
            data: `Farm some good ol' gold. <br> +${derivedState.goldYield} gold every ${formatNumber(derivedState.goldDurationMillis / 1000, 2)}s <br> Uses 1 AP while active.`
        }}>
        <span>Farm Gold</span>
        <ProgBar --widthProgBar="100%" --heightProgBar="0.5rem" --barColor="gold" --progBarBgColor="var(--dp24)" --progress="{goldBarProgress * 100}%">
        </ProgBar>
    </button>
{/snippet}

{#snippet upgradeButton(upgradeName: UpgradeName)}
    <UpgradeButtonUnstyled
        {upgradeName}
        tooltipText="{upgrades[upgradeName].description.join('<br>')} <br> Cost: {formatNumber(upgradeCost.value[upgradeName], 2)} {upgrades[upgradeName]
            .resource}"
        class="full">
        {upgrades[upgradeName].title}
        ({upgradeCount.value[upgradeName]})
    </UpgradeButtonUnstyled>
{/snippet}

<div style="display: flex; flex-direction:column; gap: 1.5rem; justify-content: center; align-items: center; margin-top: 100px;">
    <div class="stats">
        DPS: {derivedState.damagePerSec}, Gold: {formatNumber(resource.value.gold, 2)}, AP: {actionPoints}/{maxActionPoints}
    </div>
    <div class="grid">
        {#each gridCell as row, i}
            {#each row as cell, j}
                <div>
                    {#if !cell.hidden}
                        <div class="full" in:fly={{ duration: 1000, x: cell.relX * 40, y: cell.relY * 40, easing: quartOut }}>
                            {#if !cell.defeated}
                                <AutoButton
                                    style="width: 100%; height: 100%; outline: none; position: relative; display: flex; flex-direction:column; justify-content: center; gap: 0.25rem; {cell.id ===
                                    activeCellId
                                        ? 'background: rgba(255,0,0,0.2);'
                                        : ''}"
                                    onclick={() => handleGridCellClicked(i, j, cell.id)}
                                    disabled={cell.hidden}>
                                    {formatNumber(cell.HP, 2)}
                                    <!-- <br />
                                    ({i}, {j}) -->
                                    {#if cell.id === activeCellId}
                                        <ProgBar
                                            --widthProgBar="100%"
                                            --heightProgBar="0.5rem"
                                            --barColor="red"
                                            --progBarBgColor="var(--dp24)"
                                            --progress="{cell.progress.current}%">
                                        </ProgBar>
                                    {/if}
                                </AutoButton>
                            {:else if cell.content}
                                {@render cell.content()}
                            {:else if cell.upgrade}
                                {@render upgradeButton(cell.upgrade)}
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
