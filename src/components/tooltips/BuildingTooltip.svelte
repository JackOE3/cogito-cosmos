<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { gameModel } from '../../gamelogic/gamemodel'
  import { formatNumber } from '../../gamelogic/utils'

	export let buildingType: number;
	export let x: number;
	export let y: number;
  let visible = false;
  $: building = $gameModel.saveData.building[buildingType]

  onMount(() => {
    // needed for fading in properly
    visible = true
  })
  
</script>
 
{#if visible}
  <div transition:fade="{{duration: 100}}" 
    style="top: {y}px; left: {x + 5}px;">
    <table>
      {#each building.cost as cost}
        <tr>
          <td>{$gameModel.saveData.resource[cost.resourceType].name}</td>
          <td>{formatNumber(cost.amount, 2)}</td>
        </tr>
      {/each}
    </table>
  </div>
{/if}

<style>
	div {
		border: 1px solid #455A64;
		background: #263238;
		border-radius: 4px;
		padding: 10px;
		position: absolute;
	}
  table {
    table-layout: fixed;
    width: 200px;
  }
  td:nth-child(1) {
    text-align: left;
  }
  td:nth-child(2) {
    text-align: right;
  }
  
  
</style>
