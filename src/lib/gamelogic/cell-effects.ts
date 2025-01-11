import { gridCell, type CellContent, type DerivativeEffect, type Multiplier, type Stencil, type Coordinate } from '$lib/store'

function getAffectedCells(coord: Coordinate, stencil: Stencil): CellContent[] {
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
            return coords.map(([dx, dy]) => gridCell.value[row + dx][col + dy].content)
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
            return coords.map(([dx, dy]) => gridCell.value[row + dx][col + dy].content)
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
            return coords.map(([dx, dy]) => gridCell.value[row + dx][col + dy].content)
        }
        case 'row': {
            // Extract all cells in the specified row
            return gridCell.value[row].map(cell => cell.content)
        }
        case 'column': {
            // Extract all cells in the specified column
            return gridCell.value.map(row => row[col].content)
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
                    crossCells.push(gridCell.value[rowIdx][colIdx].content)
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
                .map(cell => cell.content)
        }
        case 'lowerHalf': {
            return gridCell.value
                .slice(row + 1) // does not include row
                .flat()
                .map(cell => cell.content)
        }
        case 'leftHalf': {
            const lefty = gridCell.value.map(row => row.slice(0, col))
            return lefty.flat().map(cell => cell.content)
        }
        case 'rightHalf': {
            const righty = gridCell.value.map(row => row.slice(col + 1))
            return righty.flat().map(cell => cell.content)
        }
        case 'all': {
            return gridCell.value.flat().map(cell => cell.content)
        }
        default:
            return []
    }
}

const getTotalMult = (mults: Multiplier[]) => mults.reduce((acc, mult) => mult.value * acc, 1)

function boostGeneratorGain(cell: CellContent, value: number, id: string): void {
    if (cell.type !== 'generator') return
    // find the multiplier corresponding to the id from the cell which causes it
    const mult = cell.gain.multipliers.find(mult => mult.id === id)
    if (!mult) cell.gain.multipliers.push({ id, value: 1 + value })
    else mult.value += value

    // update the currently boosted value of the target
    const gainMult = getTotalMult(cell.gain.multipliers)
    cell.gain.current = cell.gain.base * gainMult
}
function boostGeneratorSpeed(cell: CellContent, value: number, id: string): void {
    if (cell.type !== 'generator') return
    // find the multiplier corresponding to the id from the cell which causes it
    const mult = cell.speed.multipliers.find(mult => mult.id === id)
    if (!mult) cell.speed.multipliers.push({ id, value: 1 + value })
    else mult.value += value

    // update the currently boosted value of the target
    const speedMult = getTotalMult(cell.speed.multipliers)
    cell.speed.current = cell.speed.base * speedMult
}

const boostCallbacks: Record<DerivativeEffect, (cell: CellContent, value: number, id: string) => void> = {
    boostGeneratorGain,
    boostGeneratorSpeed
}

export function applyCellEffects(coord: Coordinate, stencil: Stencil, effect: DerivativeEffect, effectValue: number, id: string): void {
    // get affected cells via the stencil
    const affectedCells = getAffectedCells(coord, stencil)
    // apply the corresponding effect onto all affected cells
    for (const cell of affectedCells) {
        boostCallbacks[effect](cell, effectValue, id)
    }
}
