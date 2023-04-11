import Tooltip from './Tooltip.svelte'

export function tooltip(
  element: HTMLElement,
  options: {
    data: string | null
  }
): object {
  let tooltipComponent: Tooltip
  let tooltipData: string | null = options.data ?? null
  let mousePressed = false
  let tooltipShown = false

  function mouseEnter(_event: MouseEvent): void {
    if (tooltipData === null || mousePressed) return
    tooltipComponent = new Tooltip({
      props: {
        data: tooltipData,
        rect: element.getBoundingClientRect(),
      },
      target: document.body,
    })
    tooltipShown = true
  }

  function mouseLeave(): void {
    if (tooltipData === null || mousePressed) return
    tooltipComponent.$destroy()
  }

  function mouseMove(_event: MouseEvent): void {
    if (tooltipData === null || !mousePressed || !tooltipShown) return
    tooltipComponent.$destroy()
    tooltipShown = false

    /*  tooltipComponent.$set({
      x: event.pageX,
      y: event.pageY,
    }) */
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
      tooltipData = data
      // programmatically sets props on an instance. component.$set({ x: 1 })
      // is equivalent to x = 1 inside the component's <script> block.
      if (tooltipComponent !== undefined) tooltipComponent.$set({ data })
    },
    destroy() {
      if (tooltipComponent !== undefined) tooltipComponent.$destroy()
      element.removeEventListener('mouseenter', mouseEnter)
      element.removeEventListener('mousemove', mouseMove)
      element.removeEventListener('mouseleave', mouseLeave)
      element.removeEventListener('mousedown', mouseDown)
      element.removeEventListener('mouseup', mouseUp)
    },
  }
}
