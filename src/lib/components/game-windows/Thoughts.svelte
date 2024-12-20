<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import { unlocks, derivedState, upgradeCount, unlocked, resource, upgrades } from '$lib/store'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import UpgradeButton from '../UpgradeButton.svelte'
    import Window from './window-model/Window.svelte'
</script>

<Window title="Cogito" themeId="thoughts">
    <div style="display:flex; flex-direction:column; gap: 4px">
        <div class="resourceDisplay">
            {formatNumber(resource.value.thoughts, 2)}
            <span style="color: var(--themeColor2); font-weight:bold">Thoughts</span>
        </div>
        <span style="text-decoration: line-through">{formatNumber(derivedState.thoughtsPerSec, 2)}/s </span>
    </div>
    <div class="gridColumn">
        <UnlockDrawer unlocks={unlocks.thoughts} folderName="Swordsman_Skill_Icons_Pack" themeId="thoughts" />
        <UpgradeButton
            upgradeName="thoughtGeneration"
            btnUnlocked={unlocked.value.thinkFaster}
            tooltipText={`You think faster. <br>Change: +${(1 + upgradeCount.value.thoughtJerk) * (1 + upgradeCount.value.thoughtSnap)} thoughts/s <br>`}
        ></UpgradeButton>

        <UpgradeButton upgradeName="thoughtBoost" btnUnlocked={unlocked.value.thoughtBoost} tooltipText="Scales ^1.5 with #upgrades"></UpgradeButton>
    </div>
</Window>

<style>
</style>
