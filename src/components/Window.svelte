<script lang="ts">
  import { fade } from 'svelte/transition'

  export let title = ''
  export let themeColor1: string
  export let themeColor2: string

  const style = `--themeColor1: ${themeColor1}; --themeColor2: ${themeColor2};`
</script>

<div class="container " data-title={title} transition:fade={{ duration: 1000 }} {style}>
  <!-- <div class="header">
    <span class="windowTitle">{title}</span>
  </div> -->
  <div class="content">
    <slot />
  </div>

  <div class="corner" id="corner-top-right" />
  <div class="corner" id="corner-top-left" />
  <div class="corner" id="corner-bottom-right" />
  <div class="corner" id="corner-bottom-left" />
</div>

<style>
  .container {
    position: relative;
    width: max-content;
    height: max-content;
    /* box-shadow: 0 0 4px 0.25px black; */
    background-color: var(--Gray900);

    outline: 1px black solid;

    border-left: var(--themeColor2);
    border-right: var(--themeColor2);
    border-top: var(--themeColor1);
    border-bottom: var(--themeColor1);
    border-width: 2px;
    border-style: solid;
    border-radius: 4px;
    box-shadow: 0 0 5px 1px var(--themeColor1), inset 0 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  .content {
    width: var(--width, var(--window-width));
    /*  position: relative; */
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    padding: 16px;
    margin-top: 10px;

    /*border-radius: 8px;*/
  }
  .container::before {
    content: attr(data-title);
    position: absolute;
    bottom: calc(100% - 12px);
    left: 16%;
    width: 68%;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    text-shadow: 1px 1px 4px black;
    color: white;

    padding: 4px;
    background: linear-gradient(90deg, var(--themeColor1) 0%, var(--themeColor2) 100%);

    outline: 1px black solid;
    border-left: var(--themeColor2);
    border-right: var(--themeColor2);
    border-top: var(--themeColor2);
    border-bottom: var(--themeColor1);
    border-width: 2px;
    border-style: solid;
    border-radius: 0px;
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
  }
  /* .container::after {
    content: '';
    position: absolute;
    border-image: linear-gradient(90deg, rgb(129, 0, 204) 0%, rgb(182, 122, 255) 100%);
    border-image-width: 10px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  } */
  .corner {
    --size: 10px;
    z-index: 0;
    position: absolute;
    width: var(--size);
    height: var(--size);
    shape-rendering: geometricPrecision;
  }
  #corner-top-left {
    top: 0;
    left: 0;
    background: conic-gradient(from -45deg, var(--themeColor1), var(--themeColor2));
    border-bottom-right-radius: 10px;
    box-shadow: 1px 1px 0px 1px rgba(0, 0, 0, 0.4);
  }
  #corner-top-right {
    top: 0;
    right: 0;
    background: conic-gradient(from 45deg, var(--themeColor2), var(--themeColor1));
    border-bottom-left-radius: 10px;
    box-shadow: -1px 1px 0px 1px rgba(0, 0, 0, 0.4);
  }
  #corner-bottom-left {
    bottom: 0;
    left: 0;
    background: conic-gradient(from -135deg, var(--themeColor2), var(--themeColor1));
    border-top-right-radius: 10px;
    box-shadow: 1px -1px 0px 1px rgba(0, 0, 0, 0.4);
  }
  #corner-bottom-right {
    bottom: 0;
    right: 0;
    background: conic-gradient(from 135deg, var(--themeColor1), var(--themeColor2));
    border-top-left-radius: 10px;
    box-shadow: -1px -1px 0px 1px rgba(0, 0, 0, 0.4);
  }
</style>
