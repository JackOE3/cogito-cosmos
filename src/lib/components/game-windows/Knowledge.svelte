<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import { unlocks, derivedState, upgradeCount, unlocked, resource, upgrades } from '$lib/store'
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
        <span>{formatNumber(derivedState.knowledgePerSec, 2)}/s </span>
    </div>
    <div class="gridColumn">
        <UnlockDrawer unlocks={unlocks.knowledge} folderName="Free Alchemical Ingredient Icons Pack" themeId="knowledge" />

        <UpgradeButton upgradeName="knowledgeGeneration" tooltipText={`+${0.1} knowledge/s`}></UpgradeButton>

        <UpgradeButton
            upgradeName="thoughtJerk"
            tooltipText={`Increase the potency of the upgrade <br> "${upgrades.thoughtGeneration.title}" by adding <br> +${1 + upgradeCount.value.thoughtSnap} to its effect. <br>Change: +${upgradeCount.value.thoughtGeneration * (1 + upgradeCount.value.thoughtSnap)} thoughts/s`}>
        </UpgradeButton>

        <!-- <UpgradeButton
            upgradeName="knowledgeConversion"
            btnUnlocked={unlocked.value.ponderPassively}
            tooltipText={`Currently you would lose ${formatNumber(derivedState.thoughtsPerSecKnowledgeConversion, 2)} thoughts/s <br> while acquiring knowledge (-${formatNumber(derivedState.knowledgeConversionFactor * 100, 2)}%/s)  <br> Next: ${formatNumber(derivedState.knowledgeConversionFactorFormula(upgradeCount.value.knowledgeConversion + 1) * 100, 2)} thoughts/s (-4%/s) `}>
        </UpgradeButton>

        <UpgradeButton upgradeName="knowledgeMultiplier" btnUnlocked={unlocked.value.ponderPassively} tooltipText={`TTTT`}></UpgradeButton> -->
    </div>
</Window>

<style>
</style>
