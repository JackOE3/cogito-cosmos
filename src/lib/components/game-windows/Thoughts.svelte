<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import { unlocks, fromPrimitive, higherOrder, upgradeCount, unlocked, resource } from '$lib/store'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import UpgradeButton from '../UpgradeButton.svelte'
    import Window from './window-model/Window.svelte'

    let thoughtAccelDisplay = $derived(
        upgradeCount.value.thoughtAcceleration > 0
            ? (higherOrder.thoughtsPerSec / upgradeCount.value.thoughtAcceleration) * (1 - 1 / fromPrimitive.thoughtsPerSecBase)
            : 1
    )
    let thoughtJerkDisplay = $derived(higherOrder.thoughtsPerSec / fromPrimitive.thoughtsPerSecBase)
</script>

<Window title="Cogito" themeId="thoughts">
    <div style="display:flex; flex-direction:column; gap: 4px">
        <div class="resourceDisplay">
            {formatNumber(resource.value.thoughts, 2)}
            <span style="color: var(--themeColor2); font-weight:bold">Thoughts</span>
        </div>
        <span>{formatNumber(higherOrder.thoughtsPerSec, 2)}/s </span>
    </div>
    <div class="gridColumn">
        <UnlockDrawer unlocks={unlocks.thoughts} folderName="Swordsman_Skill_Icons_Pack" themeId="thoughts" />
        <UpgradeButton
            upgradeName="thoughtAcceleration"
            btnUnlocked={unlocked.value.thinkFaster}
            tooltipText={`+${formatNumber(thoughtAccelDisplay, 2)} thought${thoughtAccelDisplay > 1 ? 's' : ''}/s`}>
        </UpgradeButton>

        <UpgradeButton upgradeName="thoughtBoost" btnUnlocked={unlocked.value.thoughtBoost} tooltipText="Scales ^1.5 with #upgrades"></UpgradeButton>

        <UpgradeButton
            upgradeName="thoughtJerk"
            btnUnlocked={unlocked.value.thoughtJerk}
            tooltipText={`+${formatNumber(thoughtJerkDisplay, 2)} to Effect of Thought Acceleration `}>
        </UpgradeButton>
    </div>
</Window>

<style>
</style>
