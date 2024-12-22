<script lang="ts">
    import Window from './window-model/Window.svelte'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import { formatNumber, formatTime } from '$lib/gamelogic/utils'
    import UpgradeButton from '../UpgradeButton.svelte'
    import { unlocks, LORCA_OVERRIDE, resource, unlocked, derivedState, mood, upgradeCount, enlightenmentStage } from '$lib/store'

    import { onDestroy, onMount } from 'svelte'
    import { tooltip } from '../tooltips/tooltip.svelte'
    import ProgBar from '../misc/ProgBar.svelte'

    const enlightenmentStageNames = [
        'Amoeba',
        'Cockroach',
        // ...
        'Buddha'
    ]
</script>

<Window title="Enlightenment" themeId="cogitoErgoSum" --width="500px">
    <!-- <div style="position: absolute; right: 8px; top: 8px;">
            <input type="checkbox" name="buyMax" bind:checked={buyMaxUpgrades} />
            <label for="buyMax">Buy Max</label>
        </div> -->
    <span style="font-size: .875rem">You are at Stage {enlightenmentStage.value}: {enlightenmentStageNames[enlightenmentStage.value] ?? 'Not yet named'}</span>
    <div style="height: 2rem; width:100%; display: flex; gap:8px">
        <div class="stage">Amoeba</div>
        <div style="flex: 1; width: 100%; height: 100%;">
            <ProgBar --widthProgBar="100%" --heightProgBar="2rem" --progress="{20}%">Next stage at 2.5K EP</ProgBar>
        </div>

        <div class="stage">Cockroach</div>
    </div>

    <span
        >You have {formatNumber(resource.value.enlightenmentPoints, 2)} enlightenment points <br /> {formatNumber(derivedState.enlightenmentPerSec, 2)}/s</span>

    <span>Your active <strong>Blessings</strong>:</span>
    <div style="display: flex; flex-direction: row; gap: 0;">
        <button style="aspect-ratio:1; width: 60px;">Skill1</button>
        <button style="aspect-ratio:1; width: 60px;">Skill2</button>
        <button style="aspect-ratio:1; width: 60px;">Skill3</button>
    </div>
</Window>

<style>
    .stage {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--dp01);
        width: 60px;
        padding: 8px;
        border: 1px solid var(--dp08);
    }
</style>
