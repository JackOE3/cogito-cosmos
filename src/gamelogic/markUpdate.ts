import { beforeUpdate, onMount } from 'svelte';

/* export default function () {
	let elements = new Set()

	beforeUpdate(() => {
    //console.log("Ui update")
		elements.forEach(element => {
			element.style.outlineColor = 'red';
			
			setTimeout(() => {
				if (elements.has(element)) {
					element.style.outlineColor = 'black';
				}
			}, 1000);
		})
	});
	
	onMount(() => {
		elements.forEach(element => {
			element.style.outline = '2px solid black';
			element.style.margin = '8px';
		});
	});

	
	return function markUpdateAction(node) {
		elements.add(node);

		return {
			destroy() {
				elements.delete(node);
			}
		}
	}
} */