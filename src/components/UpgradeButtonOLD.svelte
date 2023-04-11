<script lang="ts">
  import { formatWhole, formatResourceName } from '../gamelogic/utils'
  import { upgrades, resource, LORCA_OVERRIDE } from '@store'
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
  const upgradesBought = derived(upgrades, $upgrades => $upgrades[upgradeName].bought)

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
    use:tooltip={{ data: tooltipText }}
    class:maxed={$isMaxed}
    data-after={$isMaxed ? 'MAX' : $upgradesBought}
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
  button {
    min-height: 50px;
    height: fit-content;
    position: relative;

    /* background-image: linear-gradient(to bottom, rgba(49, 49, 49, 0.5), rgba(0, 0, 0, 0.5)),
      url('/assets/UI_Flat_Frame_02_Horizontal.png'); */
    outline: 1px solid rgba(0, 0, 0, 0.6);
  }
  button::after {
    content: attr(data-after);
    position: absolute;
    top: -5px;
    right: -5px;
    padding: 4px;
    background-color: black;
    border: 1px solid white;

    border-radius: 10px;
  }
  button::before {
    content: '';
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 2px;
    right: 2px;

    border-left: rgba(0, 0, 0, 0.6);
    border-right: rgba(0, 0, 0, 0.6);
    border-top: rgba(26, 26, 26, 0.6);
    border-bottom: rgba(26, 26, 26, 0.6);
    border-width: 1px;
    border-style: solid;
  }
  button:hover::before {
    border-left: rgb(182, 122, 255);
    border-right: rgb(182, 122, 255);
    border-width: 1px;
    border-style: solid;
  }
  .maxed {
    border: 1px var(--maxedColor, white) solid;
    background-color: black;
    color: var(--maxedColor, white);
  }
</style>
