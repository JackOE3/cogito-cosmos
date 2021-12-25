<script lang="ts">
  import ProgBar from './ProgBar.svelte'
  import type {Resource} from '../stores/Resources'
  export let workers
  export let resources: Resource[]
</script>




<div id="workers">
  <h1>Workers</h1>

  <div class="worker">
    <span><b>Skeletons</b></span>
    <ProgBar 
      --width = 15rem
      --height = 30px 
      --progress = "{100*workers[0].amount/workers[0].maxAmount}%">
      {workers[0].amount}/{workers[0].maxAmount}
    </ProgBar>
    Cost: {workers[0].cost.bones} bones, {workers[0].cost.essence} essence

    <button on:click={() => {
      if (resources[0].amount >= workers[0].cost.bones 
      && resources[1].amount >= workers[0].cost.essence
      && workers[0].maxAmount > workers[0].amount) {
        workers[0].amount += 1;
        resources[0].amount -= workers[0].cost.bones;
        resources[1].amount -= workers[0].cost.essence;
      }
      // TODO else: alert: you cant buy this
      }}>Summon</button>
  </div>
  
</div>

<style>
  h1 {
    font-size: 20px;
    text-align: center;
  }
  #workers {
    width: min-content;
    margin: 0 20px;
    /*border: 1px solid black;*/
  }
</style>