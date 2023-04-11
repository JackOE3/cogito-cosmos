<script lang="ts">
  import { formatWhole, formatResourceName } from '@gamelogic/utils'
  import { unlocked, resource, LORCA_OVERRIDE } from '@store'
  import { tooltip } from './tooltips/tooltip'
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import type { IUnlock, unlockType } from '@store'

  export let unlock: IUnlock
  // export let tooltipText: string | null = null
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

  const unlockTypeSymbol: Record<unlockType, string> = {
    static: '≡',
    dynamic: '≋',
    content: '✪',
  }
  const temp = unlock.type !== undefined ? unlockTypeSymbol[unlock.type] : ''
</script>

{#if !btnHidden}
  {#if btnUnlocked || $LORCA_OVERRIDE}
    <button
      on:click={unlockFeature}
      class:disabled={$unlocked[unlock.name] || $resource[unlock.resource] < unlock.cost}
      use:tooltip={{ data: unlock.tooltipText }}
      class:unlocked={$unlocked[unlock.name]}
      data-unlockType={temp}
    >
      <slot />
      <br />
      <span>Costs {formatWhole(unlock.cost)} {formatResourceName(unlock.resource)}</span>
    </button>
  {:else}
    <button class="btn" disabled>???</button>
  {/if}
{/if}

<style>
  button {
    min-height: 50px;
    height: fit-content;
    background: var(--Gray800);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  button:not(.disabled):hover {
    outline: 1px var(--unlockedColor, white) solid;
    background-color: black;
    color: var(--unlockedColor, white);
  }

  .unlocked {
    outline: 1px var(--unlockedColor, white) solid;
    background-color: black;
    color: var(--unlockedColor, white);
  }

  button::before {
    content: attr(data-unlockType);
    scale: 2;
    position: absolute;
    top: 2px;
    left: 5px;
  }
</style>
