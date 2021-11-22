<script>
import ProgBar from './ProgBar.svelte'
import {formatNumber, formatWhole} from '../gamelogic/utils.js'
import {strColor, spdColor, endColor} from '../constants.js'
export let stat

// capitalize 1st letter of label
let label = stat.name.charAt(0).toUpperCase() + stat.name.slice(1)

$: bonus = (stat.active) ? stat.perAction : 0

// assign color to label according to stat type
let textColor = strColor
if (stat.name === "speed") textColor = spdColor
if (stat.name === "endurance") textColor = endColor
</script>

<div class="container">
  <div class="row">
    <div class="col">
      <span class="text">You have <b style="color: {textColor}">{stat.points} {label}</b> points.</span>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <span>+{formatNumber(stat.expPerSec + bonus, 2)}/s</span>
    </div>
  </div>
  <div class="row">
    <span class="bar">
      <ProgBar 
      --width = 20rem
      --height = 1.5rem 
      --progress = "{100*stat.exp/stat.expToNextPoint}%"
      --barColor = "{textColor}">
      {formatNumber(stat.exp,2)}/{formatWhole(stat.expToNextPoint)}
    </ProgBar>
    </span>
  </div>
  <div class="row">
    <button class="btn mdc-elevation--z4" class:active={stat.active}
      on:click={() => {
      stat.active = !stat.active;
      }}>{stat.action}
    </button>
  </div>

</div>



<style>
  .container {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    
  }
  .col {
    margin: auto
  }
  .btn {
    width: 60%;
    margin: 0
  }
  .active{
   color: white;
 }
 
 

 

</style>