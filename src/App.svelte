<script>
  import { onMount } from 'svelte';

  import {str} from './stores/MainStatStore'
	import ProgBar from './components/ProgBar.svelte'
	import Tabs from './components/Tabs.svelte'
  import MainStat from './components/MainStat.svelte'

	let items = ['Tab1', 'Tab2', 'Tab3', 'Tab4']
	let activeItem = items[0]
  const tabChange = (e) => {
    activeItem = e.detail;
  } 
  const TICKSPEED = 500
  
  onMount(() => {
    console.log("App mounted")
    const interval = setInterval(() => {

      if ($str.active) $str.exp += $str.perAction
      $str.exp += $str.expPerSec
      if ($str.exp >= $str.expToNextPoint){
        let surplus = $str.expToNextPoint - $str.exp
        $str.exp = 0 + surplus
        $str.expToNextPoint *= $str.multiplier
      }
      
    }, TICKSPEED)
    return () => clearInterval(interval)
  })
    
</script>

<main>
	<Tabs {items} {activeItem} on:tabChange={tabChange}/>
  {#if activeItem === 'Tab1'}
  <div class="display">

    <div class="mainStats">
      <h1>Resources</h1>
      <MainStat stat={$str}/>
    </div>

  </div>
    
    
  {:else}
  <p>Another tab.</p>
  {/if}
	
</main>

<style>
	main {
		max-width: 80%;
		margin: auto;
	}
  h1 {
    font-size: 20px;
    text-align: center;
  }
  .display {
    display:flex;
    align-items: flex-start;
    justify-content: center;
    margin-bottom: 20px
    
  }
  .mainStats {
    width: min-content;
    margin: 0 10px;
    
  }
 

</style>