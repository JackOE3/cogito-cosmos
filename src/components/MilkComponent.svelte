<script lang="ts">
  import { formatNumber, formatWhole } from '../gamelogic/utils'
  import UpgradeButton from './UpgradeButton.svelte'
  import Window from './Window.svelte'
</script>

<Window title="Milk" --bg="linear-gradient(90deg, #bdbdbd 0%, #ffffff 100%)">
  <div>
    <span class="resourceDisplay">You have {0} <strong style="color:white">milk</strong> <br /> </span>
  </div>

  <button style="width: 250px; ">
    <strong style="color:white">Lactinity</strong>
    <br />
    Reset all* previous progress<br />
    Reward: +{formatWhole(25)} milk
  </button>

  <div>
    <span>Highest milk ever: {formatWhole(346)} <br /></span>
    <span>Your highest milk ever is generating {formatWhole(13)} milk power/s <br /></span>
    <span>You have {formatWhole(4413)} milk power</span>
  </div>

  <span>[PLACEHOLDER TITLE]</span>
  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton upgradeName="moldyCheeseHalfLife">
        Increase milk power gain<br />
        Currently: 1x
      </UpgradeButton>
      <UpgradeButton upgradeName="moldyCheeseHalfLife">
        Improve the cost scaling of Thought Acceleration<br />
        Current Base: 1.15
      </UpgradeButton>
    </div>
    <div class="gridColumn">
      <UpgradeButton upgradeName="moldyCheeseHalfLife">
        Increase the Cheeseyard capacity<br />
        Currently: 1x
      </UpgradeButton>
      <UpgradeButton upgradeName="moldyCheeseHalfLife">
        Improve the cost scaling of Thought Jerk<br />
        Currently Base: 1.30
      </UpgradeButton>
    </div>

    <div class="gridColumn" />
  </div>

  <span>[PLACEHOLDER TITLE 2]</span>
  <div class="flexRowContainer">
    <div class="gridColumn">
      <UpgradeButton upgradeName="moldyCheeseHalfLife">
        Boost thought gain V1<br />
        [2/15 -> V2]<br />
        Currently: 1x
      </UpgradeButton>
      <UpgradeButton upgradeName="moldyCheeseHalfLife">
        Improve MC conversion scaling V1<br />
        [0/15 -> V2]<br />
        Current Exponent: 1x
      </UpgradeButton>
    </div>
    <div class="gridColumn">
      <UpgradeButton upgradeName="moldyCheeseHalfLife">
        Boost cheese gain V1<br />
        [0/15 -> V2]<br />
        Currently: 1x
      </UpgradeButton>
      <UpgradeButton upgradeName="moldyCheeseHalfLife">
        Boost cheese monster spawn rate V1<br />
        [0/15 -> V2]<br />
        Current Rate: 1.30
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
