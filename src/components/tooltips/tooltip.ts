import type { SvelteComponent } from 'svelte';

export function tooltip(element: HTMLElement, options: {
  content: typeof SvelteComponent, // <-- else you are referring to the instance of that component, not the class type
  data: any
}) {
  
	let tooltipComponent: SvelteComponent;

	function mouseEnter(event: MouseEvent) {
		tooltipComponent = new options.content({
			props: {
				data: options.data,
				x: event.pageX,
				y: event.pageY,
			},
			target: document.body,
		});
	}
	function mouseLeave() {
		tooltipComponent.$destroy();
	}
  function mouseMove(event: MouseEvent) {
    tooltipComponent.$set({
			x: event.pageX,
			y: event.pageY,
		})
  }
	
	element.addEventListener('mouseenter', mouseEnter);
  element.addEventListener('mousemove', mouseMove);
  element.addEventListener('mouseleave', mouseLeave);
	
	return {
		destroy() {
			element.removeEventListener('mouseenter', mouseEnter);
      element.removeEventListener('mousemove', mouseMove);
			element.removeEventListener('mouseleave', mouseLeave);
		}
	}
}
