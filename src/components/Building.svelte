<script lang="ts">
  import type {Building} from '../stores/Buildings'
  import {gameModel} from '../gamelogic/gamemodel'
  import { get } from 'svelte/store';
  export let building: Building

  function purchaseBuilding() {
    //TODO: Is it really necessary to run the loop forEach 2 times here?
    let affordable: boolean[] = []
    let i = 0
    building.cost.forEach(cost => {
      affordable[i] = false
      //get better here because you dont need subscribe to the store?
      if(get(gameModel).saveData.resource[cost.resourceType].amount >= cost.amount) {
        affordable[i++] = true
      }
    })

    // checks if all entries are true, if yes then makes the purchase
    if(affordable.every(Boolean)) {
      building.cost.forEach(cost => {
        $gameModel.saveData.resource[cost.resourceType].amount -= cost.amount
        cost.amount *= cost.multiplier
      })
      building.level++
    }
  }

</script>

<!--TODO: make CSS beautiful-->
<div class="component">
  <b>{building.name}</b>
  <span>{building.level}</span>
  {#each building.cost as cost}
    <span>{cost.resourceType}: {cost.amount}--</span>
  {/each}
  
  <button on:click={purchaseBuilding}>Upgrade</button>
</div>