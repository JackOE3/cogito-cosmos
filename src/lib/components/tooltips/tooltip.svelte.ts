import { mount, unmount } from 'svelte'
import Tooltip from './Tooltip.svelte'

export enum Direction {
    TOP = 'top',
    RIGHT = 'right',
    LEFT = 'left',
    BOTTOM = 'bottom'
}

export function tooltip(
    element: HTMLElement,
    options: {
        data?: unknown
        anchor?: string
        direction?: Direction
        Component?: any
    }
): object {
    let tooltipComponent: Record<string, any>
    const TooltipComponent = options.Component ?? Tooltip
    const myProps = $state({
        data: options.data ?? null,
        top: 0,
        left: 0
    })

    let mousePressed = false
    let tooltipShown = false

    function mouseEnter(_event: MouseEvent): void {
        if (myProps.data === null || mousePressed) return

        let rect: DOMRect

        if (options.anchor === 'parentElement') {
            rect = element.parentElement?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
        } else if (options.anchor === 'offsetParent') {
            rect = element.offsetParent?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
        } else {
            rect = element.getBoundingClientRect()
        }

        if (options.direction === Direction.RIGHT) {
            myProps.top = rect.top
            myProps.left = rect.right + 8
        } else {
            myProps.top = rect.bottom + 10
            myProps.left = rect.left
        }

        tooltipComponent = mount(TooltipComponent, { target: document.body, props: myProps })
        tooltipShown = true
    }

    function mouseLeave(): void {
        if (myProps.data === null || mousePressed) return
        unmount(tooltipComponent)
    }

    function mouseMove(_event: MouseEvent): void {
        if (myProps.data === null || !mousePressed || !tooltipShown) return
        unmount(tooltipComponent)
        tooltipShown = false
    }

    function mouseDown(_event: MouseEvent): void {
        mousePressed = true
    }

    function mouseUp(event: MouseEvent): void {
        mousePressed = false
        if (!tooltipShown) mouseEnter(event)
    }

    element.addEventListener('mouseenter', mouseEnter)
    element.addEventListener('mousemove', mouseMove)
    element.addEventListener('mouseleave', mouseLeave)
    element.addEventListener('mousedown', mouseDown)
    element.addEventListener('mouseup', mouseUp)

    return {
        // is called whenever the parameter (options) changes
        // argument is the new parameter
        update({ data }) {
            // update the local variable from here, else the tooltip would reset
            // to the starting value if it's destroyed and created again
            myProps.data = data
            // programmatically sets props on an instance. component.$set({ x: 1 })
            // is equivalent to x = 1 inside the component's <script> block.
            //if (tooltipComponent !== undefined) tooltipComponent.$set({ data })
        },
        destroy() {
            console.log('DESTROYED TOOLTIP')
            if (tooltipComponent !== undefined) unmount(tooltipComponent)
            element.removeEventListener('mouseenter', mouseEnter)
            element.removeEventListener('mousemove', mouseMove)
            element.removeEventListener('mouseleave', mouseLeave)
            element.removeEventListener('mousedown', mouseDown)
            element.removeEventListener('mouseup', mouseUp)
        }
    }
}
