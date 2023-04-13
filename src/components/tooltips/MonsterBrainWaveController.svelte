<script lang="ts">
  import { formatNumber } from '@gamelogic/utils'
  import { type BrainMode, cheeseMonsterDeathRateStats, cheeseMonsterBrainModeResourceFactors } from '@store'

  export let data: BrainMode
  export let top = 0
  export let left = 0
  const style = `top: ${top}px; left: ${left - 75}px;`

  const brainModeDescription: Record<BrainMode, string> = {
    peaceful: 'Inner peace lets your monsters supress their destructive urges.',
    neutral: 'Occasionally some monsters may start a fight to the death if they feel like it.',
    destructive: 'Monsters attack each other on sight, ripping out their brains.',
  }
</script>

<div class="tooltip-arrow-up" id="brainWaveInfo" {style}>
  <span style="text-decoration: underline; font-weight: bold; color: rgb(255, 0, 98); margin-bottom: 0.25rem">
    Monster Info
  </span>
  <br />
  <span style="display:flex;flex-direction:column;gap:0.25rem;">
    <span>{brainModeDescription[data]}</span>
    <span class="effect">
      Death toll: {cheeseMonsterDeathRateStats[data] > 0
        ? `${formatNumber(cheeseMonsterDeathRateStats[data], 2)}/s/monster`
        : 'None'}
    </span>
    <span class="effect">Relative resource generation: {cheeseMonsterBrainModeResourceFactors[data]}x</span>
    <div
      style="opacity:var(--medium-emphasis); font-style: oblique; text-align: right; padding-left: 20px; margin-top: 0.25rem "
    >
      The less preoccupied the monsters are with killing each other, the more they can ponder and produce stuff.
    </div>
  </span>
</div>

<style>
  #brainWaveInfo {
    width: 300px;
    text-align: left;
  }
  .effect::before {
    content: '⯁ ';
    color: rgb(255, 0, 98);
  }
</style>
