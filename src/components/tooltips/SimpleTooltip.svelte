<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';

	export let title: string;
	export let x: number;
	export let y: number;
  let visible = false;

  onMount(() => {
    visible = true
    console.log("tooltip created")
    return () => console.log("tooltip destroyed")
  })
</script>

{#if visible}
  <div transition:fade="{{duration: 100}}" style="
      top: {y}px;
      left: {x + 5}px;">{title}</div>
{/if}

<style>
	div {
		border: 1px solid #455A64;
		background: #263238;
		border-radius: 4px;
		padding: 10px;
		position: absolute;
	}
</style>
