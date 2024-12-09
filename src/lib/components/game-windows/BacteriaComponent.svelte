<script lang="ts">
  import Window from './window-model/Window.svelte'
  import { formatNumber, formatWhole } from '@gamelogic/utils'
  import UpgradeButton from '../UpgradeButton.svelte'
  import {
    bacteriaPerSec,
    highestMilk,
    upgrades,
    resource,
    WindowId,
    unlocked,
    bacteriaGrowthFactor,
    unlocks,
    cheeseMonsterCapacityPerUpgrade,
    cheeseCyclesPerBarFill,
    currentNotation,
    cheeseMonsterDeathsMultiplicity,
  } from '@store'
  import { tooltip } from '../tooltips/tooltip'
  import UnlockDrawer from '../UnlockDrawer.svelte'

  export let windowId: WindowId
  const a = 4
</script>

<Window title="Petri Dish" themeId="bacteria" {windowId}>
  <div style="display: flex; flex-direction: column; gap: 0.25rem;">
    <span class="resourceDisplay"
      >You have {formatNumber($resource.bacteria, 2, $currentNotation)} <strong style="color:white">bacteria</strong>
    </span>
    <br />
    <span>
      Your highest milk ever is generating {formatNumber($bacteriaPerSec, 2, $currentNotation)} bacteria/s
      <br />
      Reproduction Exponent: 2
    </span>
  </div>

  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton
        upgradeName="bacteriaGrowth"
        btnUnlocked={$unlocked.start}
        tooltipText={`Currently: ${formatWhole($bacteriaGrowthFactor, $currentNotation)}x` +
          `<br> Scales linear with #upgrades. <br> Give your lovely little companions <br> more nutrients to reproduce.`}
      >
        Nurture bacteria growth
      </UpgradeButton>
      <UpgradeButton
        upgradeName="cheeseMonsterCapacityPerUpgrade"
        btnUnlocked={$unlocked.start}
        tooltipText={`Currently: +${formatNumber($cheeseMonsterCapacityPerUpgrade, 2, $currentNotation)}` +
          ` capacity/expansion <br> Scales ^2 with #upgrades. <br> Infest the cheeseyard for a <br> more potent spawning bed.`}
      >
        Cheeseyard Expansions are larger
      </UpgradeButton>
      <UpgradeButton
        upgradeName="multipleCheeseCycles"
        btnUnlocked={$unlocked.start}
        tooltipText={`Currently: ${formatWhole($cheeseCyclesPerBarFill, $currentNotation)} cycle/bar fill` +
          `<br> Make your workers fall ill <br> so they accidentally miscount. `}
      >
        Gain more Cheese Cycles
      </UpgradeButton>
      <UpgradeButton
        upgradeName="multipleMonsterDeaths"
        btnUnlocked={$unlocked.start}
        tooltipText={`Currently: ${formatWhole($cheeseMonsterDeathsMultiplicity, $currentNotation)}x deaths` +
          `<br> Deaths are so brutal that they <br> literally count as multiple.`}
      >
        Cheese monsters die multiple times
      </UpgradeButton>
    </div>

    <div class="gridColumn" />
  </div>
</Window>

<style>
  * {
    --unlockedColor: white
    --maxedColor: var(--unlockedColor);
    
  }

</style>
