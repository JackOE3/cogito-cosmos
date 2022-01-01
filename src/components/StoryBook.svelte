<script lang="ts">
  import { get } from 'svelte/store';
  import { currentActionSet, storyBookStore, ActionSet } from '../stores/Actions'
  import { story } from '../stores/Story'

  let blockTransitions = false
  let lastActionSet: ActionSet

    // when you switch the action set, block all transitions for 100ms
  $: {
    if($currentActionSet !== lastActionSet) {
      blockTransitions = true
      setTimeout(() => {
        blockTransitions = false
      }, 100)
      lastActionSet = get(currentActionSet)
    }
  }

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
  {#each $storyBookStore[$currentActionSet] as paragraphId}
    <div class="story" in:fadingIn={{duration: 1000}}>{story[$currentActionSet][paragraphId]}</div>
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