import { gridCell, type Stencil, type Coordinate, type Metric, type Cell, type EffectType } from '$lib/store'

/**
 * If a coord is out of bounds, returns undefined instead of a cell.
 */
function getCellAtCoord(coord: Coordinate): Cell | undefined {
    if (coord.row < 0 || coord.row >= gridCell.value.length) return undefined
    if (coord.col < 0 || coord.col >= gridCell.value[coord.row].length) return undefined
    return gridCell.value[coord.row][coord.col]
}
/**
 *  Type guard to inform TypeScript that the result will no longer include undefined
 */
const isDefined = <T>(value: T | undefined): value is T => typeof value !== 'undefined'

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
 */
function updateAffectedCell(metric: Metric, value: number, id: string): void {
    // find the multiplier corresponding to the id from the cell which causes it
    const mult = metric.multipliers.find(mult => mult.id === id)

    // update the multiplier corresponding to the id
    if (!mult) metric.multipliers.push({ id, value: 1 + value })
    else mult.value += value

    // update the current value of the metric
    const totalMult = metric.multipliers.reduce((acc, mult) => mult.value * acc, 1)
    metric.current = metric.base * totalMult
}

export function boostGeneratorGain(cell: Cell, value: number, id: string): void {
    if (cell.content.type !== 'generator') return
    updateAffectedCell(cell.content.gain, value, id)
}
function boostGeneratorSpeed(cell: Cell, value: number, id: string): void {
    if (cell.content.type !== 'generator') return
    updateAffectedCell(cell.content.speed, value, id)
}
function boostDerivativeGeneratorExpGain(cell: Cell, value: number, id: string): void {
    if (cell.content.type !== 'generatorDerivative') return
    updateAffectedCell(cell.content.expPerSec, value, id)
}
function decreaseDerivativeGeneratorExpRequirement(cell: Cell, value: number, id: string): void {
    if (cell.content.type !== 'generatorDerivative') return
    updateAffectedCell(cell.content.requiredExp, value, id)
}
function decreaseUpgradeCost(cell: Cell, value: number, id: string): void {
    if (cell.content.type !== 'upgrade') return
    updateAffectedCell(cell.content.cost, value, id)
}
function boostUpgradeEffect(cell: Cell, value: number, id: string): void {
    if (cell.content.type !== 'upgrade') return
    updateAffectedCell(cell.content.effect.value, value, id)
}
function increaseAreaOfEffect(cell: Cell, value: number, id: string): void {
    const content = cell.content
    if (content.type !== 'upgrade' && content.type !== 'generatorDerivative') return
    if (content.effect.stencil === '3x3') content.effect.stencil = '5x5'
    // TODO: propagate the effects of the affected cells to their targets
    const affectedCells = getAllAffectedCells(cell.coord, content.effect.stencil)
    for (const targetCell of affectedCells) {
        applyEffect[content.effect.type](targetCell, content.effect.value.current, id)
    }
}

export const applyEffect: Record<EffectType, (cell: Cell, value: number, id: string) => void> = {
    boostGeneratorGain,
    boostGeneratorSpeed,
    boostDerivativeGeneratorExpGain,
    decreaseDerivativeGeneratorExpRequirement,
    decreaseUpgradeCost,
    boostUpgradeEffect,
    increaseAreaOfEffect
}

/**
 * Apply a cell's effect on its affected cells.
 * @param cell The cell to process.
 * @param times How many times to apply the effect.
 * @returns
 */
export function applyCellEffects(parentCell: Cell, times = 1): void {
    const content = parentCell.content
    if (content.type !== 'upgrade' && content.type !== 'generatorDerivative') return

    // get affected cells via the stencil
    const affectedCells = getAllAffectedCells(parentCell.coord, content.effect.stencil)
    // apply the corresponding effect onto all affected cells
    for (const cell of affectedCells) {
        applyEffect[content.effect.type](cell, content.effect.value.current * times, parentCell.id)
    }
}
