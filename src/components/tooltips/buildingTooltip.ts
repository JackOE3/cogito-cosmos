import Tooltip from './BuildingTooltip.svelte'
import type { SvelteComponent } from 'svelte';
import { check_outros, group_outros, transition_out } from 'svelte/internal';

export function tooltip(element: HTMLElement) {
	let buildingType: number;
	let tooltipComponent: SvelteComponent;
	function mouseEnter(_event: Event) {
		// NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
		// remember to set it back on `mouseleave`
		buildingType = Number(element.getAttribute('data-buildingtype'))
		//element.removeAttribute('data-buildingtype');
    
		tooltipComponent = new Tooltip({
			props: {
				buildingType: buildingType,
				x: getOffset(element).right,
				y: getOffset(element).top,
			},
			target: document.body,
		});
	}

	function mouseLeave() {
    outroAndDestroy(tooltipComponent);
		//tooltipComponent.$destroy();
		// NOTE: restore the `title` attribute
    // (dont need to delete data attributes, no default tooltip in the browser)
		//element.setAttribute('data-buildingtype', String(buildingType) );
	}
	
	element.addEventListener('mouseenter', mouseEnter);
  element.addEventListener('mouseleave', mouseLeave);
	
	return {
		destroy() {
			element.removeEventListener('mouseenter', mouseEnter);
			element.removeEventListener('mouseleave', mouseLeave);
		}
	}
}

function getOffset(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    right: rect.right + window.scrollX,
    top: rect.top + window.scrollY,
    bottom: rect.bottom+ window.scrollY,
  };
}

// black magic that fades out a svelete component before destroying it
// outro (automatically) has same duration as the intro (specified in tooltip.ts)
const outroAndDestroy = (instance: SvelteComponent) => {
  if (instance.$$.fragment && instance.$$.fragment.o) {
    group_outros();
    transition_out(instance.$$.fragment, 0, 0, () => {
      instance.$destroy();
    });
    check_outros();
  } else {
    instance.$destroy();
  }
};