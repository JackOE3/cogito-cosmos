<script lang="ts">
  import { onMount } from "svelte";
  import { formatNumber, formatNumber2, formatWhole, noRef } from "../gamelogic/utils";
  import {currentCPU} from '../stores/mainStore'
  import { writable, derived, get} from 'svelte/store'; 

  let lastRunTime = Date.now()
  let deltaT = 0
  
  let flopCount = 0
  let flopMultiplier = 1
  $: flops = FPU.output * clockRate.rate * flopMultiplier - controlUnit.flopsCostSum
  $: rawFlops = FPU.output * clockRate.rate

  

  // atm this is quadratic in level (linear rate of increase in level)
  $: controlUnitCostIncrease = controlUnit.flopsCost * controlUnit.costMult

  $: FPUCostMultDecrease = (FPU.costMult - FPU.costMultCap) * (1 - controlUnit.FPUScaling)
  
  onMount(() => {
    setInterval(() => {
      let currentTime = Date.now()

      deltaT = Math.max(Math.min((currentTime - lastRunTime) / 1000, 1), 0)
      lastRunTime = currentTime
      gameUpdate(deltaT)
      
    }, 200)
  })

  function gameUpdate(deltaT: number) {
    flopCount += flops * deltaT

  }

 
  const controlUnit_init = {
    level: 0,
    flopsCost: 1,
    flopsCostSum: 0,
    costMult: 1.25,

    FPUScaling: 0.90
  }
  const FPU_init = {
    level: 0,
    cost: 5,
    costMult: 1.7,
    costMultCap: 1.1,

    output: 1,
    outputBoost: 1
  }
  const clockRate_init = {
    level: 0,
    cost: 3,
    costMult: 1.5,

    rate: 1,
    rateMult: 1.10
  }
  let controlUnit = noRef(controlUnit_init)
  let FPU = noRef(FPU_init)
  let clockRate = noRef(clockRate_init)
  
  function upgradecontrolUnit(){
    if (flops < controlUnit.flopsCost) return
    controlUnit.level++
    FPU.costMult -= FPUCostMultDecrease
    controlUnit.flopsCostSum += controlUnit.flopsCost
    controlUnit.flopsCost *= controlUnit.costMult
  }
  function upgradeFPU(){
    if (flopCount < FPU.cost) return
    flopCount -= FPU.cost

    FPU.level++
    FPU.cost *= FPU.costMult

    FPU.output += FPU.outputBoost
  }
  function upgradeclockRate(){
    if (flopCount < clockRate.cost) return
    flopCount -= clockRate.cost

    clockRate.level++
    clockRate.cost *= clockRate.costMult

    clockRate.rate *= clockRate.rateMult
  }

  function switchCore(){
    if(get(currentCPU).activeCore >= get(currentCPU).cores) return
    // first try with sqrt:
    flopMultiplier = Math.log(flops)
    resetCore()
    currentCPU.update(c => {
      c.activeCore++
      return c
    })
  }

  function resetCore(){
    //this works too:
    controlUnit = {...controlUnit_init}
    FPU = noRef(FPU_init)
    clockRate = noRef(clockRate_init)
    flopCount = 0
  }

</script>


<div id="cpu">
  <button on:click={switchCore}>switch</button>
  <button on:click={resetCore}>reset</button>
  <span>current flop multiplier: {flopMultiplier}x</span>
  <span>if switch now: {Math.log(flops)}x</span>
  <h1>central processing unit (core {$currentCPU.activeCore}/{$currentCPU.cores})</h1>
  <span>control of CPU core: {$currentCPU.control*100}%</span>
  <span>CPU flop-count: {formatWhole(flopCount)}</span>
  <span>effective performance: {formatNumber(flops, 2)} flop/s</span>
  <span>{formatNumber(rawFlops, 2)} raw flop/s</span>
 
  <div id="cpuComponents">
    <div class="component">
      <b>control unit v{controlUnit.level}</b>
      <span class="desc">improves cost scaling of FPU, but consumes steady flop/s</span>
      <span>Next: {formatNumber(FPU.costMult, 2)}x ->
         {formatNumber(FPU.costMult - FPUCostMultDecrease, 2)}x scaling factor</span>
      <span>Cost: -{formatNumber(controlUnit.flopsCost, 2)}flop/s</span>
      <button on:click={upgradecontrolUnit}>Upgrade</button>
    </div>
    <div class="component">
      <b>floating point unit v{FPU.level}</b>
      <span class="desc">computes a certain amount of flop's per clock cycle</span>
      <span>currently operating at {FPU.output} flop per cycle</span>
      <span>Next: +{FPU.outputBoost} flop per cycle</span>
      <span>Cost: {formatNumber(FPU.cost, 2)} -> {formatNumber(FPU.cost * FPU.costMult, 2)}</span>
      <button on:click={upgradeFPU}>Upgrade</button>
    </div>
    <div class="component">
      <b>clock rate v{clockRate.level}</b>
      <span class="desc">determines the clock cycles per second</span>
      <span>Next: {formatNumber(clockRate.rate, 2)} -> {formatNumber(clockRate.rate * clockRate.rateMult, 2)} Hz </span>
      <span>Cost: {formatNumber(clockRate.cost, 2)} -> {formatNumber(clockRate.cost * clockRate.costMult, 2)}</span>
      <button on:click={upgradeclockRate}>Upgrade</button>
    </div>
  </div>

</div>

<style>
  h1 {
    font-size: 1.2rem;
  }
 #cpu {
    display: flex;
    flex-direction: column;
    width: 400px;
    margin-right: 20px;
    margin-left: 20px;
 }
 #cpuComponents {
    width: inherit;
    margin-top: 1rem;
  }
  .component {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  .disabled{
    opacity: var(--medium-emphasis);
    pointer-events: none;
  }
  
</style>