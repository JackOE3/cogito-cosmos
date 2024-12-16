<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import { unlocks, fromPrimitive, higherOrder, upgradeCount, unlocked, resource } from '$lib/store'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import UpgradeButton from '../UpgradeButton.svelte'
    import Window from './window-model/Window.svelte'
</script>

<Window title="Who knows?" themeId="knowledge">
    <div style="display:flex; flex-direction:column; gap: 4px">
        <div class="resourceDisplay">
            {formatNumber(resource.value.knowledge, 2)}
            <span style="color: var(--themeColor2); font-weight:bold">Knowledge</span>
        </div>
        <span>{formatNumber(fromPrimitive.knowledgePerSec, 2)}/s </span>
    </div>
    <div class="gridColumn">
        <UnlockDrawer unlocks={unlocks.knowledge} folderName="Free Alchemical Ingredient Icons Pack" themeId="knowledge" />

        <UpgradeButton
            upgradeName="knowledgeConversion"
            btnUnlocked={unlocked.value.ponderPassively}
            tooltipText={`Currently you would lose ${formatNumber(higherOrder.thoughtsPerSecKnowledgeConversion, 2)} thoughts/s <br> while acquiring knowledge (-${formatNumber(fromPrimitive.knowledgeConversionFactor * 100, 2)}%/s)  <br> Next: ${formatNumber(fromPrimitive.knowledgeConversionFactorFormula(upgradeCount.value.knowledgeConversion + 1) * 100, 2)} thoughts/s (-4%/s) `}>
        </UpgradeButton>

        <UpgradeButton upgradeName="knowledgeMultiplier" btnUnlocked={unlocked.value.ponderPassively} tooltipText={`TTTT`}></UpgradeButton>
    </div>
</Window>

<style>
</style>
