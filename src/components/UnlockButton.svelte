<script lang="ts">
  import { formatWhole } from '../gamelogic/utils';
  import {upgradesBought, unlocked} from '../stores/mainStore'
  import {resource} from '../stores/mainStore'
  import { tooltip } from "./tooltips/tooltip";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'


  export let unlock: Unlock
  export let tooltipText: string = null
  export let btnUnlocked: boolean = true

  type Unlock = {
    name: string
    resource: string,
    cost: number,
  }
  
  function unlockFeature() {
    let cost: number = unlock.cost
    if ($resource[unlock.resource] < cost) return
    $resource[unlock.resource]  -= cost
    $unlocked[unlock.name] = true
  }


</script>


{#if btnUnlocked}
  <button on:click={unlockFeature} 
    disabled={$unlocked[unlock.name] || $resource[unlock.resource] < unlock.cost} 
    use:tooltip={{content: SimpleTooltip, data: tooltipText}}
    class="btn" class:unlocked={$unlocked[unlock.name]}
  >
    <slot/> 
    <br>
    <span>Costs {formatWhole(unlock.cost)} {unlock.resource}</span>
  </button>
{:else}
  <button class="btn" disabled>???</button>
{/if}

<style>
  .btn {
    min-height: 50px;
    height: fit-content;
    background: var(--btn-bg, var(--Gray800));
    position: relative;   
  }
  .cost {
    width: 100%;
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translate(-50%);
  }

  .unlocked {
    outline: 1px var(--unlockedColor, white) solid;
    background-color: black;
    color: var(--unlockedColor, white);
  }
</style>