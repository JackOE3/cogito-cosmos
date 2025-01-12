import { gridCell, type Stencil, type Coordinate, type Metric, type Cell, type EffectType, type CellEffect, type CellContent, type Formula } from '$lib/store'
import { formatNumber, formatWhole, isDefined } from './utils'

/**
 * If a coord is out of bounds, returns undefined instead of a cell.
 */
function getCellAtCoord(coord: Coordinate): Cell | undefined {
    if (coord.row < 0 || coord.row >= gridCell.value.length) return undefined
    if (coord.col < 0 || coord.col >= gridCell.value[coord.row].length) return undefined
    return gridCell.value[coord.row][coord.col]
}

/**
 * Applies the stencil centered on the current cell to get an array of all affected cells.
 * @param coord coordinate of the current cell
 * @param stencil what type of stencil is applied
 * @returns an array of all affected cells
 */
export function getAllAffectedCells(coord: Coordinate, stencil: Stencil): Cell[] {
    const row = coord.row
    const col = coord.col
    switch (stencil) {
        case 'adjacent': {
            const coords = [
                [0, -1], // Left
                [0, 1], // Right
                [-1, 0], // Up
                [1, 0] // Down
            ]
            return coords.map(([dx, dy]) => getCellAtCoord({ row: row + dx, col: col + dy })).filter(isDefined)
        }
        case '3x3': {
            const coords = [
                [0, -1],
                [0, 1], // Left, Right
                [-1, -1],
                [-1, 0],
                [-1, 1], // Top-left, Top, Top-right
                [1, -1],
                [1, 0],
                [1, 1] // Bottom-left, Bottom, Bottom-right
            ]
            return coords.map(([dx, dy]) => getCellAtCoord({ row: row + dx, col: col + dy })).filter(isDefined)
        }
        case '5x5': {
            const coords = []
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (dx !== 0 || dy !== 0) {
                        // Exclude the center cell
                        coords.push([dx, dy])
                    }
                }
            }
            return coords.map(([dx, dy]) => getCellAtCoord({ row: row + dx, col: col + dy })).filter(isDefined)
        }
        case 'row': {
            // Extract all cells in the specified row
            return gridCell.value[row]
        }
        case 'column': {
            // Extract all cells in the specified column
            return gridCell.value.map(row => row[col])
        }
        case 'diagonals': {
            // = like a bishop moves in chess

            const directions = [
                [-1, -1], // Top-left
                [-1, 1], // Top-right
                [1, -1], // Bottom-left
                [1, 1] // Bottom-right
            ]
            const crossCells = []
            for (const [dx, dy] of directions) {
                let rowIdx = row + dx
                let colIdx = col + dy

                // Continue moving in the direction until out of bounds
                while (rowIdx >= 0 && rowIdx < gridCell.value.length && colIdx >= 0 && colIdx < gridCell.value[rowIdx].length) {
                    crossCells.push(gridCell.value[rowIdx][colIdx])
                    rowIdx += dx
                    colIdx += dy
                }
            }

            return crossCells
        }
        case 'upperHalf': {
            return gridCell.value
                .slice(0, row) // does not include row
                .flat()
        }
        case 'lowerHalf': {
            return gridCell.value
                .slice(row + 1) // does not include row
                .flat()
        }
        case 'leftHalf': {
            const lefty = gridCell.value.map(row => row.slice(0, col))
            return lefty.flat()
        }
        case 'rightHalf': {
            const righty = gridCell.value.map(row => row.slice(col + 1))
            return righty.flat()
        }
        case 'all': {
            return gridCell.value.flat()
        }
        default:
            return []
    }
}

/**
 *  Updates the affected metric of the target.
 * @returns whether the value of the metric did change
 */
function updateAffectedCell(metric: Metric, effect: CellEffect, id: string): boolean {
    // find the multiplier corresponding to the id from the cell which causes it
    const mult = metric.multipliers.find(mult => mult.id === id)

    let value
    if (isDefined(effect.value.currentCumulative)) {
        value = effect.value.currentCumulative
    } else value = effect.value.current

    // eg. +20% = 0.2 -> 1.2 when you multiply
    if (effect.formula === 'additive') value += 1

    // update the multiplier corresponding to the id
    if (!mult) metric.multipliers.push({ id, value })
    else mult.value = value

    // update the current value of the metric
    const totalMult = metric.multipliers.reduce((acc, mult) => mult.value * acc, 1)
    const last = metric.current
    metric.current = metric.base * totalMult
    if (metric.current !== last) return true
    else return false
}

export function boostGeneratorGain(cell: Cell, effect: CellEffect, id: string): boolean {
    if (cell.content.type !== 'generator') return false
    return updateAffectedCell(cell.content.gain, effect, id)
}
function boostGeneratorSpeed(cell: Cell, effect: CellEffect, id: string): boolean {
    if (cell.content.type !== 'generator') return false
    return updateAffectedCell(cell.content.speed, effect, id)
}
function boostDerivativeGeneratorExpGain(cell: Cell, effect: CellEffect, id: string): boolean {
    if (cell.content.type !== 'generatorDerivative') return false
    return updateAffectedCell(cell.content.expPerSec, effect, id)
}
function decreaseDerivativeGeneratorExpRequirement(cell: Cell, effect: CellEffect, id: string): boolean {
    if (cell.content.type !== 'generatorDerivative') return false
    return updateAffectedCell(cell.content.requiredExp, effect, id)
}
function decreaseUpgradeCost(cell: Cell, effect: CellEffect, id: string): boolean {
    if (cell.content.type !== 'upgrade') return false
    return updateAffectedCell(cell.content.cost, effect, id)
}
function boostUpgradeEffect(cell: Cell, effect: CellEffect, id: string): boolean {
    if (cell.content.type !== 'upgrade') return false
    return updateAffectedCell(cell.content.effect.value, effect, id)
}
function increaseAreaOfEffect(cell: Cell, effect: CellEffect, id: string): boolean {
    const content = cell.content
    if (content.type !== 'upgrade' && content.type !== 'generatorDerivative') return false
    if (content.effect.stencil === '3x3') content.effect.stencil = '5x5'
    // TODO: propagate the effects of the affected cells to their targets
    const affectedCells = getAllAffectedCells(cell.coord, content.effect.stencil)
    let changedSomething = false
    for (const targetCell of affectedCells) {
        const applied = applyEffect[content.effect.type](targetCell, content.effect, id)
        if (applied) changedSomething = true
    }
    return changedSomething
}

/**
 * @returns Whether any effects were actually applied. Only returns true of the target value actually changed.
 */
export const applyEffect: Record<EffectType, (cell: Cell, effect: CellEffect, id: string) => boolean> = {
    boostGeneratorGain,
    boostGeneratorSpeed,
    boostDerivativeGeneratorExpGain,
    decreaseDerivativeGeneratorExpRequirement,
    decreaseUpgradeCost,
    boostUpgradeEffect,
    increaseAreaOfEffect
}

/**
 * Should return identity if multiplicity === 1.
 */
const formulaDict: Record<Formula, (value: number, multiplicity: number) => number> = {
    additive: (value, multiplicity) => value * multiplicity,
    multiplicative: (value, multiplicity) => Math.pow(value, multiplicity)
}

/**
 * Updates the currentCumulative effect value of the cell. This is required for upgrades or derivative generators where the effect value depends on their quantities (count/level).
 */
function updateEffectValue(content: CellContent): void {
    if (!('effect' in content)) return
    if (!isDefined(content.effect.value.currentCumulative)) return

    let multiplicity = 1
    if ('level' in content) multiplicity = content.level
    else if ('count' in content) multiplicity = content.count
    //content.effect.value.currentCumulative = content.effect.value.current * multiplicity
    //console.log(content.effect.value.current, multiplicity)
    content.effect.value.currentCumulative = formulaDict[content.effect.formula](content.effect.value.current, multiplicity)
}
/**
 * Apply a cell's effect on its target cells.
 * @param cell The cell to process.
 * @param times How many times to apply the effect.
 */
export function applyCellEffects(parentCell: Cell): void {
    if (!('effect' in parentCell.content)) return
    updateEffectValue(parentCell.content)

    // get affected cells via the stencil
    const affectedCells = getAllAffectedCells(parentCell.coord, parentCell.content.effect.stencil)
    // apply the corresponding effect onto all affected cells
    for (const cell of affectedCells) {
        const applied = applyEffect[parentCell.content.effect.type](cell, parentCell.content.effect, parentCell.id)
        if (!applied) continue

        //console.log($state.snapshot(cell.content))
        // recursive logic for propagating effects, eg. if an effect changes an effect.value of the target cell
        applyCellEffects(cell) // scary af, lets just hope for the best.
    }
}

export function getEffectDescription(content: CellContent): string {
    if (!('effect' in content)) return 'No Effect found.'
    const val = formatWhole(content.effect.value.current * 100)
    let perThing = ''
    if (content.type === 'upgrade') perThing = ' per upgrade'
    else if (content.type === 'generatorDerivative') perThing = ' per level'

    const descriptionDict: Record<EffectType, string> = {
        boostGeneratorGain: `Boost the gain of basic generators by ${val}%${perThing}.`,
        boostGeneratorSpeed: `Boost the speed of basic generators by ${val}%${perThing}.`,
        boostDerivativeGeneratorExpGain: `Boost the XP gain of derivative generators by ${val}% per level.`,
        decreaseDerivativeGeneratorExpRequirement: `Decrease the XP requirement to level up derivative generators by ${val}% per level.`,
        decreaseUpgradeCost: `Decrease the cost of upgrades by ${val}% per level.`,
        boostUpgradeEffect: `Increase the potency of upgrades by ${val}% per level.`,
        increaseAreaOfEffect: `Increase the area of effect of other upgrades and derivative generators.`
    }
    return descriptionDict[content.effect.type]
}

export function getTotalEffectValue(effect: CellEffect): string {
    if (!isDefined(effect.value.currentCumulative)) return 'currentCumulative not defined'
    if (effect.formula === 'additive') return formatNumber(1 + effect.value.currentCumulative, 2)
    else if (effect.formula === 'multiplicative') return formatNumber(effect.value.currentCumulative, 2)
    return 'Unknown formula'
}
