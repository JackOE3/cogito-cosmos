<script lang="ts">
  import { formatNumber, formatWhole } from "../gamelogic/utils";
  import { slide, fade} from "svelte/transition";
  import {
      LORCA_OVERRIDE,
      resource,
      cheeseMonsterSpawnrate,
      cheeseMonsterCapacity,
      unlocked, 
    } from'../stores/mainStore'

  let brainMode = 0

  function handleBrainWaveChange(mode: number) {
    switch(mode) {
      case 1: {
        // biggest resource boosts
        // no deaths
        break
      }
      case 2: {
        // middle resource boosts
        // low death rate
        break
      }
      case 3: {
        // very low resource boosts
        // high death rate
        break
      }
    }
  }
</script>
  
  <div class="container">
    <div class="header">
      <span class="componentTitle">The Cheeseyard</span>
    </div>
    <div class="content">
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span class=resourceDisplay>
          Current population: {formatWhole($resource.cheeseMonster)}/{formatWhole($cheeseMonsterCapacity)} <strong style="color:rgb(255, 0, 98)">cheese monsters</strong> <br>
        </span>
        <span>
          Spawn rate: {$cheeseMonsterSpawnrate*60}/min <br>
        </span>  
      </div>

      <div>
        <span>Your current cheese monsters boost the following resources: </span>
        <table>
          <tr>
            <td class="name">thoughts/s</td>
            <td>21.34x</td>
          </tr>
          <tr>
            <td class="name">cheese gain</td>
            <td>3.90x</td>
          </tr>
        </table>
      </div>

      <fieldset>
        <legend>monster brain wave controller</legend>
        <label>
          <input type=radio name=brainMode bind:group={brainMode} value={1} 
            on:change={() => handleBrainWaveChange(1)}>
          peaceful
        </label>
        <label>
          <input type=radio name=brainMode bind:group={brainMode} value={2}
            on:change={() => handleBrainWaveChange(2)}>
          neutral
        </label>
        <label>
          <input type=radio name=brainMode bind:group={brainMode} value={3}
            on:change={() => handleBrainWaveChange(3)}>
          destructive
        </label>
      </fieldset>

    </div>
  </div>

<style>
  .content {
    width: 508px;
    height: fit-content;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    padding: 12px;
    /*border-radius: 8px;*/
    
  }
  .header {
    background: linear-gradient(90deg, rgb(82, 0, 18) 0%, rgb(255, 0, 98) 100%);
  }
  table {
    margin-top: 4px;
    margin-left: 0px;
    outline: 1px rgb(119, 119, 119) solid
  }
  .name {
    width: 100px;
  }
  fieldset {
    width: fit-content;
  }
 
</style>