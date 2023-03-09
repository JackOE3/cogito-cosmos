<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'

  let container: HTMLElement
  let element: HTMLElement
  let label: HTMLElement

  const dispatch = createEventDispatcher()

  onMount(() => {
    // 'animationiteration' triggers every time the animation completes an iteration
    element.addEventListener('animationiteration', listener, false)
    // let the barLabel "inherit" the width from the container
    label.style.width = window.getComputedStyle(container).getPropertyValue('width')
  })
  onDestroy(() => {
    element.removeEventListener('animationiteration', listener, false)
  })

  function listener(): void {
    // console.log(e.target, element)
    dispatch('completed')
  }
</script>

<div id="outerContainer" bind:this={container}>
  <div id="innerBar" bind:this={element}>
    <span id="barLabel" bind:this={label}>
      <slot />
    </span>
  </div>
</div>

<style>
  #outerContainer {
    background: var(--barBgColor, var(--Gray800));
    height: var(--height);
    width: var(--width, 4rem);
    border-radius: 0.2rem;
    overflow: hidden;
    position: relative;
  }
  #innerBar {
    background-color: var(--barColor, var(--secondary));
    height: inherit;
    width: 0;
    border-radius: inherit;
    animation: linear var(--duration, 1s) infinite doTask var(--playState);
  }
  #barLabel {
    display: flex;
    height: inherit;
    justify-content: center;
    align-items: center;
  }
  @keyframes doTask {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
</style>
