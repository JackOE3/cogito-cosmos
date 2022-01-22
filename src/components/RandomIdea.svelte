<script lang="ts">
  import { onMount } from "svelte";
  import { formatNumber, formatWhole, noRef } from "../gamelogic/utils";
  import { currentActionSet } from "../stores/Actions";
  import ProgBar from "./ProgBar.svelte";
  import Iconify from '@iconify/iconify';
  import ProgBarTask from './ProgBarTask.svelte';
  import InputRange from './InputRange.svelte'
  import { fade, slide } from "svelte/transition";
  import { writable } from "svelte/store";
  import TableComponent from "./TableComponent.svelte";
  import { tooltip } from "./tooltips/tooltip";
  import UpgradeTooltip from "./tooltips/UpgradeTooltip.svelte";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import { addLogEntry, logQueue } from "../gamelogic/log";
  import { story } from "../stores/Story";

  // return false if key is 'Enter'
  window.document.onkeydown = (e: KeyboardEvent) => e.key !== 'Enter'

  let LORCA_OVERRIDE = false

  const ResourceType = {
    THOUGHTS: "thoughts",
    CHEESE: "cheese",
    MOLDY_CHEESE: "moldy cheese",
    CHEESE_MONSTER: "cheese monster",
    CHEESE_BRAIN: "cheese brain",
  }
  enum Idea {
    BASIC_STATS = 1,
    AUTO_THINK,
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
  const upgradeUnlocked = new Array(Object.keys(Upgrade).length/2).fill(false)
  const unlockUpgrade = (id: number) => {upgradeUnlocked[id] = true}

  $: {
    // execute scope when one of these variables changes: cheese, moldyCheese
    if(!cheeseCreated && cheese) cheeseCreated = true
    if(!moldyCheeseCreated && moldyCheese) {
      addLogEntry(story[10])
      moldyCheeseCreated = true
    }

    if(!upgradeUnlocked[Upgrade.THOUGHT_CAP] && cheese >= 8) {
      addLogEntry(story[9])
      unlockUpgrade(Upgrade.THOUGHT_CAP)
    }
    if(!upgradeUnlocked[Upgrade.UNLOCK_CHEESE_QUEUE] && cheese >= 4) {
      unlockUpgrade(Upgrade.UNLOCK_CHEESE_QUEUE)
      addLogEntry(story[6])
    }
    if(!upgradeUnlocked[Upgrade.CHEESE_YIELD] && (cheese >= 5 && moldyCheese >= 1)) {
      addLogEntry(story[8])
      unlockUpgrade(Upgrade.CHEESE_YIELD)
    }
    if(!upgradeUnlocked[Upgrade.MOLDY_CHANCE] && (moldyCheese > 1 || cheese >= 30)) {
      addLogEntry(story[11])
      unlockUpgrade(Upgrade.MOLDY_CHANCE)
    }
  }
  $: {
    // execute scope when one of these variables changes: cheeseBrain

    if(!upgradeUnlocked[Upgrade.FASTER_CHEESE] && cheeseBrain >= 3) {
      addLogEntry(story[14])
      unlockUpgrade(Upgrade.FASTER_CHEESE)
    }
    if(!cheeseBrainCreated && cheeseBrain) {
      addLogEntry(story[13])
      cheeseBrainCreated = true
    }
  }
  $: if(!cheeseMonsterCreated && cheeseMonster.amount) cheeseMonsterCreated = true

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

  let cheeseCreated = false
  let moldyCheeseCreated = false
  let cheeseMonsterCreated = false
  let cheeseBrainCreated = false
  
  let thoughtsExtended = false
  let cheeseExtended = false
  let moldyCheeseExtended = false
  let cheeseMonsterExtended = false
  let cheeseBrainExtended = false

  let cheese = 0
  // 1 if it's active, 0 when not
  $: cheeseQueueActive = cheeseQueue.state === 'running' ? 1 : 0
  $: cheesePerSecFromQueue = (cheeseQueueActive * 1000 * cheeseQueue.yield/cheeseQueue.cycleDuration)
  $: cheesePerSecDisplayed = cheesePerSecFromQueue + cheesePerSec
  // these reactive values can be made into derived stores down the road
  $: cheesePerSec = 0 - (cheeseMonster.consumes.cheese * cheeseMonster.amount)
  let moldyCheese = 0
  let moldyChance = 0.03

  let cheeseBrain = 0

  function getResourceAmount(type: string) {
    switch(type){
      case ResourceType.THOUGHTS: return thoughts;
      case ResourceType.CHEESE: return cheese;
      case ResourceType.MOLDY_CHEESE: return moldyCheese;
      case ResourceType.CHEESE_MONSTER: return cheeseMonster.amount;
      case ResourceType.CHEESE_BRAIN: return cheeseBrain;
    }
    return 0
  }
  function addResourceAmount(type: string, amount: number){
    switch(type){
      case ResourceType.THOUGHTS: thoughts += amount; break
      case ResourceType.CHEESE: cheese += amount; break
      case ResourceType.MOLDY_CHEESE: moldyCheese += amount; break
      case ResourceType.CHEESE_MONSTER: cheeseMonster.amount += amount; break
      case ResourceType.CHEESE_BRAIN: cheeseBrain += amount; break
    }
  }
  const cheeseQueue = {
    unlocked: false,
    infinite: false,
    state: 'initial',
    current: 0,
    cap: 5,
    capDelta: 5,
    costUpgrade: 5,
    costUpgradeMult: 1.5,
    cycleDuration: 2000, // milliseconds
    yield: 1,
    cost: 20
  }
  const monsterQueue = {
    unlocked: false,
    infinite: false,
    state: 'initial',
    current: 0,
    cycleDuration: 3000, // milliseconds
    yield: 1,
    cost: {
      thoughts: 20,
      moldyCheese: 1
    }
  }
  let cheeseUpgrades = {
    [Upgrade.CHEESE_YIELD]: {
      label: "increase cheese yield",
      effectLabel() {
        return [`yield x${this.effect.yield}`, `duration x${this.effect.duration}`]
      },
      effect: {yield: 1.35, duration: 1.2},
      cost: [
        {resourceType: ResourceType.CHEESE, amount: 10},
        {resourceType: ResourceType.THOUGHTS, amount: 50}
      ],
      costMult: 1.2
    },
    [Upgrade.FASTER_CHEESE]: {
      label: "faster cheese generation",
      effectLabel() {
        return [`duration x${this.effect.duration}`, `cheese cost x${this.effect.cost}`]
      },
      effect: {cost: 1.2, duration: 0.9},
      cost: [
        {resourceType: ResourceType.CHEESE, amount: 50},
        {resourceType: ResourceType.CHEESE_BRAIN, amount: 5}
      ],
      costMult: 1.2
    },
    [Upgrade.MOLDY_CHANCE]: {
      label: "moldify cheese palette",
      effectLabel() {
        return [`moldy chance +${this.effect.moldyChancePlus}%`]
      },
      effect: {moldyChancePlus: 0.01},
      cost: [
        {resourceType: ResourceType.MOLDY_CHEESE, amount: 1},
        {resourceType: ResourceType.THOUGHTS, amount: 100}
      ],
      costMult: 1.2
    }
  }
  
  const cheeseMonster = {
    amount: 0,
    cost: {
      thoughts: 20,
      moldyCheese: 1
    },
    generates: {
      thoughts: 0.5
    },
    upgrade : {
      sentience: {
        lvl: 1,
        cost: {
          cheeseBrain: 10,
          thoughts: 200
        },
        mult: 1.5
      },
      hunger: {
        lvl: 1,
        cost: {
          cheeseBrain: 10,
          cheese: 50
        },
        mult: 1.5
      }
    },
    consumes: {
      cheese: 0.05
    },
    // 2 logistic curves superposed, 1st one determins behavior near x = 0 and 2nd one for large x.
    // needs to be a function for this-keyword to work (to get other properties)
    chanceToDie() {
      return (1/(1 + Math.exp(-this.lambda1 * (this.amount-this.offset)))) * (2/(1 + Math.exp(-this.lambda2 * this.amount)) - 1)
    },
    lambda1: 0.001,
    lambda2: 0.0005,
    offset: 500,
    chanceToStarve: 0.0,
    loot: {
      cheeseBrain: 1
    },
    brainMode: 2
  }

  type BrainMode = "peaceful" | "normal" | "hostile"
  // rough guesses here
  function handleCheeseMonsterBrainMode(type: BrainMode) {
    switch(type){
      case "peaceful": {
        cheeseMonster.lambda1 = 0.001
        cheeseMonster.lambda2 = 0.0001
        cheeseMonster.offset = 1000
        break
      }
      case "normal": {
        cheeseMonster.lambda1 = 0.001
        cheeseMonster.lambda2 = 0.0005
        cheeseMonster.offset = 500
        break
      }
      case "hostile": {
        cheeseMonster.lambda1 = 0.005
        cheeseMonster.lambda2 = 0.01
        cheeseMonster.offset = 100
        break
      }
    }
  }

  
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
    if (thoughts > thoughtsCap) thoughts = thoughtsCap

    cheese += cheesePerSec * deltaT
    //if (cheese > cheeseCap) cheese = cheeseCap
    if (cheese < 0) cheese = 0

    updateCheeseMonsters(deltaT, currentTime)
    
  }

  /**
   * Triggered when manually starting the cheese generation (with button or input range)
  */
  function handleCheeseGenerationInit() {
    if (thoughts < cheeseQueue.cost || cheeseQueue.state === 'running') return
    thoughts -= cheeseQueue.cost
    if(cheeseQueue.current >= 1) cheeseQueue.current--
    cheeseQueue.state = 'running'
  }
  /**
   * This function will be called whenever the animation of the cheese bar completes a cycle.
   * ProgBarTask dispatches custom event 'completed', which triggers this function
   */
  function handleCheeseGeneration() {
    //console.log("completed")
    if (Math.random() < moldyChance) moldyCheese += cheeseQueue.yield
    else cheese += cheeseQueue.yield


    // force a moldy cheese to be generated at the start to not get unlucky potentially
    if(!moldyCheeseCreated && cheese >= 5) {
      moldyCheese++
      cheese--
    }

    if(!cheeseQueue.infinite && !cheeseQueue.current) {
      // 'initial' better than 'paused', because the animation might've already started a small bit
      cheeseQueue.state = 'initial'
      return
    }

    if (thoughts < cheeseQueue.cost) {
      cheeseQueue.state = 'initial'
      return
    }
    thoughts -= cheeseQueue.cost
    if(cheeseQueue.current >= 1) cheeseQueue.current--

  }


  function updateCheeseMonsters(deltaT: number, currentTime: number) {
    if (!cheeseMonster.amount) return

    // only update every second
    if (currentTime == lastSecond) {
      // naive for-loops, maybe needs to be optimized in the future
      // 1 million loops of Math.random() ~ 4-5ms, should be fine
      let chanceToDie = cheeseMonster.chanceToDie()
      for (let i = 0; i < cheeseMonster.amount; i++) {
        if (Math.random() < chanceToDie) {
          cheeseMonster.amount--
          // drop cheese brain if killed in combat
          cheeseBrain += 1
          //console.log("a monster died")
        }
        if (!cheeseMonster.amount) break
      }
    }

    if (!cheese) {
      cheese = 0
      // only update every second
      if (currentTime == lastSecond) {
        for (let i = 0; i < cheeseMonster.amount; i++) {
          if (Math.random() < cheeseMonster.chanceToStarve) {cheeseMonster.amount--/*; console.log("a monster starved")*/}
          if (!cheeseMonster.amount) break
        }
      }
    }
    
  }
  function buyCheeseMonster() {
    if (thoughts < cheeseMonster.cost.thoughts || moldyCheese < cheeseMonster.cost.moldyCheese) return
    thoughts -= cheeseMonster.cost.thoughts
    moldyCheese -= cheeseMonster.cost.moldyCheese
    cheeseMonster.amount += 1
    thoughtsPerSec += cheeseMonster.generates.thoughts
  }
  function upgradeCheeseMonster(type: string) {
    let c = cheeseMonster.upgrade
    if (type === 'sentience'){
      if (cheeseBrain < c.sentience.cost.cheeseBrain || thoughts < c.sentience.cost.thoughts) return
      cheeseBrain -= c.sentience.cost.cheeseBrain
      thoughts -= c.sentience.cost.thoughts
      c.sentience.cost.cheeseBrain *= c.sentience.mult
      c.sentience.cost.thoughts *= c.sentience.mult

      // the thoughts generated should depend on sentience (-> easily reconstructible)
      cheeseMonster.upgrade.sentience.lvl += 1
      cheeseMonster.generates.thoughts *= 1.10
    } else if (type === 'hunger') {
      if (cheeseBrain < c.hunger.cost.cheeseBrain || cheese < c.hunger.cost.cheese) return
      cheeseBrain -= c.hunger.cost.cheeseBrain
      thoughts -= c.hunger.cost.cheese
      c.hunger.cost.cheeseBrain *= c.hunger.mult
      c.hunger.cost.cheese *= c.hunger.mult

      // the consumed cheese should depend on hunger, same here
      cheeseMonster.upgrade.hunger.lvl += 1
      cheeseMonster.consumes.cheese *= 0.98
    }
  }

  
  function handleCheeseUpgrade(type: Upgrade) {

    let affordable = cheeseUpgrades[type].cost.every(({resourceType, amount}) => getResourceAmount(resourceType) >= amount)
    if (!affordable) return
    cheeseUpgrades[type].cost.forEach((cost: { resourceType: string; amount: number; }) => {
      addResourceAmount(cost.resourceType, -cost.amount)
      cost.amount *= cheeseUpgrades[type].costMult
    })

    if (type === Upgrade.CHEESE_YIELD) {
      cheeseQueue.yield *= cheeseUpgrades[Upgrade.CHEESE_YIELD].effect.yield
      cheeseQueue.cycleDuration *= cheeseUpgrades[Upgrade.CHEESE_YIELD].effect.duration
    } else if (type === Upgrade.FASTER_CHEESE) {
      cheeseQueue.cycleDuration *= cheeseUpgrades[Upgrade.FASTER_CHEESE].effect.duration
      cheeseQueue.cost *= cheeseUpgrades[Upgrade.FASTER_CHEESE].effect.cost
    } else if (type === Upgrade.MOLDY_CHANCE) {
      moldyChance += cheeseUpgrades[Upgrade.MOLDY_CHANCE].effect.moldyChancePlus
    }

    // has to be done to force DOM updates...
    cheeseUpgrades = {...cheeseUpgrades}
  }
  let thinkBtnDisabled = false
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

  let thinkFasterStoryAdded = false
  function thinkFaster() {
    if (thoughts < thinkFasterCost) return
    thoughts -= thinkFasterCost
    thinkFasterCost *= thinkFasterCostMult
    thoughtsPerSec += thinkFasterPerSec

    if (!thinkFasterStoryAdded && thoughtsPerSec >= 3) {
      addLogEntry(story[3])
      thinkFasterStoryAdded = true
    }
  }

  function handleThoughtCap() {
    if (cheese < thoughtsCapCost) return
    cheese -= thoughtsCapCost
    thoughtsCapCost *= 1.2
    thoughtsCap += thoughtsCapDelta
  }

  function generateNewIdea() {
    if (thoughts < thoughtsToNextIdea[ideas]) return
    thoughts -= thoughtsToNextIdea[ideas]
    //thoughtsToNextIdea *= 2

    ideas++
    console.log(ideas)
    switch (ideas) {
      case Idea.BASIC_STATS : {
        addLogEntry(story[0])
        break;
      }
      case Idea.AUTO_THINK: {
        thoughtsPerSec += 1
        // log: You now automatically think! The idea isn't very original of course, but you also didn't think much for it.
        addLogEntry(story[1])
        break
      }
      case Idea.THINK_FASTER: {
        addLogEntry(story[2])
        break
      }
      case Idea.THINK_MULTIPLIER: {
        thoughtsBonusMax = 2
        addLogEntry(story[4])
        break
      }
      case Idea.CHEESE: {
        addLogEntry(story[5])
        break
      }
      case Idea.CHEESE_MONSTER: {
        addLogEntry(story[12])
        break
      }
      case Idea.CHEESE_MONSTER_UPGRADE: {
        addLogEntry(story[15])
        break
      }

    }
  }

  function handleQueueUpgrade() {
    if (cheese > cheeseQueue.costUpgrade) {
      cheese -= cheeseQueue.costUpgrade
      cheeseQueue.cap += cheeseQueue.capDelta
      // so it keeps being an integer:
      cheeseQueue.costUpgrade = Math.round(cheeseQueue.costUpgrade * cheeseQueue.costUpgradeMult)
    }
  }
  

 

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
    
        <span>add cheese monster</span>
        <div style="display:flex;">
          <button on:click={() => cheeseMonster.amount += 1}>+1</button>
          <button on:click={() => cheeseMonster.amount += 10}>+10</button>
          <button on:click={() => cheeseMonster.amount += 100}>+100</button>
          <button on:click={() => cheeseMonster.amount += 1000}>+1K</button>
        </div>
    
      </div>
    </div>
  {/if}
  
  <div id="thoughtComponent">
    <h1>thought factory</h1>
    <span>
      <span class="iconify" data-icon="el:idea"/>
       idea bar
    </span>
    <div class="ideaBar">
      <ProgBar
        --width = 100%
        --height = 100% 
        --progress = "{100*thoughts/thoughtsToNextIdea[ideas]}%">
        {thoughts >= thoughtsToNextIdea[ideas] ? thoughtsToNextIdea[ideas] : formatNumber(thoughts,2)}/{thoughtsToNextIdea[ideas]}
      </ProgBar>
      {#if thoughts >= thoughtsToNextIdea[0] || ideas >= Idea.BASIC_STATS || LORCA_OVERRIDE}
        <button 
          class:ideaComplete={thoughts >= thoughtsToNextIdea[ideas]} 
          class:disabled={thoughts < thoughtsToNextIdea[ideas]} 
          on:click={generateNewIdea}
          use:tooltip={{
            content: SimpleTooltip,
            data: "Generate a new idea. <br> Unlocks {HintForNextIdea}"
          }}>
          <span class="iconify" data-icon="el:idea"></span>
        </button>
      {:else}
        <button class=disabled>??</button>
      {/if}
    </div>

    {#if ideas >= Idea.BASIC_STATS || LORCA_OVERRIDE}
      <div transition:slide={{duration: 500}}>
        <table>
          <tr>
            <td class="label">
              total ideas
            </td>
            <td class="amount">{ideas}</td>
            <td></td>
          </tr>
        </table>

        <table>
          <tr>
            <td class="label expandable" on:click={() => thoughtsExtended = !thoughtsExtended} aria-expanded={thoughtsExtended}>
              <span class="breadcrumb">
                thoughts
                <span class="iconify" data-icon="fa-solid:angle-right"></span>
              </span>
            </td>
            <td class="amount">{formatNumber(thoughts,2)}</td>
            <td class="perSec">
               {#if ideas >= Idea.AUTO_THINK || LORCA_OVERRIDE}
                <span transition:fade={{duration: 500}} class:red={thoughtsBonus > 1}>
                  +{formatNumber(thoughtsPerSec * thoughtsBonus,2)}/s
                </span>
               {/if} 
            </td>
          </tr>
        </table>

        {#if thoughtsExtended}
          <div transition:slide={{duration: 300}}>
            <TableComponent rows={[
              { label: "multiplier", value: formatNumber(thoughtsBonus,2), rate:"" },
              { label: "capacity", value: formatWhole(thoughtsCap), rate:"" },
            ]}/>
          </div>
       {/if}

      </div>
    {/if}

    {#if ideas >= Idea.THINK_MULTIPLIER}
      <button on:click={handleThink}>
          thought boost <span class="iconify" data-icon="icon-park-outline:brain"/><br>
          x2 thoughts/s
      </button>
    {:else}
      <button on:click={handleThink}>
        think <span class="iconify" data-icon="icon-park-outline:brain"/><br>
        +1 thoughts 
      </button>
    {/if}


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
    {#if upgradeUnlocked[Upgrade.THOUGHT_CAP] || LORCA_OVERRIDE}
      <button 
        on:click={handleThoughtCap} 
        class:disabled={cheese < thoughtsCapCost} 
        transition:slide={{duration: 500}}
        use:tooltip={{
          content: UpgradeTooltip,
          data: {
            desc: "Increase your capacity to think more broadly.",
            effects: [`+${thoughtsCapDelta} thought capacity`],
            costs: [`${formatNumber(thoughtsCapCost,2)} cheese`]
          }
        }}
      >
        mental growth
      </button>
    {/if}
  </div>

  {#if ideas >= Idea.CHEESE || LORCA_OVERRIDE}
    <div id="cheeseComponent" transition:slide={{duration: 500}}>
      <h1>switzerland simulator</h1>
      <div class="cheeseBar" class:before={!upgradeUnlocked[Upgrade.UNLOCK_CHEESE_QUEUE] && !LORCA_OVERRIDE}>
        <button on:click={handleCheeseGenerationInit} class:active={cheeseQueue.state === 'running'}>
          <span class="iconify" data-icon="fa-solid:cheese"/>
        </button>

        <ProgBarTask
          on:completed={handleCheeseGeneration}
          --width = 100%
          --height = 100%
          --barColor = yellow
          --duration = {cheeseQueue.cycleDuration/1000}s
          --playState = {cheeseQueue.state}
          >
        </ProgBarTask>


        {#if !cheeseQueue.unlocked && upgradeUnlocked[Upgrade.UNLOCK_CHEESE_QUEUE] && !LORCA_OVERRIDE}
          <button on:click={() => {
            if (cheese < 8) return
            cheese -= 8
            cheeseQueue.unlocked = true
            }}>
            <span class="iconify" data-icon="dashicons:unlock"></span>
          </button>
        {/if}
        {#if cheeseQueue.unlocked || LORCA_OVERRIDE}
          <button on:click={handleQueueUpgrade} class="flex-center"><span class="iconify" data-icon="akar-icons:plus"></span></button>
        {/if}
      </div>
      

      {#if cheeseQueue.unlocked || LORCA_OVERRIDE}
        <div class="slidecontainer">
          <span>{cheeseQueue.current}</span>
          <InputRange min={0} max={cheeseQueue.cap} bind:value={cheeseQueue.current} onChange={handleCheeseGenerationInit}/>
        </div>
      {/if}


      {#if cheeseCreated || LORCA_OVERRIDE}
        <div transition:slide={{duration: 500}}>
          <table>
            <tr>
              <td class="label expandable" on:click={() => cheeseExtended = !cheeseExtended} aria-expanded={cheeseExtended}>
                <span class="breadcrumb">cheese <span class="iconify" data-icon="fa-solid:angle-right"></span></span>
              </td>
              <td class="amount">{formatNumber(cheese,2)}</td>
              <td class="perSec"> {#if cheesePerSecDisplayed || LORCA_OVERRIDE}{cheesePerSecDisplayed > 0 ? "+": ""}{formatNumber(cheesePerSecDisplayed,2)}/s{/if} </td>
            </tr>
          </table>

          {#if cheeseExtended}
            <div transition:slide={{duration: 300}}>
              <TableComponent rows={[
                { label: "yield", value: formatNumber(cheeseQueue.yield,2), rate:"" },
                { label: "cost", value: formatNumber(cheeseQueue.cost,2), rate:"" },
                { label: "duration", value: formatWhole(cheeseQueue.cycleDuration), rate:"" },
              ]}/>
            </div>
          {/if}

          {#if moldyCheeseCreated || LORCA_OVERRIDE}
          <div transition:slide={{duration: 500}}>
            <table>
              <tr>
                <td class="label expandable" on:click={() => moldyCheeseExtended = !moldyCheeseExtended} aria-expanded={moldyCheeseExtended}>
                  <span class="breadcrumb">
                    moldy cheese
                    <span class="iconify" data-icon="fa-solid:angle-right"></span>
                  </span>
                </td>
                <td class="amount">{formatNumber(moldyCheese,2)}</td>
                <td></td>
              </tr>
            </table>
            {#if moldyCheeseExtended}
              <div transition:slide={{duration: 300}}>
                <TableComponent rows={
                  [{label: "chance", value: `${formatWhole(moldyChance*100)}%`, rate:""}]
                }/>
              </div>
            {/if}
          </div>
          {/if}

        </div>
      {/if}


      {#if upgradeUnlocked[Upgrade.CHEESE_YIELD] || LORCA_OVERRIDE}
        <div id="cheeseUpgrades" transition:slide={{duration: 500}}>
          <!-- could make component for these... -->
          <!-- the use: directive from svelte executes the function once the component is rendererd -->
          <button type="button" on:click={() => handleCheeseUpgrade(Upgrade.CHEESE_YIELD)}>
            {cheeseUpgrades[Upgrade.CHEESE_YIELD].label} <br>
            {#each cheeseUpgrades[Upgrade.CHEESE_YIELD].effectLabel() as effectLabel}
              {effectLabel} <br>
            {/each}
              <!-- {cheeseUpgrades[Upgrade.CHEESE_YIELD].cost[0].amount} {cheeseUpgrades[Upgrade.CHEESE_YIELD].cost[0].resourceType} <br> -->
            {#each cheeseUpgrades[Upgrade.CHEESE_YIELD].cost as cost}
              {formatNumber(cost.amount,2)} {cost.resourceType} <br>
            {/each}
          </button>
          {#if upgradeUnlocked[Upgrade.MOLDY_CHANCE] || LORCA_OVERRIDE}
            <button type="button" on:click={() => handleCheeseUpgrade(Upgrade.MOLDY_CHANCE)} transition:slide={{duration: 500}}>
              {cheeseUpgrades[Upgrade.MOLDY_CHANCE].label} <br>
              {#each cheeseUpgrades[Upgrade.MOLDY_CHANCE].effectLabel() as effectLabel}
                {effectLabel} <br>
              {/each}
              {#each cheeseUpgrades[Upgrade.MOLDY_CHANCE].cost as cost}
                {formatNumber(cost.amount,2)} {cost.resourceType} <br>
              {/each}
            </button>
          {/if}
          {#if upgradeUnlocked[Upgrade.FASTER_CHEESE] || LORCA_OVERRIDE}
            <button type="button" on:click={() => handleCheeseUpgrade(Upgrade.FASTER_CHEESE)} transition:slide={{duration: 500}}>
              {cheeseUpgrades[Upgrade.FASTER_CHEESE].label} <br>
              {#each cheeseUpgrades[Upgrade.FASTER_CHEESE].effectLabel() as effectLabel}
                {effectLabel} <br>
              {/each}
              {#each cheeseUpgrades[Upgrade.FASTER_CHEESE].cost as cost}
                {formatNumber(cost.amount,2)} {cost.resourceType} <br>
              {/each}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if ideas >= Idea.CHEESE_MONSTER || LORCA_OVERRIDE}
    <div id="monsterComponent" transition:slide={{duration: 500}}>
      <h1>cheese laboratory</h1>
      <div class="monsterBar">
        <button class:active={cheeseQueue.state === 'running'}>
          <span class="iconify" data-icon="icomoon-free:magic-wand"/>
        </button>
        <ProgBarTask
          on:completed={() => console.log("test")}
          --width = 100%
          --height = 100%
          --barColor = var(--primary)
          --duration = {4}s
          --playState = paused
          >
        </ProgBarTask>
      </div>
     
      <button on:click={buyCheeseMonster}>summon cheese monster <span class="iconify" data-icon="icomoon-free:magic-wand"></span><br>
        cost: {cheeseMonster.cost.thoughts} thoughts,
        {cheeseMonster.cost.moldyCheese} moldy cheese</button>

      {#if cheeseMonsterCreated || LORCA_OVERRIDE}
        <div transition:slide={{duration: 500}}>
          <table>
            <tr>
              <td class="label expandable" on:click={() => cheeseMonsterExtended = !cheeseMonsterExtended} aria-expanded={cheeseMonsterExtended}>
                <span class="breadcrumb">
                  cheese monster
                  <span class="iconify" data-icon="fa-solid:angle-right"></span>
                </span>
              </td>
              <td class="amount">{cheeseMonster.amount}</td>
              <td class="perSec"></td>
            </tr>
          </table>

          {#if cheeseMonsterExtended}
            <div transition:slide={{duration: 300}}>
              <TableComponent rows={[
                { label: "thoughts", value: formatNumber(cheeseMonster.generates.thoughts, 2) + "/s", rate: "" },
                { label: "cheese", value: "-" + formatNumber(cheeseMonster.consumes.cheese, 2)  + "/s", rate: ""  },
                { label: "death_rate", value: formatNumber(cheeseMonster.chanceToDie()*100 , 2)  + "%", rate: ""  },
                { label: "drop", value: 1, rate: ""  },
              ]}/>
            </div>
          {/if}
        
          {#if cheeseBrainCreated || LORCA_OVERRIDE}
            <table>
              <tr>
                <td class="label">
                  cheese brain
                </td>
                <td class="amount">{formatNumber(cheeseBrain,2)}</td>
                <td class="perSec"></td>
              </tr>
            </table>
          {/if}
        </div>
      {/if}

      <span>
        {cheeseMonster.amount} cheese monsters are
        generating {formatNumber(cheeseMonster.generates.thoughts * cheeseMonster.amount, 2)} thoughts/s,
        but consuming {formatNumber(cheeseMonster.consumes.cheese * cheeseMonster.amount, 2)} cheese/s
      </span>
      
      <span>general mood: peaceful</span>

      <!-- <span>you have {cheeseBrain} cheese brains, <br>
      generating {formatNumber(cheeseBrainGenerates * cheeseBrain, 2)} cheese/s</span> -->

      {#if ideas >= Idea.CHEESE_MONSTER_UPGRADE || LORCA_OVERRIDE}
        <button on:click={() => upgradeCheeseMonster('sentience')}>
          improve cheese monster sentience <br>
          {cheeseMonster.upgrade.sentience.cost.thoughts} thoughts <br>
          {cheeseMonster.upgrade.sentience.cost.cheeseBrain} cheese brains
        </button>
        <button on:click={() => upgradeCheeseMonster('hunger')}>
          reduce cheese monster hunger<br>
          {cheeseMonster.upgrade.hunger.cost.cheese} cheese <br>
          {cheeseMonster.upgrade.hunger.cost.cheeseBrain} cheese brains
        </button>
      {/if}
      {#if ideas >= Idea.CHEESE_MONSTER_MODE || LORCA_OVERRIDE}
        <fieldset>
          <legend>monster brain wave controller</legend>
          <label>
            <input type=radio name=mode bind:group={cheeseMonster.brainMode} value={1} 
              on:change={() => handleCheeseMonsterBrainMode("peaceful")}>
              capybara
          </label>
          <label>
            <input type=radio name=mode bind:group={cheeseMonster.brainMode} value={2}
            on:change={() => handleCheeseMonsterBrainMode("normal")}>
            neutral
          </label>
          <label>
            <input type=radio name=mode bind:group={cheeseMonster.brainMode} value={3}
            on:change={() => handleCheeseMonsterBrainMode("hostile")}>
            destruction
          </label>
        </fieldset>
      {/if}
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
    background-color: var(--Gray800);
    color: white
  }
  #thoughtComponent {
    width: 300px;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    background-color: rgba(0, 33, 87, 0.19);
    box-shadow: 0 0 4px .25px black;
    padding: 16px;
    border-radius: 8px;
  }
  #cheeseComponent {
    width: 300px;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    background-color: rgba(0, 33, 87, 0.19);
    box-shadow: 0 0 4px .25px black;
    padding: 16px;
    border-radius: 8px;
  }
  .container h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: normal;
    text-align: center;
  }
  #monsterComponent {
    width: 300px;
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    background-color: rgba(0, 33, 87, 0.19);
    box-shadow: 0 0 4px .25px black;
    padding: 16px;
    border-radius: 8px;
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
  .monsterBar button:first-child {
    color: var(--primary);
  }
  .monsterBar button:first-child:hover, .monsterBar button:first-child.active {
    outline-width: 1px;
    outline-style: solid;
  }
  .ideaComplete:hover {
    color: var(--secondary);
    outline: var(--secondary) solid 1px;
  }
  .cheeseBar.before {
    grid-template-columns: 2rem auto;
  }
  .cheeseBar button:first-child {
    color: yellow;
  }
  .cheeseBar button:first-child:hover, .cheeseBar button:first-child.active {
    outline-width: 1px;
    outline-style: solid;
  }
  .cheeseBar button:nth-child(3) {
    color: var(--Gray100);
  }
  .cheeseBar button:nth-child(3):hover {
    background-color: var(--Gray300);
    color: var(--Gray800);
  }
  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .slidecontainer {
    display: grid;
    grid-template-columns: 2rem auto;
    column-gap: 0.5rem;
    align-items: center;
    justify-items: center;
  }
  .slidecontainer span {
    font-weight: bold;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  table tr td {
    font-weight: normal;
    text-align: start;
  }
  td.label {
    width: 45%;
  }
  td.label.expandable[aria-expanded=true] > span {
    text-decoration: underline;
  }
  
  td.label.expandable:hover > span {
    color: var(--primary);
    text-decoration: underline;
  }
  td.amount {
    width: 25%;
    text-align: right;
  }
  td.perSec {
    text-align: right;
  }
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.25rem;
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
   
  
  #cheeseUpgrades {
    display: flex;
    flex-direction: column;
    gap: .75rem;
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