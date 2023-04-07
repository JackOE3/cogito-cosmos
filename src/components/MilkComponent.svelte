<script lang="ts">
  import { formatNumber, formatWhole } from '../gamelogic/utils'
  import { tooltip } from './tooltips/tooltip'
  import SimpleTooltip from './tooltips/SimpleTooltip.svelte'
  import UpgradeButton from './UpgradeButton.svelte'
  import Window from './WindowOLD.svelte'
  import { resource } from '../stores/resources'
  import { get } from 'svelte/store'
  import {
    cummulativeUpgradesToTier,
    milkFromReset,
    milkPowerPerSec,
    milkUpgradeEffect,
    milkUpgradeTier,
  } from '../stores/derived/milk'
  import { highestMilk, upgrades } from '../stores/mainStore'

  function handleMilkReset(): void {
    const milkGain = Math.floor(get(milkFromReset))
    if (milkGain < 1) return
    $resource.milk += milkGain
  }
</script>

<Window title="Milk" --bg="linear-gradient(90deg, #bdbdbd 0%, #ffffff 100%)">
  <div>
    <span class="resourceDisplay"
      >You have {formatNumber($resource.milk, 2)} <strong style="color:white">milk</strong> <br />
    </span>
  </div>

  <button
    style="width: 250px; "
    use:tooltip={{
      Component: SimpleTooltip,
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
      <UpgradeButton upgradeName="cheeseMonsterCapacityDelta">
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
</Window>

<style>
  * {
    --unlockedColor: white
    --maxedColor: var(--unlockedColor);
    
  }

</style>
