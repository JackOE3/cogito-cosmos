<script>
import {str, spd, end, capacity} from '../stores/MainStatStore'
export let exercise

// capitalize 1st letter
let label = exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)

const clickPlus = () => {
  if ($capacity === 0) return
  exercise.amount += 1
  $capacity -= 1
  for (var key of Object.keys(exercise.expPerSec)) {
    if (key === "str") $str.expPerSec += exercise.expPerSec[key]
    if (key === "spd") $spd.expPerSec += exercise.expPerSec[key]
    if (key === "end") $end.expPerSec += exercise.expPerSec[key]
  }
  
}
const clickMinus = () => {
  if(exercise.amount === 0) return
  exercise.amount -= 1
  $capacity += 1
  for (var key of Object.keys(exercise.expPerSec)) {
    if (key === "str") $str.expPerSec -= exercise.expPerSec[key]
    if (key === "spd") $spd.expPerSec -= exercise.expPerSec[key]
    if (key === "end") $end.expPerSec -= exercise.expPerSec[key]
  }
}

</script>


<div class="container">
  <div class="btn-group">
    <button class="mdc-elevation--z2" on:click={clickPlus}>+</button>
    <button class="mdc-elevation--z2" on:click={clickMinus}>-</button>
  </div>
  <span>{label}:</span>
  <span>{exercise.amount}</span>
</div>


<style>
  .btn-group button {
    float: left;
  }

  .btn-group button:not(:last-child) {
    border-right: none; /* Prevent double borders */
  }
  .container {
    display:flex;
    justify-content: start;
    flex-direction: columns;
  }
  .container span {
    margin-left: 10px;
  }
</style>
