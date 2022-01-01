<script lang="ts">
  import { get } from 'svelte/store';
  import {formatNumber, formatWhole} from '../gamelogic/utils.js'
  import ProgBar from './ProgBar.svelte'
  import {resourceStore} from '../stores/Resources'

  $: essence = $resourceStore[1]
</script>

<div id="character">
  <span>Character</span>

  <div id="hp">
    <span>HP</span>
    <ProgBar
    --width = 100%
    --height = 30px
    --barColor = #e60000
    --progress = "{100}%">
    5/5
    </ProgBar>
  </div>
  
  <div id="essence">
    <span>Essence</span>
    <ProgBar
    --width = 100%
    --height = 30px
    --barColor = #3385ff
    --progress = "{100*essence.amount/essence.maxAmount}%">
    {essence.amount}/{essence.maxAmount}
    </ProgBar>
  </div>


</div>

<style>
  #character {
    display: flex;
    flex-direction: column;
    width: 200px;
    margin: 0 20px;
    /*border: 2px solid black;*/
  }
  #essence, #hp {
    display: flex;
    flex-direction: column;
    text-align: center;
  }
   
</style>