<script lang="ts">
  export let title = 'Affixes'
</script>

<div id="affixContainer" class="themeBorder">
  <div id="affixHeader">
    <span style="text-align:center">{title}</span>
    <hr />
  </div>
  <div id="affixBody">
    <slot />
  </div>
</div>

<style>
  #affixContainer {
    width: 100%;
    min-height: max-content;
    background-color: var(--Gray800);
  }
  #affixHeader {
    width: 100%;
    margin-top: 0.5rem;
    text-align: center;
  }
  #affixBody {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    padding-bottom: 0.5rem;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
  }

  #affixContainer hr {
    width: 200px;
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, var(--Gray800), rgba(255, 255, 255, 0.75), var(--Gray800));
  }
</style>
