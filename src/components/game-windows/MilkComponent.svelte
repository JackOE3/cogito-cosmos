<script lang="ts">
  import Window from './window-model/Window.svelte'
  import { formatNumber, formatWhole } from '@gamelogic/utils'
  import UpgradeButton from '../UpgradeButton.svelte'
  import { get } from 'svelte/store'
  import {
    cummulativeUpgradesToTier,
    milkFromReset,
    milkPowerPerSec,
    milkUpgradeEffect,
    milkUpgradeTier,
    highestMilk,
    upgrades,
    resource,
  } from '@store'
  import { tooltip } from '../tooltips/tooltip'

  function handleMilkReset(): void {
    const milkGain = Math.floor(get(milkFromReset))
    if (milkGain < 1) return
    $resource.milk += milkGain
  }
</script>

<!-- <Window title="Milk" themeColor1="#bdbdbd" themeColor2="#ffffff">
  <div>
    <span class="resourceDisplay"
      >You have {formatNumber($resource.milk, 2)} <strong style="color:white">milk</strong> <br />
    </span>
  </div>

  <button
    style="width: 250px; "
    use:tooltip={{
      data: 'You keep all your content unlocks. <br/> The reward amount depends on your thoughts and <br/>cheese, and scales ~thoughts^0.25*cheese^0.5.',
    }}
    on:click={handleMilkReset}
  >
    <strong style="color:white">Lactinity</strong>
    <br />
    Reset all previous progress<br />
    Reward: {formatNumber($milkFromReset, 3)} milk
  </button>

  <div>
    <span>Highest milk ever: {formatWhole($highestMilk)} <br /></span>
    <span>Your highest milk ever is generating {formatWhole($milkPowerPerSec)} milk power/s <br /></span>
    <span>You have {formatWhole($resource.milkPower)} milk power</span>
  </div>

  <span>[PLACEHOLDER TITLE]</span>
  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton upgradeName="milkPowerGain">
        Increase milk power gain<br />
        Currently: 1x
      </UpgradeButton>
    </div>
    <div class="gridColumn">
      <UpgradeButton upgradeName="cheeseMonsterCapacityPerUpgrade">
        Cheeseyard Expansions are larger<br />
        Currently: +10 per Upgrade
      </UpgradeButton>
    </div>

    <div class="gridColumn" />
  </div>

  <span>[PLACEHOLDER TITLE 2]</span>
  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton upgradeName="milkThoughtsGain">
        Boost thought gain V{$milkUpgradeTier[0]}<br />
        [{$upgrades.milkThoughtsGain.bought - (cummulativeUpgradesToTier[$milkUpgradeTier[0] - 2] ?? 0)}/15 -> V2]<br />
        Currently: {formatNumber($milkUpgradeEffect[0], 2)}x
      </UpgradeButton>
      <UpgradeButton upgradeName="milkMoldyCheeseGain">
        Improve moldy cheese gain V1<br />
        [0/15 -> V2]<br />
        Current Exponent: 1x
      </UpgradeButton>
    </div>
    <div class="gridColumn">
      <UpgradeButton upgradeName="milkCheeseGain">
        Boost cheese gain V1<br />
        [0/15 -> V2]<br />
        Currently: 1x
      </UpgradeButton>
      <UpgradeButton upgradeName="milkMonsterGain">
        Boost cheese monster spawn rate V1<br />
        [0/15 -> V2]<br />
        Currently: {formatNumber($milkUpgradeEffect[3], 2)}x
      </UpgradeButton>
    </div>

    <div class="gridColumn" />
  </div>
</Window> -->
<Window title="Milk" themeColor1="#bdbdbd" themeColor2="#ffffff">
  <div>
    <span class="resourceDisplay"
      >You have {formatNumber($resource.milk, 2)} <strong style="color:white">milk</strong> <br />
    </span>
  </div>

  <span>
    This is the end of the demo! <br />
    Milk would/will be a prestige layer interacting with all of the stuff so far. <br />
    I would appreciate any feedback, suggestions, etc!
  </span>
</Window>

<style>
  * {
    --unlockedColor: white
    --maxedColor: var(--unlockedColor);
    
  }

</style>
