import { gridCell, type CellContent, type DerivativeEffect, type Multiplier, type Stencil, type Coordinate } from '$lib/store'

function getAffectedCells(coord: Coordinate, stencil: Stencil): CellContent[] {
    const row = coord.row
    const col = coord.col
    switch (stencil) {
        case 'adjacent':
            return [
                gridCell.value[row][col - 1].content,
                gridCell.value[row][col + 1].content,
                gridCell.value[row - 1][col].content,
                gridCell.value[row + 1][col].content
            ]
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
