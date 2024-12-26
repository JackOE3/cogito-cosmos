<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import { unlocks, derivedState, upgradeCount, unlocked, resource, upgrades } from '$lib/store'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import UpgradeButton from '../UpgradeButton.svelte'
    import Window from './window-model/Window.svelte'
</script>

<Window title="Wisdom" themeId="insight">
    <div style="display:flex; flex-direction:column; gap: 4px">
        <div class="resourceDisplay">
            {formatNumber(resource.value.wisdom, 2)}
            <span style="color: var(--themeColor2); font-weight:bold">Wisdom</span>
        </div>
        <span>{formatNumber(derivedState.wisdomPerSec, 2)}/s </span>
    </div>
    <div class="gridColumn">
        <UpgradeButton upgradeName="gainEP" tooltipText={`Gain ${5} enlightenment points`}></UpgradeButton>
    </div>
</Window>

<style>
</style>
