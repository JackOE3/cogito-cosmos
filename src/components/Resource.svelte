<script>
import ProgBar from './ProgBar.svelte'
import {formatNumber, formatWhole} from '../gamelogic/utils.js'
export let resource

// capitalize 1st letter
let label = resource.name.charAt(0).toUpperCase() + resource.name.slice(1)

$: bonus = (resource.active) ? resource.perAction : 0
</script>

<div class="component">
  <div class="details">
    <table>
      <tr>
        <td><b>{label}</b></td>
        <td>{formatNumber(resource.amount,2)}/{formatWhole(resource.maxAmount)}</td>
        <td>+{formatNumber(resource.perSec + bonus,2)}/s</td>
      </tr>
    </table>
    <button class:active={resource.active}
      on:click={() => {
      resource.active = !resource.active;
      }}>Collect</button>
    <button on:click={() => {
    resource.amount += 5
    }}>incr</button>
  </div>
  <ProgBar 
    --width = 80%
    --height = 4px 
    --progress = "{100*resource.amount/resource.maxAmount}%"/>
</div>


<style>
  table {
    table-layout: fixed;
    width: 100%;
  }
  table td {
    width: 90px;
  }
 .details {
    display: flex;
 }
 .details button {
   margin-left: auto;
   margin-bottom: 0;
   margin-right: 0
 }
  .active{
   background-color: rgb(136, 136, 136);
   color: white
 }
 .component{
   margin-bottom: 0.25rem;
 }
</style>