<script lang="ts">

	export let data: string
	export let x: number
	export let y: number


</script>


<div style="top: {y + 5}px; left: {x + 5}px;">
  {@html data}
</div>


<style>
  div {
    width: max-content;
		border: 1px solid var(--secondary);
    /* border-radius: 4px; */
		background: #263238;
		padding: 12px;
    position: absolute;
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    box-shadow: 4px 4px var(--Gray900);
	}
</style>
