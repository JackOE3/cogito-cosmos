<script lang="ts">
  export let title = 'Effects'
</script>

<div id="effectContainer" class="theme-border">
  <div id="effectHeader">
    <span style="text-align:center">{title}</span>
    <hr />
  </div>
  <div id="effectBody">
    <slot />
  </div>
</div>

<style>
  #effectContainer {
    width: var(--width, 300px);
    min-height: max-content;
    height: var(--height, 100%);
    background-color: var(--Gray800);
    overflow: hidden;
    box-sizing: border-box;
  }
  #effectHeader {
    width: 100%;
    margin-top: 0.5rem;
    text-align: center;
  }
  #effectBody {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
  }

  #effectContainer hr {
    width: 200px;
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, var(--Gray800), rgba(255, 255, 255, 0.75), var(--Gray800));
  }
</style>
