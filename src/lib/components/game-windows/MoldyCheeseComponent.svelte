<script lang="ts">
    import Window from './window-model/Window.svelte'
    import { formatNumber, formatWhole } from '$lib/gamelogic/utils'
    import UpgradeButton from '../UpgradeButton.svelte'
    import {
        LORCA_OVERRIDE,
        resource,
        unlocked,
        cheeseCycleDuration,
        mcHalfLifeSeconds,
        moldyCheeseChance,
        cheeseMonsterCapacity,
        cheeseMonsterSpawnrate,
        unlocks,
        mcByproductAmount,
        mcManualConversionAmount,
        mcConversionExponent,
        mcHalflifeBoostFactor,
        mcConversionCooldownMS,
        WindowId
    } from '$lib/store'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import EffectComponent from '../EffectComponent.svelte'
    import Effect from '../Effect.svelte'

    export let windowId: WindowId

    const buyMaxUpgrades = false

    let conversionOnCD = false

    let cdTimer: number
    let intervalId: number
    function handleMoldyCheeseGenerationButton(): void {
        if (conversionOnCD) return
        conversionOnCD = true
        cdTimer = $mcConversionCooldownMS
        $resource.moldyCheese += $mcManualConversionAmount
        $resource.cheese = 0

        let lastTime = Date.now()
        clearInterval(intervalId)
        intervalId = setInterval(() => {
            const currentTime = Date.now()
            const dt = Math.max(Math.min(currentTime - lastTime, 1000), 0)
            lastTime = currentTime
            cdTimer -= dt
            if (cdTimer <= 0) {
                conversionOnCD = false
                clearInterval(intervalId)
            }
        }, 100)
    }
</script>

<Window title="Cultured Delicacy" themeId="moldyCheese" {windowId}>
    <div slot="minimized" class="flexRowContainer">
        <div style="width: 250px">
            <span class="resourceDisplay">
                You have {formatNumber($resource.moldyCheese, 2)}
                <span style="font-weight:bold" class="colorText">moldy cheese</span>
            </span>
            <br />
            <span>
                {#if $unlocked.moldyCheeseByproduct || $LORCA_OVERRIDE}
                    ~ {formatNumber(($mcByproductAmount / ($cheeseCycleDuration / 1000)) * $moldyCheeseChance, 2)}/s
                {:else}
                    ...???
                {/if}
            </span>
        </div>
        <UnlockDrawer --num-slots="1" unlocks={unlocks.moldyCheese} folderName="Free Alchemical Ingredient Icons Pack" />
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
        <span class="resourceDisplay">
            You have {formatNumber($resource.moldyCheese, 2)}
            <span style="font-weight:bold" class="colorText">moldy cheese</span>
            <br />
        </span>
        <span>
            Half-life: {formatWhole($mcHalfLifeSeconds)}s (-{formatNumber(100 - 100 * (1 - Math.log(2) / $mcHalfLifeSeconds), 2)}%/s) <br />
            (Moldy cheese is an unstable isotope of cheese and can decay) <br />
            {#if $unlocked.moldyCheeseByproduct || $LORCA_OVERRIDE}
                You gain {formatNumber($mcByproductAmount, 2)} moldy cheese
                {#if $moldyCheeseChance !== 1}
                    with a {formatWhole($moldyCheeseChance * 100)}% chance
                {/if}
                whenever a cheese cycle completes
                <br />
                Estimated rate: {formatNumber(($mcByproductAmount / ($cheeseCycleDuration / 1000)) * $moldyCheeseChance, 2)} moldy cheese/s
            {:else}
                ...???
                <br />
                ...???
            {/if}
        </span>
    </div>

    <button style="width: 250px; " on:click={handleMoldyCheeseGenerationButton} disabled={conversionOnCD}>
        <strong style="color:yellow">Cheese Sacrifice</strong>
        <br />
        Convert all cheese into<br />
        {formatNumber($mcManualConversionAmount, 2)} moldy cheese
        <br />
        <span> Cooldown: {formatWhole($mcConversionCooldownMS / 1000)}s </span>
        {#if conversionOnCD}
            <span>({formatNumber(cdTimer / 1000, 1)}s)</span>
        {/if}
    </button>

    <UnlockDrawer unlocks={unlocks.moldyCheese} folderName="Free Alchemical Ingredient Icons Pack" />

    <div class="flexRowContainer">
        <div class="gridColumn">
            <UpgradeButton
                upgradeName="moldyCheeseConversionExponent"
                {buyMaxUpgrades}
                tooltipText={`Currently: cheese^${formatNumber($mcConversionExponent, 4)}`}>
                Improve the conversion function <br />
            </UpgradeButton>

            <UpgradeButton
                upgradeName="moldyCheeseHalfLife"
                {buyMaxUpgrades}
                tooltipText={`+10s half-life <br> Currently: ${formatWhole($mcHalfLifeSeconds)}s`}>
                Increase MC half-life <br />
            </UpgradeButton>

            <UpgradeButton
                upgradeName="moldyCheeseChance"
                {buyMaxUpgrades}
                btnUnlocked={$unlocked.moldyCheeseByproduct}
                tooltipText={`+10% chance (additive) <br> Currently: ${formatNumber($moldyCheeseChance * 100, 1)}%`}>
                Increase MC byproduct chance <br />
            </UpgradeButton>

            <UpgradeButton
                upgradeName="cheeseMonsterSpawnrate"
                {buyMaxUpgrades}
                btnUnlocked={$unlocked.cheeseyard}
                tooltipText={$cheeseMonsterSpawnrate < 1
                    ? `+${formatWhole(20)} spawns/min <br> Currently: ${formatWhole($cheeseMonsterSpawnrate * 60)} spawns/min`
                    : `+${formatNumber(20 / 60, 2)} spawns/s <br> Currently: ${formatNumber($cheeseMonsterSpawnrate, 2)} spawns/s`}>
                Improve the spawn rate in the cheeseyard <br />
            </UpgradeButton>

            <UpgradeButton
                upgradeName="cheeseMonsterCapacity"
                {buyMaxUpgrades}
                btnUnlocked={$unlocked.cheeseyard}
                tooltipText={`+10 capacity <br> Currently: ${formatWhole($cheeseMonsterCapacity)}`}>
                Expand the Cheeseyard <br />
            </UpgradeButton>
        </div>

        <div class="gridColumn" style="height:332px; width: 100%">
            <EffectComponent>
                <Effect factor={$mcHalflifeBoostFactor} unlocked={$unlocked.moldyCheeseHalflifeBoost} tooltipText={`Scales ^${3} with half life.`}>
                    Cheese gain is additionally boosted by MC half-life
                </Effect>
            </EffectComponent>
        </div>
    </div>
</Window>

<style>
    * {
        --maxedColor: rgb(60, 255, 0);
    }
    .colorText {
        color: rgb(60, 255, 0);
    }
</style>
