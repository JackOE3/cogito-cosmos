import { gridCell, type Cell, type CellEffect, type Coordinate, type Stencil } from '$lib/store'
import { isDefined, splitByFilter } from '$lib/gamelogic/utils'
import { applyEffect, effectIsApplicable, getAllAffectedCells } from '$lib/gamelogic/cell-effects.svelte'

export type Options = {
    coord: Coordinate
    stencil: Stencil | undefined
}

export function stencilHighlight(element: HTMLElement, optionsFn: () => Options): void {
    let cellsToHightlight: Cell[]
    let effect: CellEffect
    $effect(() => {
        if (!isDefined(optionsFn().stencil)) return

        const parentCell = gridCell.value.flat().find(cell => cell.coord.row === optionsFn().coord.row && cell.coord.col === optionsFn().coord.col)
        if (!isDefined(parentCell)) return
        if (!('effect' in parentCell.content)) return
        effect = parentCell.content.effect

        cellsToHightlight = getAllAffectedCells(optionsFn().coord, optionsFn().stencil!).filter(cell => !cell.hidden)

        element.addEventListener('mouseenter', mouseEnter)
        element.addEventListener('mouseleave', mouseLeave)
        return () => {
            element.removeEventListener('mouseenter', mouseEnter)
            element.removeEventListener('mouseleave', mouseLeave)
        }
    })

    function mouseEnter(): void {
        cellsToHightlight.forEach(cell => {
            if (effectIsApplicable(effect, cell)) cell.highlighted = 'affected'
            else cell.highlighted = 'notAffected'
        })
    }

    function mouseLeave(): void {
        cellsToHightlight.forEach(cell => {
            cell.highlighted = false
        })
    }
}
