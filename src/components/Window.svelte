<script lang="ts">
  export let title: string = ""
</script>


<div class="container">
  <div class="header">
    <span class="windowTitle">{title}</span>
  </div>
  <div class="content">
    <slot/>
  </div>
</div>

<style>
  .content {
    width: fit-content;
    height: fit-content;
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