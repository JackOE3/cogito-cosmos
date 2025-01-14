import { mount, unmount } from 'svelte'
import Tooltip from './Tooltip.svelte'

export type Options = {
    data?: unknown
    anchor?: string
    Component?: any
}

/**
 * How far away from the border of the viewport a tooltip box must be at minimum.
 */
const PADDING_TO_VIEWPORT = 8

/**
 * How far away from the element which the tooltip is for.
 */
const PADDING_TO_ELEMENT = 8

export function tooltip(element: HTMLElement, optionsFn: () => Options): void {
    let tooltipComponent: Record<string, any>
    const options = optionsFn()
    //let lastData = options.data

    $effect(() => {
        element.addEventListener('mouseenter', mouseEnter)
        element.addEventListener('mousemove', mouseMove)
        element.addEventListener('mouseleave', mouseLeave)
        /*     element.addEventListener('mousedown', mouseDown)
        element.addEventListener('mouseup', mouseUp) */
        if (alreadyEntered) mountTooltip()

        // assign the new data if it has changed, this is needed for reactivity!
        myProps.data = optionsFn().data ?? null

        // cant differentiate if component has been unmounted (destroyed) or just updated...
        // anyhow, this will run before the the effect is run again, so it should be fine.
        // will just remove and add event listeners and re-mount the tooltip blazingly fast
        return () => {
            element.removeEventListener('mouseenter', mouseEnter)
            element.removeEventListener('mousemove', mouseMove)
            element.removeEventListener('mouseleave', mouseLeave)
            /* element.removeEventListener('mousedown', mouseDown)
                element.removeEventListener('mouseup', mouseUp) */
            if (alreadyEntered) unmount(tooltipComponent)
        }
    })

    const TooltipComponent = options.Component ?? Tooltip

    let tooltipElement: Element | null

    let myProps = $state({
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

    function mouseEnter(_event: MouseEvent): void {
        /* console.log('mouseEnter', alreadyEntered) */
        if (alreadyEntered) return
        alreadyEntered = true
        if (options.data === null || mousePressed) return

        mountTooltip()
        positionTooltip()

        tooltipShown = true
    }

    function positionTooltip(): void {
        tooltipElement = document.querySelector('.tooltip')
        if (tooltipElement === null) return

        let rect: DOMRect
        if (options.anchor === 'parentElement') {
            rect = element.parentElement?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
        } else if (options.anchor === 'offsetParent') {
            rect = element.offsetParent?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
        } else {
            rect = element.getBoundingClientRect()
        }

        // if the page is scrolled, offset top by bodyRect.top
        const bodyRect = document.body.getBoundingClientRect()

        // logic to reposition tooltip if it is out of bounds of the viewport
        const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

        const tooltipRect = tooltipElement.getBoundingClientRect()
        const overshootYBottom = Math.max(rect.top + tooltipRect.height - viewportHeight + PADDING_TO_VIEWPORT, 0)
        const overshootYTop = Math.min(rect.top - PADDING_TO_VIEWPORT, 0)
        const overshootX = Math.max(rect.right + tooltipRect.width - viewportWidth + PADDING_TO_VIEWPORT, 0)
        //console.log(overshootYBottom, overshootYTop, overshootX)

        const top = rect.top - bodyRect.top - overshootYBottom - overshootYTop
        let left: number
        if (overshootX) left = rect.left - tooltipRect.width - PADDING_TO_ELEMENT
        else left = rect.right + PADDING_TO_ELEMENT
        myProps = { ...myProps, top, left }
    }

    function mountTooltip(): void {
        tooltipComponent = mount(TooltipComponent, {
            target: document.body, //or element?
            props: myProps
        })
    }

    function mouseLeave(): void {
        /* console.log('mouseLeave') */
        if (options.data === null || mousePressed) return
        alreadyEntered = false
        unmount(tooltipComponent)
    }

    let rectX: number, rectY: number
    function mouseMove(e: MouseEvent): void {
        //if (options.data === null || !mousePressed || !tooltipShown) return
        // onmount when tooltip is shown & mouse is pressed (= disable tooltip when panning)
        /* if (isDefined(tooltipComponent)) unmount(tooltipComponent)
        tooltipShown = false */
        const rect = element.getBoundingClientRect()
        // avoid updating the position of element hasnt moved
        if (rectX === rect.x && rectY === rect.y) return
        rectX = rect.x
        rectY = rect.y
        positionTooltip()
    }

    function mouseDown(_event: MouseEvent): void {
        mousePressed = true
    }

    function mouseUp(event: MouseEvent): void {
        mousePressed = false
        if (!tooltipShown) mouseEnter(event)
    }
}
