<script lang="ts">
  import { formatWhole, formatResourceName } from '../gamelogic/utils'
  import { upgrades, resource, LORCA_OVERRIDE } from '../stores/mainStore'
  import { tooltip } from './tooltips/tooltip'
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import { derived, get } from 'svelte/store'

  export let upgradeName: string
  export let tooltipText: string | null = null
  export let buyMaxUpgrades = false
  export let btnUnlocked = true

  const resourceName = get(upgrades)[upgradeName].resource
  const cost = derived(upgrades, $upgrades => $upgrades[upgradeName].cost)
  const canAfford = derived(resource, $resource => $resource[resourceName] >= get(cost))
  const isMaxed = derived(upgrades, $upgrades => {
    const maxBuy = $upgrades[upgradeName].maxBuy
    return maxBuy !== null && $upgrades[upgradeName].bought >= maxBuy
  })

  // beforeUpdate(() => console.log('beforeUpdate'))

  function buyUpgrade(): void {
    upgrades.buy(upgradeName, buyMaxUpgrades)
    /* upgrades.update($upgrades => {
      $upgrades[upgradeName].buy(buyMaxUpgrades)
    } )
    */
  }
</script>

{#if btnUnlocked || $LORCA_OVERRIDE}
  <button
    on:click={buyUpgrade}
    disabled={!$canAfford || $isMaxed}
    use:tooltip={{ content: SimpleTooltip, data: tooltipText }}
    class="btn"
    class:maxed={$isMaxed}
  >
    <slot />
    <br />
    Costs {formatWhole($cost)}
    {formatResourceName(resourceName)}
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
