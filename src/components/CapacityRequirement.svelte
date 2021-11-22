<script>
  import {strColor, spdColor, endColor} from '../constants.js'
  export let item
  
</script>

{#if item}
<span>
  +1 capacity at 
  <b style="color: {strColor}">{item[0]} STR</b>
  <b style="color: {spdColor}">{item[1]} SPD</b>
  <b style="color: {endColor}">{item[2]} END</b>
</span>
{:else}
<p>No more capacity available.</p>
{/if}
