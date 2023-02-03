<script lang="ts">
  import { formatWhole } from '../gamelogic/utils'
  import { upgrades } from '../stores/mainStore'
  import { resource } from '../stores/mainStore'
  import { tooltip } from './tooltips/tooltip'
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import { derived, get } from 'svelte/store'
  import { afterUpdate, beforeUpdate } from 'svelte'

  export let upgradeName: string
  export let tooltipText: string = null
  export let buyMaxUpgrades: boolean = false
  export let btnUnlocked: boolean = true

  const resourceName = get(upgrades)[upgradeName].resource
  const cost = derived(upgrades, ($upgrades) => $upgrades[upgradeName].cost)
  const canAfford = derived(
    resource,
    ($resource) => $resource[resourceName] > get(cost)
  )
  const isMaxed = derived(
    upgrades,
    ($upgrades) =>
      $upgrades[upgradeName].maxBuy !== null &&
      $upgrades[upgradeName].bought >= $upgrades[upgradeName].maxBuy
  )

  const formatResourceName = (name: string) => {
    if (name == 'moldyCheese') return 'moldy cheese'
    return name
  }

  beforeUpdate(() => console.log('beforeUpdate'))
</script>

{#if btnUnlocked}
  <button
    on:click={() => upgrades.buy(upgradeName, buyMaxUpgrades)}
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
