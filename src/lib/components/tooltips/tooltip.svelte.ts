import { mount, unmount, untrack } from 'svelte'
import Tooltip from './Tooltip.svelte'

export enum Direction {
    TOP = 'top',
    RIGHT = 'right',
    LEFT = 'left',
    BOTTOM = 'bottom'
}

export type Options = {
    data?: unknown
    anchor?: string
    direction?: Direction
    Component?: any
}

export function tooltip(element: HTMLElement, optionsFn: () => Options): void {
    let tooltipComponent: Record<string, any>
    const options = optionsFn()
    //let lastData = options.data

    $effect(() => {
        // assign the new data if it has changed, this is needed to reactivity!
        myProps.data = optionsFn().data ?? null
        // cant differntiate if component has been unmounted (destroyed) or just updated...
        // only unmount tooltip here if component for the tooltip has been unmounted
        return () => {
            // optionsFn().data ... new dynamic data
            // myProps.data ... data assigned in this function (above)
            // equality here implies that this isnt an update, but that the component was unmounted
            // then simply do cleanup logic here
            if (optionsFn().data === myProps.data) {
                /* console.log('Component for tooltip was destroyed, commencing cleanup logic.') */
                if (alreadyEntered) unmount(tooltipComponent)
                element.removeEventListener('mouseenter', mouseEnter)
                /* element.removeEventListener('mousemove', mouseMove) */
                element.removeEventListener('mouseleave', mouseLeave)
                /* element.removeEventListener('mousedown', mouseDown)
                element.removeEventListener('mouseup', mouseUp) */
            }
        }
    })

    const TooltipComponent = options.Component ?? Tooltip

    const myProps = $state({
        data: options.data ?? null,
        top: 0,
        left: 0
    })

    let mousePressed = false
    let tooltipShown = false

    /**
     * mouseEnter can trigger when clicking a button while still inside it,
     * so this flag has to be kept track of so the tooltip isnt mounted twice
     */
    let alreadyEntered = false

    const PADDING = 8

    function mouseEnter(_event: MouseEvent): void {
        /* console.log('mouseEnter', alreadyEntered) */
        if (alreadyEntered) return
        alreadyEntered = true

        if (options.data === null || mousePressed) return

        let rect: DOMRect

        if (options.anchor === 'parentElement') {
            rect = element.parentElement?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
        } else if (options.anchor === 'offsetParent') {
            rect = element.offsetParent?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
        } else {
            rect = element.getBoundingClientRect()
        }

        if (options.direction === Direction.BOTTOM) {
            myProps.top = rect.bottom + PADDING
            myProps.left = rect.left
        } else {
            // Direction.RIGHT
            myProps.top = rect.top
            myProps.left = rect.right + PADDING
        }

        tooltipComponent = mount(TooltipComponent, {
            target: document.body, //or element?
            props: myProps
        })
        tooltipShown = true
    }

    function mouseLeave(): void {
        /* console.log('mouseLeave') */
        if (options.data === null || mousePressed) return
        alreadyEntered = false
        unmount(tooltipComponent)
    }

    function mouseMove(_event: MouseEvent): void {
        if (options.data === null || !mousePressed || !tooltipShown) return
        // onmount when tooltip is shown & mouse is pressed (= disable tooltip when panning)
        if (typeof tooltipComponent !== 'undefined') unmount(tooltipComponent)
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
    /* element.addEventListener('mousemove', mouseMove) */
    element.addEventListener('mouseleave', mouseLeave)
    /*     element.addEventListener('mousedown', mouseDown)
    element.addEventListener('mouseup', mouseUp) */
}
