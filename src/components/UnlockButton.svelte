<script lang="ts">
  import { formatWhole, formatResourceName } from '../gamelogic/utils'
  import { unlocked, resource, LORCA_OVERRIDE } from '../stores/mainStore'
  import { tooltip } from './tooltips/tooltip'
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import type { IUnlock } from '../stores/unlocks'

  export let unlock: IUnlock
  export let tooltipText: string | null = null
  export let btnUnlocked = true
  export let btnHidden = false

  function unlockFeature(): void {
    const cost: number = unlock.cost
    if ($resource[unlock.resource] < cost) return
    $resource[unlock.resource] -= cost
    unlocked.update($unlocked => {
      $unlocked[unlock.name] = true
      return $unlocked
    })
    // $unlocked[unlock.name] = true
  }
</script>

{#if !btnHidden}
  {#if btnUnlocked || $LORCA_OVERRIDE}
    <button
      on:click={unlockFeature}
      disabled={$unlocked[unlock.name] || $resource[unlock.resource] < unlock.cost}
      use:tooltip={{ content: SimpleTooltip, data: tooltipText }}
      class="btn"
      class:unlocked={$unlocked[unlock.name]}
    >
      <slot />
      <br />
      <span>Costs {formatWhole(unlock.cost)} {formatResourceName(unlock.resource)}</span>
    </button>
  {:else}
    <button class="btn" disabled>???</button>
  {/if}
{:else}
  {''}
{/if}

<style>
  .btn {
    min-height: 50px;
    height: fit-content;
    background: var(--btn-bg, var(--Gray800));
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .unlocked {
    outline: 1px var(--unlockedColor, white) solid;
    background-color: black;
    color: var(--unlockedColor, white);
  }
</style>
