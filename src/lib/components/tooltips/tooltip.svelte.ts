import { mount, unmount } from 'svelte'
import Tooltip from './Tooltip.svelte'
import { isDefined } from '$lib/gamelogic/utils'

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
        /* element.addEventListener('mousemove', mouseMove) */
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
            /* element.removeEventListener('mousemove', mouseMove) */
            element.removeEventListener('mouseleave', mouseLeave)
            /* element.removeEventListener('mousedown', mouseDown)
                element.removeEventListener('mouseup', mouseUp) */
            if (alreadyEntered) unmount(tooltipComponent)
        }
    })

    const TooltipComponent = options.Component ?? Tooltip

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

        myProps.top = rect.top - bodyRect.top
        myProps.left = rect.right + PADDING_TO_ELEMENT

        mountTooltip()

        // logic to reposition tooltip if it is out of bounds of the viewport
        const tooltipElement = document.querySelector('.tooltip')
        const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        if (tooltipElement) {
            const tooltipRect = tooltipElement.getBoundingClientRect()
            const overshootYBottom = Math.max(tooltipRect.bottom - viewportHeight + PADDING_TO_VIEWPORT, 0)
            const overshootYTop = Math.min(tooltipRect.top - PADDING_TO_VIEWPORT, 0)
            const overshootX = Math.max(tooltipRect.right - viewportWidth + PADDING_TO_VIEWPORT, 0)
            console.log(viewportHeight, tooltipRect, rect, overshootYBottom, overshootX)
            myProps = { ...myProps, top: myProps.top - overshootYBottom - overshootYTop }
            if (overshootX) {
                myProps = { ...myProps, left: rect.left - tooltipRect.width - PADDING_TO_ELEMENT }
            }
        }

        tooltipShown = true
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

    function mouseMove(_event: MouseEvent): void {
        if (options.data === null || !mousePressed || !tooltipShown) return
        // onmount when tooltip is shown & mouse is pressed (= disable tooltip when panning)
        if (isDefined(tooltipComponent)) unmount(tooltipComponent)
        tooltipShown = false
    }

    function mouseDown(_event: MouseEvent): void {
        mousePressed = true
    }

    function mouseUp(event: MouseEvent): void {
        mousePressed = false
        if (!tooltipShown) mouseEnter(event)
    }
}
