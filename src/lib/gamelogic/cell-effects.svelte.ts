import {
    gridCell,
    type Stencil,
    type Coordinate,
    type Metric,
    type Cell,
    type EffectType,
    type CellEffect,
    type CellContent,
    type Formula,
    type EffectTier
} from '$lib/store'
import { formatNumber, isDefined } from './utils'

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
 *  Updates the affected cell with the effect of the specified cell.
 *  @param from The cell which causes the effect.
 *  @param target The cell which should be updated.
 *  @returns Whether any effects were actually applied. Only returns true if the target value of the effect actually changed.
 */
export function applyEffect(from: Cell, target: Cell): boolean {
    if (!('effect' in from.content)) return false
    let metric: Metric
    const effect = from.content.effect
    // multiple effects in the future? just make metric an array and remove all break statements!
    switch (effect.type) {
        case 'boostGeneratorGain': {
            if (target.content.type !== 'generator') return false
            metric = target.content.gain
            break
        }
        case 'boostGeneratorSpeed': {
            if (target.content.type !== 'generator') return false
            metric = target.content.speed
            break
        }
        case 'boostSkillExpGain': {
            if (target.content.type !== 'skill') return false
            metric = target.content.expPerSec
            break
        }
        case 'decreaseSkillExpRequirement': {
            if (target.content.type !== 'skill') return false
            metric = target.content.requiredExp
            break
        }
        case 'boostSkillEffect': {
            if (target.content.type !== 'skill') return false
            metric = target.content.effect.value
            break
        }
        case 'decreaseUpgradeCost': {
            if (target.content.type !== 'upgrade') return false
            metric = target.content.cost
            break
        }
        case 'boostUpgradeEffect': {
            if (target.content.type !== 'upgrade') return false
            metric = target.content.effect.value
            break
        }
        case 'decreaseGeneratorCost': {
            if (target.content.type !== 'generator') return false
            if (!isDefined(target.content.cost)) return false
            metric = target.content.cost
            break
        }
        default: {
            console.log(`Effect type ${effect.type} not implemented in applyEffect().`)
            return false
        }
    }

    // If the effect affects another effect value, determine if it is allowed based on the tier difference of the effects. This is to prevent circular dependencies of effects, which could cause an uncontrolled, explosive feedback loop.
    // effectTierFrom has to be bigger than effectTierTarget for the effect to be applied
    const effectTierFrom = from.content.effect.tier
    let effectTierTarget = 0
    if ('effect' in target.content) effectTierTarget = target.content.effect.tier
    if (effectTierFrom <= effectTierTarget) return false

    const id = from.id

    // find the multiplier corresponding to the id from the cell which causes it
    const mult = metric.multipliers.find(mult => mult.id === id)

    let value
    if (isDefined(effect.value.currentCumulative)) {
        value = effect.value.currentCumulative
    } else value = effect.value.current

    // eg. +20% = 0.2 -> 1.2 when you multiply
    if (effect.formula === 'additive') value += 1

    // determine if factor is inverse (-> didivde by it instead of multiplying its target value)
    if (effect.type === 'decreaseUpgradeCost' || effect.type === 'decreaseSkillExpRequirement') {
        value = 1 / value
        // console.log(value)
    }

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

/* function increaseAreaOfEffect(cell: Cell, effect: CellEffect, id: string): boolean {
    const content = cell.content
    if (content.type !== 'upgrade' && content.type !== 'skill') return false
    if (content.effect.stencil === '3x3') content.effect.stencil = '5x5'
    // TODO: propagate the effects of the affected cells to their targets
    const affectedCells = getAllAffectedCells(cell.coord, content.effect.stencil)
    let changedSomething = false
    for (const targetCell of affectedCells) {
        const applied = applyEffect[content.effect.type](targetCell, content.effect, id)
        if (applied) changedSomething = true
    }
    return changedSomething
} */

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
        //const applied = applyEffect[parentCell.content.effect.type](cell, parentCell.content.effect, parentCell.id)
        const applied = applyEffect(parentCell, cell)
        if (!applied) continue

        //console.log($state.snapshot(cell.content))
        // recursive logic for propagating effects, eg. if an effect changes an effect.value of the target cell
        applyCellEffects(cell) // scary af, lets just hope for the best.
    }
}

export const cellEffectDescription: Record<EffectType, string> = {
    boostGeneratorGain: `Boosts the gain of generators`,
    decreaseGeneratorCost: 'Decrease the cost of generators',
    boostGeneratorSpeed: `Boosts the speed of generators`,

    boostSkillExpGain: `Boosts the XP gain of skills`,
    decreaseSkillExpRequirement: `Decreases the XP requirement to level up skills`,
    boostSkillEffect: 'Increases the potency of skills',

    decreaseUpgradeCost: `Decreases the cost of upgrades`,
    boostUpgradeEffect: `Increases the potency of upgrades`,

    increaseAreaOfEffect: `Increases the area of effect of other upgrades and skills`
}
export const cellEffectSymbols: Record<EffectType, string> = {
    boostGeneratorGain: `+&ShortUpArrow;`,
    decreaseGeneratorCost: '&dollar;&DownTeeArrow;',
    boostGeneratorSpeed: `&#10227;&ShortUpArrow;`,

    boostSkillExpGain: `XP&ShortUpArrow;`,
    decreaseSkillExpRequirement: `XP&DownTeeArrow;`,
    boostSkillEffect: '&#x2747;&ShortUpArrow;',

    decreaseUpgradeCost: `&dollar;&DownTeeArrow;`,
    boostUpgradeEffect: `&#x2747;&ShortUpArrow;`,

    increaseAreaOfEffect: `&#x21F2;&#x2747;`
}

export function getTotalEffectValue(effect: CellEffect): string {
    if (!isDefined(effect.value.currentCumulative)) return 'currentCumulative is not defined'
    if (effect.formula === 'additive') return formatNumber(1 + effect.value.currentCumulative, 2)
    else if (effect.formula === 'multiplicative') return formatNumber(effect.value.currentCumulative, 2)
    return 'Unknown formula'
}

export function getAreaOfEffectDescription(stencil: Stencil): string {
    if (!isDefined(stencil)) return 'stencil is not defined'
    switch (stencil) {
        case 'adjacent':
            return 'Adjacent cells'
        case '3x3':
            return '3x3 grid'
        case '5x5':
            return '3x3 grid'
        case 'all':
            return 'All cells'
        case 'row':
            return 'All cells in this row'
        case 'column':
            return 'All cells in this column'
        case 'diagonals':
            return 'Both diagonals (like a bishop)'
        case 'leftHalf':
            return 'All cells on the left'
        case 'rightHalf':
            return 'All cells on the right'
        case 'lowerHalf':
            return 'All cells below'
        case 'upperHalf':
            return 'All cells above'
        case 'lowerLeftQuadrant':
            return 'All cells in lower left quadrant'
        case 'lowerRightQuadrant':
            return 'All cells in lower right quadrant'
        case 'upperLeftQuadrant':
            return 'All cells in upper left quadrant'
        case 'upperRightQuadrant':
            return 'All cells in upper right quadrant'
        default:
            return 'unknown stencil'
    }
}

export function getStyleFromEffectTier(content: CellContent): string {
    if (!('effect' in content)) return ''
    if (content.effect.tier === 2) return 'color: #90CAF9;'
    else if (content.effect.tier === 3) return 'color: #EF9A9A;'
    return ''
}
