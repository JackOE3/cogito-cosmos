<script lang="ts">
  import { formatNumber } from '../gamelogic/utils'
  import { fade } from 'svelte/transition'

  export let factor: number
  export let unlocked = true
</script>

{#if unlocked}
  <span class="affix" transition:fade={{ duration: 1000 }}>
    <slot>No Description</slot>
    [<span style="color:var(--themeColor2)">{formatNumber(factor, 2)}x</span>]
  </span>
{/if}

<style>
  .affix {
    position: relative;
    padding-left: 1rem;
  }
  .affix::before {
    content: '⯁ ';
    color: var(--themeColor2);
    position: absolute;
    top: -0.125rem;
    left: 0.125rem;
  }
</style>
