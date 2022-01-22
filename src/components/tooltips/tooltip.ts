import type { SvelteComponent } from 'svelte';

export function tooltip(element: HTMLElement, options: {
  content: typeof SvelteComponent, // <-- else you are referring to the instance of that component, not the class type
  data: any
}) {
  
	let tooltipComponent: SvelteComponent;
  let tooltipData = options.data

	function mouseEnter(event: MouseEvent) {
		tooltipComponent = new options.content({
			props: {
				data: tooltipData,
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
    // is called whenever the parameter (options) changes
    // argument is the new parameter
    update({data}) {
      // update the local variable from here, else the tooltip would reset
      // to the starting value if it's destroyed and created again
      tooltipData = data
      // programmatically sets props on an instance. component.$set({ x: 1 })
      // is equivalent to x = 1 inside the component's <script> block.
      tooltipComponent.$set({data: data})
     
    },
		destroy() {
			element.removeEventListener('mouseenter', mouseEnter);
      element.removeEventListener('mousemove', mouseMove);
			element.removeEventListener('mouseleave', mouseLeave);
		}
	}
}
