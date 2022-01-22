<script lang="ts">
  import type {Building} from '../stores/Buildings'
  import {resourceStore} from '../stores/Resources'
  import { get } from 'svelte/store';
  import { tooltip }from './tooltips/tooltip'
  import BuildingTooltip from './tooltips/BuildingTooltip.svelte'
  export let building: Building

  function purchaseBuilding() {
    //TODO: Is it really necessary to run the loop forEach 2 times here?
    let affordable: boolean[] = []
    let i = 0
    building.cost.forEach(cost => {
      affordable[i] = false
      //get better here because you dont need subscribe to the store?
      if(get(resourceStore)[cost.resourceType].amount >= cost.amount) {
        affordable[i] = true
      }
      i++
    })

    // checks if all entries are true, if yes then makes the purchase
    if(affordable.every(Boolean)) {
      building.cost.forEach(cost => {
        $resourceStore[cost.resourceType].amount -= cost.amount
        cost.amount *= cost.multiplier
      })
      building.level++
    }
  }

</script>

<button class="building" on:click={purchaseBuilding} 
  use:tooltip={{content: BuildingTooltip, data: building.buildingType}}>
  <div class="right">
    LVL {building.level}
  </div>
  <div class="center">
    {building.name}
  </div>
</button>

<style>
  .building {
    width: 240px;
    margin-bottom: 0.5rem;
    color: white;
    background-color: var(--Gray900);
    text-align: center;
    position: relative;
  }
  .building div  {
    display: inline-block;
  }
  .center {
   position: absolute;
   left: 0;
   right: 0
  }
  .right {
    scale: .75;
    float: right
  }
</style>