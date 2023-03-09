<script lang="ts">
  import { fade } from 'svelte/transition'

  export let title = ''
</script>

<div class="container" transition:fade={{ duration: 1000 }}>
  <div class="header">
    <span class="windowTitle">{title}</span>
  </div>
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .container {
    width: max-content;
    height: max-content;
  }
  .content {
    width: max-content;
    height: max-content;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    padding: 12px;
    /*border-radius: 8px;*/
    position: relative;
  }
  .header {
    background: var(--bg);
  }
  .windowTitle {
    margin: 0;
    font-size: 1rem;
    font-weight: bold;
    align-self: center;
    text-shadow: 1px 1px 2px black;
  }
</style>
