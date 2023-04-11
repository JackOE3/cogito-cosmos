<script lang="ts">
  import { formatResourceName, formatWhole } from '@gamelogic/utils'
  import { resource } from '@store/primitive'
  import type { IUnlock, unlockType } from '@store/primitive/unlocks'

  export let data: IUnlock
  export let rect: DOMRect

  $: costColor = $resource[data.resource] > data.cost ? 'rgb(102, 255, 102)' : 'rgb(255, 102, 102)'

  const background: Record<unlockType, string> = {
    Boost: 'linear-gradient(to top, var(--Gray400) 20%, white 80%)',
    Unlock: 'linear-gradient(0deg, yellow 20%, rgba(255,251,125,1) 80%',
    Mechanic: 'green',
    Affix: 'blue',
  }
</script>

<div id="window" style="top: {rect.top}px; left: {rect.right + 8}px;">
  <span id="title">{data.title}</span>
  <hr />
  <span id="description">{@html data.description}</span>
  <span id="tooltip">{@html data.tooltipText}</span>

  <div style="display: flex; flex-direction:row; justify-content: space-between; margin-top: 4px ">
    <div id="type" style="background:{background.Boost}">{data.type}</div>
    <div id="cost" style="color:{costColor}">{formatWhole(data.cost)} {formatResourceName(data.resource)}</div>
  </div>
</div>

<style>
  * {
    --width: 300px;
    --padding: 12px;
  }
  #window {
    position: relative;
    background: radial-gradient(var(--Gray900), var(--background-color));
    border: 1px var(--color) solid;
    box-shadow: 4px 4px 4px black;

    width: var(--width);
    height: max-content;
    /* border: 1px solid var(--secondary); */
    padding: var(--padding);
    position: absolute;
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 0rem;
    /*     box-shadow: 4px 4px var(--Gray900); */
  }
  hr {
    width: 250px;
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, transparent, rgba(var(--color-rgb), 0.75), transparent);
  }
  #title {
    font-size: 14px;
  }
  #type {
    font-weight: bold;
    width: max-content;
    border-radius: 4px;
    color: black;
    outline: 1px solid black;
    border: 1px solid var(--Gray500);
    padding: 2px;
  }
  #description {
    margin-bottom: 8px;
  }
  #tooltip {
    opacity: 0.6;
    font-style: oblique;
    text-align: right;
    margin-bottom: 4px;
    margin-left: 20px;
  }
  #cost {
    align-self: flex-end;
    font-weight: bold;
    text-align: right;
  }
</style>
