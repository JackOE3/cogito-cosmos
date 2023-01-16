<script lang="ts">
  import { formatNumber, formatWhole } from "../gamelogic/utils";
  import { slide, fade} from "svelte/transition";
  import { tooltip } from "./tooltips/tooltip";
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import {
      LORCA_OVERRIDE,
      thoughts,
      moldyCheese,
      cheeseMonster,
      cheeseyardSpawnrate,
      cheeseyardCapacity,
      cheeseBrains,
      unlocked, 
    } from'../stores/mainStore'


  let monsterDropRate = 0.1
  let monsterLoot = [1, 3]
  // how much each monster boosts thoughts/s (additive per monster)
  let monsterThoughtFactor = 2
  let totalMonsterDeaths = 0

  let buyMaxUpgrades = false

  const unlockCosts = {
    "cheeseMonsterMassacre": 50,
    "cheeseMonsterCollectiveSentience": 1000,
    "cheeseMonsterTotalDeathsBoost": 10000,

  }

  function unlockFeature(name: string) {
    let cost: number = unlockCosts[name]
    if ($cheeseBrains < cost) return
    $cheeseBrains -= cost
    $unlocked[name] = true
  }

  const upgradesBought = {
    "cheeseMonsterSentience": 0,
    "cheeseMonsterDropRate": 0,
    "cheeseMonsterLoot": 0,
  }
  const upgradeCost = {
    "cheeseMonsterSentience": 10,
    "cheeseMonsterDropRate": 5,
    "cheeseMonsterLoot": 10,
  }
  const upgradeCostMultiplier = {
    "cheeseMonsterSentience": 1.2,
    "cheeseMonsterDropRate": 1.4,
    "cheeseMonsterLoot": 1.2,
  }

  function purchaseUpgrade(upgradeName: string) {
    if ($cheeseBrains < upgradeCost[upgradeName]) return
    if (!buyMaxUpgrades) {
      // PURCHASE SINGLE:
      $cheeseBrains -= upgradeCost[upgradeName]
      upgradeCost[upgradeName] *= upgradeCostMultiplier[upgradeName]
      upgradesBought[upgradeName]++
    } else {
      // PURCHASE MAX:
      const cost = upgradeCost[upgradeName]
      const costMult = upgradeCostMultiplier[upgradeName]
      // used formulas for geometric series (because of the exponential cost curve of the upgrades)
      const numUpgradesAffordable = Math.floor(Math.log($cheeseBrains/cost * (costMult - 1) + 1) / Math.log(costMult))
      const totalPrice = cost * (Math.pow(costMult, numUpgradesAffordable) - 1) / (costMult - 1)

      $cheeseBrains -= totalPrice
      upgradeCost[upgradeName] *= Math.pow(costMult, numUpgradesAffordable)
      upgradesBought[upgradeName] += numUpgradesAffordable
      //alert("Upgrades affordable: " + numUpgradesAffordable + ", Total Prize: " + totalPrice)
    } 
  }

 

</script>
  
  <div class="container">
    <div class="header">
      <span class="componentTitle">Loot</span>
    </div>
    <div class="content">
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span class=resourceDisplay>
          You have {formatNumber($cheeseBrains, 2)} <strong style="color: rgb(250, 142, 0)">cheese brains</strong> <br>
        </span>
      </div>

      <div class="flexRowContainer">

        <div class="gridColumn">
          <button on:click={() => purchaseUpgrade("cheeseMonsterDropRate")}
            disabled={$cheeseBrains < upgradeCost["cheeseMonsterDropRate"]} 
            transition:slide={{duration: 500}}
            style="height:fit-content;"
          >
            Increase the drop rate of cheese monsters <br>
            Currently: 10% <br>
            Costs {formatWhole(upgradeCost["cheeseMonsterDropRate"])} cheese brains
          </button>

          <button on:click={() => purchaseUpgrade("cheeseMonsterLoot")}
            disabled={$cheeseBrains < upgradeCost["cheeseMonsterLoot"]} 
            transition:slide={{duration: 500}}
            style="height:fit-content;"
          >
            Increase the loot obtained from cheese monster corpses <br>
            Currently: 1-3 cheese brains <br>
            Costs {formatWhole(upgradeCost["cheeseMonsterLoot"])} cheese brains
          </button>

          <button on:click={() => purchaseUpgrade("cheeseMonsterSentience")}
            disabled={$cheeseBrains < upgradeCost["cheeseMonsterSentience"]} 
            transition:slide={{duration: 500}}
          >
            Improve the sentience of cheese monsters <br>
            Currently: +2x thoughts/s/monster <br>
            Costs {formatWhole(upgradeCost["cheeseMonsterSentience"])} cheese brains
          </button>

          
        </div>

        <div class="gridColumn">
          <button on:click={() => unlockFeature("cheeseMonsterMassacre")} 
            disabled={$unlocked["cheeseMonsterMassacre"] || $cheeseBrains < unlockCosts["cheeseMonsterMassacre"]} 
            class:maxed={$unlocked["cheeseMonsterMassacre"]}
            use:tooltip={{content: SimpleTooltip, data: 'TBD'}}
            style="height:fit-content;"
          >
            Massacre effect: When killing many cheese monsters at once, the loot is massively boosted <br>
            Costs {formatWhole(unlockCosts["cheeseMonsterMassacre"])} cheese brains
          </button>
          <button on:click={() => unlockFeature("cheeseMonsterCollectiveSentience")} 
            disabled={$unlocked["cheeseMonsterCollectiveSentience"] || $cheeseBrains < unlockCosts["cheeseMonsterCollectiveSentience"]} 
            class:maxed={$unlocked["cheeseMonsterCollectiveSentience"]}
            use:tooltip={{content: SimpleTooltip, data: 'TBD'}}
            style="height:fit-content;"
          >
            Collective sentience: The bigger the population, the higher the resource multipliers per cheese monster<br>
            Costs {formatWhole(unlockCosts["cheeseMonsterCollectiveSentience"])} cheese brains
          </button>
          <button on:click={() => unlockFeature("cheeseMonsterTotalDeathsBoost")} 
            disabled={$unlocked["cheeseMonsterTotalDeathsBoost"] || $cheeseBrains < unlockCosts["cheeseMonsterTotalDeathsBoost"]} 
            class:maxed={$unlocked["cheeseMonsterTotalDeathsBoost"]}
            use:tooltip={{content: SimpleTooltip, data: 'TBD'}}
            style="height:fit-content;"
          >
            Total cheese monster deaths boost cheese brain loot <br>
            Currently: 1.00x <br>
            Costs {formatWhole(unlockCosts["cheeseMonsterTotalDeathsBoost"])} cheese brains
          </button>
        </div>

      </div>
      

    </div>
  </div>

<style>
  .content {
    width: 508px;
    height: 300px;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    padding: 12px;
    /*border-radius: 8px;*/
    
  }
  .header {
    background: linear-gradient(90deg, rgb(82, 0, 18) 0%, rgb(255, 0, 98) 100%);
  }

 
</style>