<script>
import ProgBar from './ProgBar.svelte'
import {formatNumber, formatWhole} from '../gamelogic/utils.js'
export let resource

// capitalize 1st letter
let label = resource.name.charAt(0).toUpperCase() + resource.name.slice(1)

$: bonus = (resource.active) ? resource.perAction : 0
</script>

<div class="container">
  <b>{label}</b>
  <span class="perSec"> +{resource.perSec + bonus}/s </span>
  <span class="amount">{formatNumber(resource.amount,2)}/{formatWhole(resource.maxAmount)}</span>
  
  <span class="bar">
    <ProgBar 
    --width = 15rem
    --height = 1rem 
    --progress = "{100*resource.amount/resource.maxAmount}%"/>
  </span>
  

  <button class="btn" class:active={resource.active}
    on:click={() => {
    resource.active = !resource.active;
    }}>Collect
  </button>
</div>


<style>
 .container {
    display: flex;
    align-items: baseline;
 }
  .active{
   background-color: rgb(136, 136, 136);
   color: white
 }
 .perSec{
   margin-left: 1rem;
 }
 .amount{
   margin-left: 1rem;
 }
 .bar{
   margin-left: 1rem;
 }
 .btn{
   margin-left: 1rem;
 }
 

</style>