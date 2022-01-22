<script lang="ts">
  import { onMount } from 'svelte';
  import { logQueue, addLogEntry } from '../gamelogic/log';

  let blockTransitions = true

  onMount(() => {
    setTimeout(() => {
      blockTransitions = false
    }, 100)
  })
 

  function fadingIn(node: HTMLElement, {duration}) {
    const o = +getComputedStyle(node).opacity;
    if(blockTransitions) return

    return {
      duration,
      css: (t: number) => `opacity: ${t * o}` // t goes from 0 to 1
    }
  }
</script>

<div id="storyBook">
  {#each $logQueue as log}
    <div class="story" in:fadingIn={{duration: 1000}}>{log.entry}</div>
  {/each}
</div>

<style>
  #storyBook {
    display: flex;
    flex-direction: column;
    width: inherit;
    font-size: 0.9em;
    /*border: 2px solid black;*/
  }
  .story {
    background-color: transparent;
    display: flex;
    align-items: center;
    border: 2px white;
    padding-left:10px;
    margin-bottom:8px;
    border-style: none none none solid;
  }
  
</style>