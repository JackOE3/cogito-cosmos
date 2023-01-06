<script lang="ts">
  import { onMount } from "svelte";
  import { formatNumber, formatWhole, noRef } from "../gamelogic/utils";
  import ProgBarTask from './ProgBarTask.svelte';
  import InputRange from './InputRange.svelte'
  import { fade, slide } from "svelte/transition";
  import TableComponent from "./TableComponent.svelte";
  import { tooltip } from "./tooltips/tooltip";
  import UpgradeTooltip from "./tooltips/UpgradeTooltip.svelte";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import { addLogEntry, logQueue } from "../gamelogic/log";
  import { story } from "../stores/Story";

  // return false if key is 'Enter'
  window.document.onkeydown = (e: KeyboardEvent) => e.key !== 'Enter'

  let LORCA_OVERRIDE = false


  enum Idea {
    AUTO_THINK = 1,
    THINK_FASTER,
    THINK_MULTIPLIER,
    CHEESE,
    CHEESE_MONSTER,
    CHEESE_MONSTER_UPGRADE,
    CHEESE_MONSTER_MODE
  }
  enum Upgrade {
    THOUGHT_CAP,
    UNLOCK_CHEESE_QUEUE,
    CHEESE_YIELD,
    MOLDY_CHANCE,
    FASTER_CHEESE
  }


  let thoughts = 0
  let thoughtsPerSec = 0
  $: thoughtsPerSecEff = thoughtsPerSec * thoughtsBonus
  let thoughtsCap = 100
  let thoughtsCapDelta = 300
  let thoughtsCapCost = 10 // in cheese
  let thoughtsToNextIdea = [5, 10, 12, 50, 100, 1000, 50000]

  let thinkFasterCost = 10
  let thinkFasterCostMult = 1.2
  let thinkFasterPerSec = 1
  
  let ideas = 0

  let cheese = 0
  let moldyCheese = 0
  let moldyChance = 0.03
  
  let lastRunTime = Date.now()
  let lastSecond = Date.now()
  let deltaT = 0
  const GAME_INTERVAL = 200
  let devToolsEnabled = true

  onMount(() => {
    window.addEventListener('keypress', (e) => {
      if (e.key === "f") LORCA_OVERRIDE = !LORCA_OVERRIDE
    })
    
    window.addEventListener('keypress', (e) => {
      if (e.key === "g") devToolsEnabled = !devToolsEnabled
    })
 
    setInterval(() => {
      let currentTime = Date.now()
      if(currentTime - lastSecond >= 1000) lastSecond = currentTime

      deltaT = Math.max(Math.min((currentTime - lastRunTime) / 1000, 1), 0)
      lastRunTime = currentTime
      gameUpdate(deltaT, currentTime)

    }, GAME_INTERVAL)
  })

  function gameUpdate(deltaT: number, currentTime: number) {
    thoughts += thoughtsPerSec * thoughtsBonus * deltaT


    
  }


  let thoughtsBonus = 1
  let thoughtsBonusMax = 1
  let thoughtsBonusDuration = 1500
  let thoughtsBonusDecay = 3000
  const FPS = 60
  let thoughtsBonusIntervalId: number
  let thoughtsBonusTimeoutId: number
  
  function handleThink() {
    thoughts += 1
    if (thoughtsBonusMax === 1) return
    thoughtsBonus = thoughtsBonusMax
    clearInterval(thoughtsBonusIntervalId)
    clearTimeout(thoughtsBonusTimeoutId)
    
    // if clicked, set multiplier, which expires after a time and starts decaying
    thoughtsBonusTimeoutId = setTimeout(() => {    
      thoughtsBonusIntervalId = setInterval(() => {
        console.log("z") 
        // decrement evenly over {thoughtsBonusDecay} milliseconds
        thoughtsBonus -= (thoughtsBonusMax - 1)/(thoughtsBonusDecay) * FPS
        if (thoughtsBonus < 1) {
          // spooky
          clearInterval(thoughtsBonusIntervalId)
          thoughtsBonus = 1
        }
      }, 1000/FPS)
    }, thoughtsBonusDuration)
  }


  function thinkFaster() {
    if (thoughts < thinkFasterCost) return
    thoughts -= thinkFasterCost
    thinkFasterCost *= thinkFasterCostMult
    thoughtsPerSec += thinkFasterPerSec
  }


  let ideaText = [
    "Learn to think passively",
    "Unlock thought acceleration",
    "Unlock thought boost",
    "Unlock switzerland"]

</script>

<div class="container">
  {#if devToolsEnabled}
  <!-- in future have this in a separate component and access the variables thru their stores -->
    <div id="devTools">
      <div id="devControls">
        <h1>Developer Tools</h1>
        <label for="DEV-ideas">change idea count</label>
        <input id="DEV-ideas" type="number" min=0 step=1 bind:value={ideas}>
    
        <span>add thoughts</span>
        <div style="display:flex;">
          <button on:click={() => thoughts += 1}>+1</button>
          <button on:click={() => thoughts += 10}>+10</button>
          <button on:click={() => thoughts += 100}>+100</button>
          <button on:click={() => thoughts += 1000}>+1K</button>
        </div>
    
        <span>add cheese</span>
        <div style="display:flex;">
          <button on:click={() => cheese += 1}>+1</button>
          <button on:click={() => cheese += 10}>+10</button>
          <button on:click={() => cheese += 100}>+100</button>
          <button on:click={() => cheese += 1000}>+1K</button>
        </div>
    
        <span>add moldy cheese</span>
        <div style="display:flex;">
          <button on:click={() => moldyCheese += 1}>+1</button>
          <button on:click={() => moldyCheese += 10}>+10</button>
          <button on:click={() => moldyCheese += 100}>+100</button>
          <button on:click={() => moldyCheese += 1000}>+1K</button>
        </div>
    
    
      </div>
    </div>
  {/if}
  
  <div id="thoughtComponent">
    <h1>cogito ergo otiosus</h1>

    <span>You thought {formatNumber(thoughts,2)} times</span>

    {#if ideas >= Idea.AUTO_THINK || LORCA_OVERRIDE}
      <span class:red={thoughtsBonus > 1}>
        ({formatNumber(thoughtsPerSec * thoughtsBonus,2)}/s)
      </span>
    {/if} 

    {#if ideas >= Idea.THINK_MULTIPLIER}
      <button on:click={handleThink}>
          thought boost <span class="iconify" data-icon="icon-park-outline:brain"/><br>
          x2 thoughts/s
      </button>
    {:else}
      <button on:click={handleThink}>
        think <span class="iconify" data-icon="icon-park-outline:brain"/><br>
        +1 thought 
      </button>
    {/if}

    <span>Test</span>
    <button on:click={()=>{}}>
      cogito ergo sum <br>
      {ideaText[ideas]} <br>
      Costs {thoughtsToNextIdea[ideas]} thoughts
    </button>


    {#if ideas >= Idea.THINK_FASTER || LORCA_OVERRIDE}
      <button 
        on:click={thinkFaster} 
        class:disabled={thoughts < thinkFasterCost} 
        transition:slide={{duration: 500}}
        use:tooltip={{
          content: UpgradeTooltip,
          data: {
            desc: "Increase your rate of thinking.",
            effects: [`+${thinkFasterPerSec} thoughts/s`],
            costs: [`${formatNumber(thinkFasterCost,2)} thoughts`]
          }
        }}
      >
        thought acceleration <span class="iconify" data-icon="fa-solid:angle-double-up"/><span class="iconify" data-icon="icon-park-outline:brain"/><br>
      </button>

    {/if}
   
  </div>

  {#if ideas >= Idea.CHEESE || LORCA_OVERRIDE}
    <div id="cheeseComponent" transition:slide={{duration: 500}}>
      <h1>switzerland simulator</h1>
      
      

      
    </div>
  {/if}

  
  
</div>

<style>
  .container {
    display: flex;
    align-items: flex-start;
    gap: 28px;
    margin-right: 16px;
    margin-left: 16px; 
  }
 
  .disabled{
    opacity: var(--medium-emphasis);
    /* pointer-events: none; */
    cursor: default;
  }
  button {
    background-color: var(--Gray600);
    color: white
  }
  #thoughtComponent {
    width: 300px;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    background-color: var(--Gray800);
    box-shadow: 0 0 4px .25px black;
    padding: 16px;
    /*border-radius: 8px;*/
  }
  
  .container h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: normal;
    text-align: left;
  }
  
  .ideaBar {
    height: 2rem;
    display: grid;
    grid-template-columns: auto 2rem;
    column-gap: 0.5rem;
  }
  .cheeseBar {
    height: 2rem;
    display: grid;
    grid-template-columns: 2rem auto 2rem;
    column-gap: 0.5rem;
  }
  .monsterBar {
    height: 2rem;
    display: grid;
    grid-template-columns: 2rem auto;
    column-gap: 0.5rem;
  }
  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .iconify { 
    transition: transform 0.2s ease-in;
	}
  [aria-expanded=true] .iconify {
     transform: rotate(0.25turn); 
  }
  .red {
    color: green
  }

  #devTools {
    position: absolute;
    right: 0;
    top: 24px;
    background-color: rgb(0,0,0,.8);
  }
  #devTools > #devControls {
    margin: 24px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>