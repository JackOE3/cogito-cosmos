<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import { unlocks, fromPrimitive, higherOrder, upgradeCount, unlocked, resource } from '$lib/store'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import UpgradeButton from '../UpgradeButton.svelte'
    import Window from './window-model/Window.svelte'
</script>

<Window title="hmmmmmm" themeId="insight">
    <div style="display:flex; flex-direction:column; gap: 4px">
        <div class="resourceDisplay">
            {formatNumber(resource.value.insight, 2)}
            <span style="color: var(--themeColor2); font-weight:bold">Insight</span>
        </div>
        <span>{formatNumber(fromPrimitive.insightPerSec, 2)}/s </span>
    </div>
    <div class="gridColumn">
        <UnlockDrawer unlocks={unlocks.insight} folderName="Free 50 Aeromancer Skills" themeId="insight" />
    </div>
</Window>

<style>
</style>
