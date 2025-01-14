import { type Cell, type Coordinate, type Stencil } from '$lib/store'
import { isDefined } from '$lib/gamelogic/utils'
import { getAllAffectedCells } from '$lib/gamelogic/cell-effects.svelte'

export type Options = {
    coord: Coordinate
    stencil: Stencil | undefined
}

export function stencilHighlight(element: HTMLElement, optionsFn: () => Options): void {
    if (!isDefined(optionsFn().stencil)) return

    let cellsToHightlight: Cell[]
    $effect(() => {
        console.log($state.snapshot(optionsFn().coord))

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
            cell.highlighted = true
        })
    }

    function mouseLeave(): void {
        cellsToHightlight.forEach(cell => {
            cell.highlighted = false
        })
    }
}
