<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import { unlocks, derivedState, upgradeCount, unlocked, resource, upgrades, addResource } from '$lib/store'
    import AutoButton from '../AutoButton.svelte'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import UpgradeButton from '../UpgradeButton.svelte'
    import Window from './window-model/Window.svelte'

    const cryCost = 100
    function handleCry(): void {
        if (resource.value.knowledge < cryCost) return
        addResource('insight', 1)
        addResource('knowledge', -cryCost)
    }
</script>

<Window title="hmmmmmm" themeId="insight">
    <div style="display:flex; flex-direction:column; gap: 4px">
        <div class="resourceDisplay">
            {formatNumber(resource.value.insight, 2)}
            <span style="color: var(--themeColor2); font-weight:bold">Insight</span>
        </div>
        <span>{formatNumber(derivedState.insightPerSec, 2)}/s </span>
    </div>

    <AutoButton tooltipOptions={{ data: '+1 insight <br> -100 knowledge' }} onclick={handleCry} btnDisabled={resource.value.knowledge < cryCost}>
        Cry
    </AutoButton>

    <UnlockDrawer unlocks={unlocks.insight} folderName="Free 50 Aeromancer Skills" themeId="insight" />

    <div class="gridColumn">
        <UpgradeButton upgradeName="insightGeneration" tooltipText={`+${0.01} insight/s`}></UpgradeButton>
        <UpgradeButton
            upgradeName="studySmarter"
            tooltipText={`Increase the potency of the upgrade <br> "${upgrades.knowledgeGeneration.title}" by adding <br> +1 to its effect.`}>
        </UpgradeButton>

        <UpgradeButton
            upgradeName="thoughtSnap"
            tooltipText={`Increase the potency of the upgrade <br> "${upgrades.thoughtJerk.title}" by adding <br> +1 to its effect. <br>Change: +${upgradeCount.value.thoughtGeneration} thoughts/s`}>
        </UpgradeButton>
    </div>
</Window>

<style>
</style>
