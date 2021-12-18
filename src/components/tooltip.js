import Tooltip from './TooltipFromAction.svelte';
import { SvelteComponent } from 'svelte';
import { check_outros, group_outros, transition_out } from 'svelte/internal';

export function tooltip(element) {
	let title;
	let tooltipComponent;
	function mouseOver(event) {
		// NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
		// remember to set it back on `mouseleave`
		title = element.getAttribute('title');
		element.removeAttribute('title');
    
		tooltipComponent = new Tooltip({
			props: {
				title: title,
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
		element.setAttribute('title', title);
	}
	
	element.addEventListener('mouseover', mouseOver);
  element.addEventListener('mouseleave', mouseLeave);
	
	return {
		destroy() {
			element.removeEventListener('mouseover', mouseOver);
			element.removeEventListener('mouseleave', mouseLeave);
		}
	}
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    right: rect.right + window.scrollX,
    top: rect.top + window.scrollY,
    bottom: rect.bottom+ window.scrollY,
  };
}

// black magic that fades out a svelete component before destroying it
// outro (automatically) has same duration as the intro (specified in tooltip.js)
const outroAndDestroy = (instance) => {
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