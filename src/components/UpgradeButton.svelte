<script lang="ts">
  import { formatWhole } from '../gamelogic/utils';
  import {upgradesBought} from '../stores/mainStore'
  import {resource} from '../stores/mainStore'
  import { tooltip } from "./tooltips/tooltip";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'


  export let upgrade: Upgrade
  export let tooltipText: string = null
  export let buyMaxUpgrades: boolean = false
  export let btnUnlocked: boolean = true

  type Upgrade = {
    name: string
    resource: string,
    cost: number,
    costMultiplier: number
    maxBuy: number
  }

  function purchaseUpgrade() {
    if ($resource[upgrade.resource] < upgrade.cost) return
    if (!buyMaxUpgrades) {
      // PURCHASE SINGLE:
      $resource[upgrade.resource]  -= upgrade.cost
      upgrade.cost *= upgrade.costMultiplier
      $upgradesBought[upgrade.name]++
    } else {
      // PURCHASE MAX:
      const cost = upgrade.cost
      const costMult = upgrade.costMultiplier
      // used formulas for geometric series (because of the exponential cost curve of the upgrades)
      const numUpgradesAffordable = Math.floor(Math.log($resource[upgrade.resource] / cost * (costMult - 1) + 1) / Math.log(costMult))
      const totalPrice = cost * (Math.pow(costMult, numUpgradesAffordable) - 1) / (costMult - 1)

      $resource[upgrade.resource] -= totalPrice
      upgrade.cost *= Math.pow(costMult, numUpgradesAffordable)
      $upgradesBought[upgrade.name] += numUpgradesAffordable
      //alert("Upgrades affordable: " + numUpgradesAffordable + ", Total Prize: " + totalPrice)
    } 
  }
</script>

{#if btnUnlocked}
  <button on:click={purchaseUpgrade} 
    disabled={$resource[upgrade.resource] < upgrade.cost || $upgradesBought[upgrade.name] >= upgrade.maxBuy}
    use:tooltip={{content: SimpleTooltip, data: tooltipText}}
    class="btn" class:maxed={$upgradesBought[upgrade.name] >= upgrade.maxBuy}
  >
    <slot/> 
    <br>
    Costs {formatWhole(upgrade.cost)} {upgrade.resource}
  </button>
{:else}
  <button disabled>???</button>
{/if}

<style>
  .btn {
    min-height: 50px;
    height: fit-content;
  }
  .maxed {
    border: 1px var(--maxedColor, white) solid;
    background-color: black;
    color: var(--maxedColor, white);
  }
</style>