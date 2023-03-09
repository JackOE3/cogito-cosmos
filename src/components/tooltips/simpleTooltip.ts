import Tooltip from './SimpleTooltip.svelte'
import type { SvelteComponent } from 'svelte'
import { check_outros, group_outros, transition_out } from 'svelte/internal'

export function tooltip(element: HTMLElement): object {
  let title: string | null
  let tooltipComponent: SvelteComponent
  function mouseEnter(_event: Event): void {
    // NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
    // remember to set it back on `mouseleave`
    title = element.getAttribute('title')
    element.removeAttribute('title')

    tooltipComponent = new Tooltip({
      props: {
        title,
        x: getOffset(element).right,
        y: getOffset(element).top,
      },
      target: document.body,
    })
  }

  function mouseLeave(): void {
    outroAndDestroy(tooltipComponent)
    // tooltipComponent.$destroy();
    // NOTE: restore the `title` attribute
    element.setAttribute('title', title as string)
  }

  element.addEventListener('mouseenter', mouseEnter)
  element.addEventListener('mouseleave', mouseLeave)

  return {
    destroy() {
      element.removeEventListener('mouseenter', mouseEnter)
      element.removeEventListener('mouseleave', mouseLeave)
    },
  }
}

function getOffset(el: HTMLElement): object {
  const rect = el.getBoundingClientRect()
  return {
    left: rect.left + window.scrollX,
    right: rect.right + window.scrollX,
    top: rect.top + window.scrollY,
    bottom: rect.bottom + window.scrollY,
  }
}

// black magic that fades out a svelete component before destroying it
// outro (automatically) has same duration as the intro (specified in tooltip.ts)
const outroAndDestroy = (instance: SvelteComponent): void => {
  if (instance.$$.fragment && instance.$$.fragment.o) {
    group_outros()
    transition_out(instance.$$.fragment, 0, 0, () => {
      instance.$destroy()
    })
    check_outros()
  } else {
    instance.$destroy()
  }
}
