<script lang="ts">
  import { formatWhole, formatResourceName } from '../gamelogic/utils'
  import { upgrades, resource, LORCA_OVERRIDE } from '../stores/mainStore'
  import { tooltip } from './tooltips/tooltip'
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import { derived, get } from 'svelte/store'
  import { fade } from 'svelte/transition'

  export let upgradeName: string
  export let tooltipText: string | null = null
  export let buyMaxUpgrades = false
  export let btnUnlocked = true

  const resourceName = get(upgrades)[upgradeName].resource
  const cost = derived(upgrades, $upgrades => $upgrades[upgradeName].cost)
  const canAfford = derived(resource, $resource => $resource[resourceName] >= get(cost))
  const maxBuy = derived(upgrades, $upgrades => $upgrades[upgradeName].maxBuy)
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
    class:disabled={!$canAfford}
    use:tooltip={{ Component: SimpleTooltip, data: tooltipText }}
    class:maxed={$isMaxed}
    transition:fade={{ duration: 1000 }}
  >
    <div style="display:grid; grid-template-rows: auto 14px; height: 100%">
      <div id="text">
        <slot />
      </div>
      <div id="cost">
        {#if !$isMaxed}
          {formatWhole($cost)}
          {formatResourceName(resourceName)}
        {/if}
      </div>
    </div>

    <div id="boughtContainer">
      {#if $maxBuy !== null}
        {#if $isMaxed}
          MAX
        {:else}
          {$upgradesBought}/{$maxBuy}
        {/if}
      {:else}
        {$upgradesBought}
      {/if}
    </div>
  </button>
{:else}
  <button disabled>???</button>
{/if}

<style>
  #text {
    height: 100%;
    padding-left: 4px;
    padding-right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #cost {
    z-index: 0;
    height: max-content;
    display: flex;
    flex-direction: row;
    justify-content: center;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(0, 0, 0, 0.2);

    /* background-color: rgba(8, 248, 0, 0.4);
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, transparent 40%); */
  }
  #boughtContainer {
    position: absolute;
    right: -2px;
    bottom: -2px;
    height: max-content;
    min-width: 24px;
    width: max-content;
    padding: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0%;
    background-color: var(--themeColor1);
    outline: 1px solid rgba(0, 0, 0, 0.6);
    border-top: 2px solid rgba(255, 255, 255, 0.6);
    border-left: 2px solid rgba(255, 255, 255, 0.6);
    border-bottom: 2px solid rgba(0, 0, 0, 0.6);
    border-right: 2px solid rgba(0, 0, 0, 0.6);
    border-top-left-radius: 8px;
  }
  button {
    min-height: 50px;
    height: 60px;
    width: 200px;
    position: relative;
    padding: 0px;
  }

  button.disabled {
    opacity: var(--disabled); /* override */
  }
  button:not(.disabled):hover {
    /*  outline: 1px solid white; */
    background-color: var(--Gray600);
  }

  .maxed {
    background: linear-gradient(to bottom, var(--themeColor1), rgba(0, 0, 0, 0.6));
    color: var(--themeColor2, white);
    pointer-events: none;

    border-left: var(--themeColor2);
    border-right: var(--themeColor1);
    border-top: var(--themeColor2);
    border-bottom: var(--themeColor1);
    border-width: 2px;
    border-style: solid;
  }
</style>
