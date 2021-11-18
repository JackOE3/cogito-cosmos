<script>
import ProgBar from './ProgBar.svelte'
import {formatNumber, formatWhole} from '../gamelogic/utils.js'
export let resource

// capitalize 1st letter
let label = resource.name.charAt(0).toUpperCase() + resource.name.slice(1)

$: bonus = (resource.active) ? resource.perAction : 0
</script>

<div class="container">
  <span><b>{label}</b> +{resource.perSec + bonus}/s</span>
  <button class:active={resource.active}
    on:click={() => {
    resource.active = !resource.active;
    }}>Collect</button>
</div>
<ProgBar 
  --width = 15rem
  --height = 30px 
  --progress = "{100*resource.amount/resource.maxAmount}%">
  {formatNumber(resource.amount,2)}/{formatWhole(resource.maxAmount)}
</ProgBar>

<style>
 .container {
    display: flex;
 }
 .container span {
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 5px
 }
 .container button {
   margin-left: auto;
   margin-bottom: 0;
   margin-right: 0
 }
  .active{
   background-color: rgb(136, 136, 136);
   color: white
 }
</style>