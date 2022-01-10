<script lang="ts">
  import { onMount } from "svelte";
  import { formatNumber, formatWhole, noRef } from "../gamelogic/utils";

  let number = 0
  let numberPerSec = 0

  const DEFAULT_COST = 5
  const DEFAULT_MULT = 1.4
  const SCALING_CAP = 1.05
  const SCALING_FACTOR = DEFAULT_MULT - SCALING_CAP
  type LinkType = 'prod' | 'scaling'
  type LinkDependency = 'prod' | 'lvl'
 
  // returns factor between DEFAULT_MULT and SCALING_CAP depending on input
  function calcScaleFactor({lvl, prod, prodBoost}, type: LinkDependency): number {
    let falloff = 0
    let x = 0
    if(type === 'lvl') {
      falloff = 0.1
      x = lvl
    }
    if(type === 'prod') {
      falloff = 0.05
      x = prod * prodBoost
    }
   
    return SCALING_FACTOR * Math.exp(- falloff * x) + SCALING_CAP
  }

  let gen1 = {
    lvl: 1,
    prod: 1,
    prodBoost: 1,
    cost: DEFAULT_COST,
    costMult: DEFAULT_MULT 
  }
  let gen2 = {
    lvl: 1,
    prod: 1,
    prodBoost: 1,
    cost: DEFAULT_COST,
    costMult: DEFAULT_MULT 
  }
  let gen3 = {
    lvl: 1,
    prod: 1,
    prodBoost: 1,
    cost: DEFAULT_COST,
    costMult: DEFAULT_MULT 
  }

  var link = function(type_init: LinkType) {
    let type = type_init

    function effect(genA, genB) {
      if (type === 'prod') {
        // cube root?
        genB.prodBoost = Math.sqrt(genA.prod * genA.prodBoost)
      }
      if (type === 'scaling') {
        genB.costMult = calcScaleFactor(genA, 'prod')
      }
    }
    function displayEffect(genB) {
      if (type === 'prod') return genB.prodBoost
      if (type === 'scaling') return genB.costMult
      return 'n/a'
    }
    return {
      type: type,
      effect: effect,
      display: displayEffect
    }
  }

  let link1 = link('scaling')
  let link2 = link('prod')
 

  let lastRunTime = Date.now()
  let deltaT = 0
  const GAME_INTERVAL = 200

  onMount(() => {
    setInterval(() => {
      let currentTime = Date.now()

      deltaT = Math.max(Math.min((currentTime - lastRunTime) / 1000, 1), 0)
      lastRunTime = currentTime
      gameUpdate(deltaT)
      
    }, GAME_INTERVAL)
  })
  function gameUpdate(deltaT: number) {

    // apply effects from links
    link2.effect(gen3, gen2)
    link1.effect(gen2, gen1)
    

    //calculate current production rate
    numberPerSec = gen1.prod * gen1.prodBoost +
                 + gen2.prod * gen2.prodBoost +
                 + gen3.prod * gen3.prodBoost

    number += numberPerSec * deltaT

    //ad-hoc force-update gens
    gen1 = {...gen1}
    gen2 = {...gen2}
    gen3 = {...gen3}

  }
  function upgradeGen(gen) {
    if (number < gen.cost) return
    number -= gen.cost
    gen.lvl++
    gen.prod += 1
    gen.cost *= gen.costMult
  }

</script>

<div class="container">
  <span>number: {formatWhole(number)}</span>
  <span>per second: {formatNumber(numberPerSec, 2)}</span>
  
  <div class="generator">
    <b>generator 1</b>
    <span>level {gen1.lvl}</span>
    <span>production: {formatNumber(gen1.prod * gen1.prodBoost, 2)}/s</span>
    <button on:click={() => upgradeGen(gen1)}
      class:disabled={number < gen1.cost}>upgrade for {formatNumber(gen1.cost, 2)}</button>
    <span>upgrade scaling: {formatNumber(gen1.costMult, 2)}</span>
  </div>

  <div class="link">
    <b>Link 2 -> 1</b>
    <span>type: {link1.type}</span>
    <span>factor: {formatNumber(link1.display(gen1), 2)}</span>

  </div>

  <div class="generator">
    <b>generator 2</b>
    <span>level {gen2.lvl}</span>
    <span>production: {formatNumber(gen2.prod * gen2.prodBoost, 2)}/s</span>
    <button on:click={() => upgradeGen(gen2)}
      class:disabled={number < gen2.cost}>upgrade for {formatNumber(gen2.cost, 2)}</button>
    <span>upgrade scaling: {formatNumber(gen2.costMult, 2)}</span>
  </div>

  <div class="link">
    <b>Link 3 -> 2</b>
    <span>type: {link2.type}</span>
    <span>factor: {formatNumber(link2.display(gen2), 2)}</span>
  </div>

  <div class="generator">
    <b>generator 3</b>
    <span>level {gen3.lvl}</span>
    <span>production: {formatNumber(gen3.prod * gen3.prodBoost, 2)}/s</span>
    <button on:click={() => upgradeGen(gen3)}
      class:disabled={number < gen3.cost}>upgrade for {formatNumber(gen3.cost, 2)}</button>
    <span>upgrade scaling: {formatNumber(gen3.costMult, 2)}</span>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 200px;
    margin-right: 20px;
    margin-left: 20px;
 }
 .generator, .link {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    margin-top: 1rem;
  }
  button {
    margin: 0
  }
  .disabled{
    opacity: var(--medium-emphasis);
    pointer-events: none;
  }
</style>