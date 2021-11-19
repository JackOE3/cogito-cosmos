<script>
import ProgBar from './ProgBar.svelte'
import {formatNumber, formatWhole} from '../gamelogic/utils.js'
export let stat

// capitalize 1st letter
let label = stat.name.charAt(0).toUpperCase() + stat.name.slice(1)

$: bonus = (stat.active) ? stat.perAction : 0
</script>

<div class="container">
  <b>{label}</b>
  <span class="perSec"> +{stat.expPerSec + bonus}/s </span>
  <span class="amount">{formatNumber(stat.exp,2)}/{formatWhole(stat.expToNextPoint)}</span>
  
  <span class="bar">
    <ProgBar 
    --width = 15rem
    --height = 1rem 
    --progress = "{100*stat.exp/stat.expToNextPoint}%"/>
  </span>
  

  <button class="btn" class:active={stat.active}
    on:click={() => {
    stat.active = !stat.active;
    }}>Gain
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