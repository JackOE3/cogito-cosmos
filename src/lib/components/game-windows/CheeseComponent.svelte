<script lang="ts">
    import Window from './window-model/Window.svelte'
    import EffectComponent from '../EffectComponent.svelte'
    import Effect from '../Effect.svelte'
    import { costColor, formatNumber, formatTime, formatWhole } from '$lib/gamelogic/utils'
    import { fade, slide } from 'svelte/transition'
    import ProgBar from '../misc/ProgBar.svelte'
    import UpgradeButton from '../UpgradeButton.svelte'
    import InputRange from '../misc/InputRange.svelte'
    import {
        LORCA_OVERRIDE,
        resource,
        upgrades,
        unlocked,
        currentCheeseQueue,
        cheeseQueueOverclockLvl,
        cheeseFactoryMode,
        cheeseQueueTotalCycles,
        cheeseModeFactor,
        cheeseCycleDuration,
        cheeseCycleBatchSize,
        cheeseCycleCost,
        cheeseQueueCostDivideBy,
        cheeseCycleBase,
        cheeseQueueActive,
        cheeseQueueOverclockSpeedMult,
        maxCheeseQueue,
        cheeseYieldDeltaDuration,
        cheeseQueueLengthBoostFactor,
        cheeseCycleAcceleratorFactor,
        cheeseThoughtMult,
        cheeseCyclesThoughtMult,
        unlocks,
        UnlockName,
        mcCycleDurationBoostFactor,
        moldyCheeseChance,
        mcByproductAmount,
        WindowId,
        cheeseCyclesPerBarFill
    } from '$lib/store'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import { tooltip } from '../tooltips/tooltip.svelte'
    import CheeseFactoryProtocol from '../tooltips/CheeseFactoryProtocol.svelte'
    import { onDestroy, onMount } from 'svelte'
    import Image from '../Image.svelte'

    export let windowId: WindowId

    const buyMaxUpgrades = false
    // extracting the stores from the cheeseCycleBase object
    const cheeseCycleBaseYield = cheeseCycleBase.yield
    const cheeseCycleBaseDuration = cheeseCycleBase.duration
    const cheeseCycleBaseCost = cheeseCycleBase.cost

    // 1 if it's active, 0 when not
    // $: cheeseQueueActive = cheeseCycleBase.state === 'running'
    $: cheesePerSecFromQueue = +$cheeseQueueActive * 1000 * ($cheeseCycleBatchSize / $cheeseCycleDuration)

    let cheeseBarProgress = 0
    let lastTime: number | null = null
    let myReq: number

    onMount(() => {
        if ($cheeseQueueActive) myReq = requestAnimationFrame(animateCheeseBar)
    })
    onDestroy(() => {
        cancelAnimationFrame(myReq)
    })

    function resetCheeseBar(): void {
        cheeseBarProgress = 0
    }

    function handleCheeseQueueButton(): void {
        if ($resource.thoughts < $cheeseCycleCost) return
        // top up queue:
        $currentCheeseQueue = $maxCheeseQueue
        handleCheeseGenerationInit()
    }

    /**
     * Triggered when manually starting the cheese generation (with button or input range)
     */
    function handleCheeseGenerationInit(): void {
        if ($cheeseQueueActive) return
        if ($resource.thoughts < $cheeseCycleCost) return
        $resource.thoughts -= $cheeseCycleCost
        if ($currentCheeseQueue >= 1) $currentCheeseQueue--
        $cheeseQueueActive = true

        lastTime = null

        /* TODO: insert here logic for if cheeseCycleBaseDuration exceeds a certain speed, then no animation, just a static bar with
    statistical averages for calculations */
        myReq = requestAnimationFrame(animateCheeseBar)
    }

    function animateCheeseBar(currentTime: number): void {
        if (lastTime === null) lastTime = currentTime
        const deltaTimeMillis = Math.max(Math.min(currentTime - lastTime), 0)
        lastTime = currentTime
        // the value of cheeseBarProgress is fed to CSS
        cheeseBarProgress += deltaTimeMillis
        while (cheeseBarProgress >= $cheeseCycleDuration) {
            handleCheeseGeneration()
            // console.log('Completed a cycle with ' + $cheeseCycleDuration, cheeseBarProgress)
            cheeseBarProgress -= $cheeseCycleDuration
            if (cheeseBarProgress < $cheeseCycleDuration) cheeseBarProgress = 0
        }
        if ($cheeseQueueActive) myReq = requestAnimationFrame(animateCheeseBar)
    }

    /**
     * This function shall be called whenever the cheese bar completes a cycle.
     */
    function handleCheeseGeneration(): void {
        $resource.cheese += $cheeseCycleBatchSize

        if (!$currentCheeseQueue) {
            // 'initial' better than 'paused', because the animation might've already started a small bit
            cheeseQueueActive.set(false)
            return
        }
        if ($resource.thoughts < $cheeseCycleCost) {
            cheeseQueueActive.set(false)
            return
        }

        $resource.thoughts -= $cheeseCycleCost
        if ($currentCheeseQueue >= 1) $currentCheeseQueue--
        $cheeseQueueTotalCycles += $cheeseCyclesPerBarFill

        // HANDLEMOLDY CHEESE
        if ($unlocked.moldyCheeseByproduct) {
            if (Math.random() < $moldyCheeseChance) {
                $resource.moldyCheese += $mcByproductAmount
            }
        }
    }
</script>

<Window title="Switzerland Simulator" themeId="cheese" {windowId}>
    <div slot="minimized" class="flexRowContainer">
        <div style="width: 250px">
            <span class="resourceDisplay"
                >You have {formatNumber($resource.cheese, 2)}
                <span class="colorText" style="font-weight:bold">cheese</span>
                <br />
            </span>
            ~ {formatNumber(cheesePerSecFromQueue, 2)}/s
        </div>
        <UnlockDrawer --num-slots="1" unlocks={unlocks.cheese} folderName="Free 50 Aeromancer Skills" />
    </div>

    <div style="width:max-content">
        <span class="resourceDisplay"
            >You have {formatNumber($resource.cheese, 2)} <span class="colorText" style="font-weight:bold">cheese</span>
            <br />
        </span>
        ~ {formatNumber(cheesePerSecFromQueue, 2)}/s
    </div>

    <div style="display:flex; flex-direction:column; width:516px">
        <div class="flexRowContainer" style="height:max-content">
            <button
                style="width:170px; height: 2.5rem"
                on:click={handleCheeseQueueButton}
                class:disabled={$resource.thoughts < $cheeseCycleCost}>
                {#if $cheeseQueueActive}
                    Top up the <br />cheese queue
                {:else}
                    Make cheese <br />
                    <span style="color: {costColor($resource.thoughts >= $cheeseCycleCost)}">
                        {formatNumber($cheeseCycleCost, 2)} thoughts
                    </span>
                {/if}
            </button>

            <div class="gridColumn" style="width:100%">
                <div id="cheeseBar">
                    <ProgBar
                        --width="100%"
                        --height="16px"
                        --barColor="yellow"
                        --progress="{(100 * cheeseBarProgress) / $cheeseCycleDuration}%" />
                </div>

                <div style="width:100%; margin-top:0px;">
                    {#if $unlocked.cheeseQueue}
                        <div
                            transition:fade|local={{ duration: 1000 }}
                            style="display:grid; grid-template-columns: auto 1fr auto; gap: 8px">
                            <span class="flexCenter">Cheese Queue:</span>

                            <InputRange
                                min={0}
                                max={$maxCheeseQueue}
                                bind:value={$currentCheeseQueue}
                                onChange={handleCheeseGenerationInit} />

                            <span
                                class="flexCenter"
                                style="width: 40px; height: 1rem; background: var(--Gray800); border-radius: 2px;">
                                {$currentCheeseQueue}
                            </span>
                        </div>
                    {:else}
                        <div style="text-align: center; ">???</div>
                    {/if}
                </div>
            </div>
        </div>

        <p style="margin-bottom: 0px; margin-top: 8px; height: 1.625rem; width: 486px">
            Industrious swiss workers are producing
            {formatNumber($cheeseCycleBatchSize, 2)}<!--
    -->{#if $cheeseModeFactor.yield !== 1}
                <span style="color:orange;">[{$cheeseModeFactor.yield}x]</span>
            {/if} cheese every
            {formatTime($cheeseCycleDuration / 1000)}<!--
      -->{#if $cheeseModeFactor.duration !== 1}
                <span style="color:orange;">[{$cheeseModeFactor.duration}x]</span>
            {/if}
            <span>
                while consuming {formatNumber($cheeseCycleCost, 2)}<!--
        -->{#if $cheeseModeFactor.cost !== 1}
                    <span style="color:orange;">[{$cheeseModeFactor.cost}x]</span>
                {/if}
                thoughts. (~{formatNumber(($cheeseCycleCost / $cheeseCycleDuration) * 1000, 2)}
                thoughts/s)
            </span>
        </p>

        {#if $unlocked.cheeseCycleAccelerator}
            <span style="margin-top: .25rem" transition:fade|local={{ duration: 500 }}>
                Total Cheese Cycles: {formatWhole($cheeseQueueTotalCycles)}
            </span>
        {:else}
            <span style="margin-top: .25rem"> ...??? </span>
        {/if}
    </div>

    {#if $unlocked.cheeseQueueOverclocking || $LORCA_OVERRIDE}
        <div
            class="flexRowContainer"
            transition:slide|local={{ duration: 1000 }}
            style="align-items:flex-end; margin-top: -8px; height: 71px">
            <div style="display:flex; flex-direction:row; gap: 2px;">
                <div
                    style="display:flex; flex-direction:column; background-color: var(--Gray800)"
                    class="button-border"
                    use:tooltip={{
                        data: 'Increases the speed of a cheese cycle. <br> Every level increases SPEED by 5%, but doubles the COST. <br> (multiplicative)'
                    }}>
                    <div
                        style="height:1.25rem; border-bottom: 2px solid rgba(255, 255, 255, 0.4); display:flex; align-items: center; justify-content: center; gap: 0.5rem">
                        <span style="font-size:.875rem; font-weight: bold"> Overclocking </span>
                        <span style="font-size:.875rem;">LV{$cheeseQueueOverclockLvl}</span>
                    </div>

                    <div style="height:2.5rem; display:flex; flex-direction:row; ">
                        <div
                            style="width: 4rem; display:flex; flex-direction:column; justify-content:center; align-items: center; gap: 0.125rem ">
                            <span
                                style="font-weight: bold; color:white; background: rgb(10, 125, 16); padding-left:0.25rem; padding-right: 0.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.4); ">
                                SPEED
                            </span>
                            <span> {formatNumber($cheeseQueueOverclockSpeedMult, 2)} Hz</span>
                        </div>
                        <div
                            style="width: 10rem; display:flex; flex-direction:column;  justify-content:center; align-items: center; gap: 0.125rem; border-left: 2px solid rgba(255, 255, 255, 0.4)">
                            <span
                                style="font-weight: bold; color:white; background: rgb(115, 0, 2); padding-left:0.25rem; padding-right: 0.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.4); ">
                                COST
                            </span>
                            <span> {formatNumber($cheeseCycleBaseCost, 2)} thoughts/cycle</span>
                        </div>
                    </div>
                </div>
                <div style="width: 100%; display:flex; flex-direction:column; justify-content: space-between">
                    <button
                        style="height: 2rem; width: 2rem; display: flex;"
                        on:click={() => $cheeseQueueOverclockLvl++}>
                        <div style="scale: 0.5; transform: rotate(180deg); filter: invert(100%); ">
                            <Image name="chevron-arrow-down" alt="+1 level" />
                        </div>
                    </button>
                    <button
                        style="height: 2rem; width: 2rem; display: flex;"
                        on:click={() => $cheeseQueueOverclockLvl--}>
                        <div style="scale: 0.5; filter: invert(100%);">
                            <Image name="chevron-arrow-down" alt="-1 level" />
                        </div>
                    </button>
                </div>
            </div>

            {#if $unlocked.cheeseModes || $LORCA_OVERRIDE}
                <div transition:slide|local={{ duration: 1000 }}>
                    <fieldset on:change={resetCheeseBar}>
                        <legend>Cheese Factory Protocol</legend>

                        <label
                            use:tooltip={{
                                data: 'meticulous',
                                Component: CheeseFactoryProtocol,
                                anchor: 'parentElement'
                            }}>
                            <input
                                type="radio"
                                name="cheeseFactoryMode"
                                bind:group={$cheeseFactoryMode}
                                value="meticulous" />
                            meticulous
                        </label>
                        <label
                            use:tooltip={{
                                data: 'nominal',
                                Component: CheeseFactoryProtocol,
                                anchor: 'parentElement'
                            }}>
                            <input
                                type="radio"
                                name="cheeseFactoryMode"
                                bind:group={$cheeseFactoryMode}
                                value="nominal" />
                            nominal
                        </label>
                        <label
                            use:tooltip={{
                                data: 'warpSpeed',
                                Component: CheeseFactoryProtocol,
                                anchor: 'parentElement'
                            }}>
                            <input
                                type="radio"
                                name="cheeseFactoryMode"
                                bind:group={$cheeseFactoryMode}
                                value="warpSpeed" />
                            warp speed
                        </label>
                    </fieldset>
                </div>
            {/if}
        </div>
    {/if}

    <UnlockDrawer unlocks={unlocks.cheese} folderName="Free 50 Aeromancer Skills" />

    <div class="flexRowContainer">
        <div class="gridColumn">
            <UpgradeButton
                upgradeName="cheeseYield"
                {buyMaxUpgrades}
                tooltipText={`+${formatNumber(
                    (($upgrades.cheeseYield.bought + 1) * $cheeseCycleBatchSize) / $cheeseCycleBaseYield,
                    2
                )}
        cheese per cycle <br>
        +${formatTime((cheeseYieldDeltaDuration * $cheeseCycleDuration) / $cheeseCycleBaseDuration / 1000)}
        cycle duration <br>(without scaling: +0.5s cycle duration)`}>
                Your workers create more cheese but also take longer
            </UpgradeButton>

            <UpgradeButton
                upgradeName="cheeseQueueLength"
                {buyMaxUpgrades}
                btnUnlocked={$unlocked.cheeseQueue}
                tooltipText={`+${5} capacity <br> Currently: ${$maxCheeseQueue}`}>
                <span>Lengthen the <span style="color:yellow; font-weight: bold">Cheese Queue</span></span>
            </UpgradeButton>

            <UpgradeButton
                upgradeName="cheeseThoughtMult"
                {buyMaxUpgrades}
                btnUnlocked={$unlocked.cheeseQueue}
                tooltipText={`Currently: ${
                    $upgrades.cheeseThoughtMult.bought * $upgrades.cheeseThoughtMult.bought
                }x <br> Scales ^2 with #upgrades.`}>
                {#if $upgrades.cheeseThoughtMult.bought === 0}
                    Cheese increases thought gain
                {:else}
                    Increase effect of cheese boosting thought gain
                {/if}
            </UpgradeButton>

            <UpgradeButton
                upgradeName="cheeseQueueOverclockingCost"
                {buyMaxUpgrades}
                btnUnlocked={$unlocked.cheeseQueueCostDivide}
                tooltipText={`Current Divisor: ${formatNumber($cheeseQueueCostDivideBy, 2)}`}>
                Divide the cost requirement of Overclocking <br />
            </UpgradeButton>
        </div>

        <div class="gridColumn" style="height:264px; width: 100%">
            <EffectComponent
                title={$upgrades.cheeseThoughtMult.bought > 0 || $unlocked.cheeseQueueLengthBoost ? 'Effects' : '???'}>
                <Effect
                    factor={$cheeseThoughtMult}
                    unlocked={$upgrades.cheeseThoughtMult.bought > 0}
                    tooltipText={`Scaling: log(cheese) &times; ${
                        $upgrades.cheeseThoughtMult.bought * $upgrades.cheeseThoughtMult.bought
                    }`}>
                    Cheese increases thoughts/s
                </Effect>

                <Effect
                    factor={$cheeseQueueLengthBoostFactor}
                    unlocked={$unlocked.cheeseQueueLengthBoost}
                    tooltipText="Scaling: capacity^2">
                    {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_QUEUE_LENGTH_BOOST)?.description}
                </Effect>

                <Effect
                    factor={$cheeseCycleAcceleratorFactor}
                    unlocked={$unlocked.cheeseCycleAccelerator}
                    tooltipText="Scaling: log(cycles)">
                    {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_CYCLE_ACCELERATOR)?.description}
                </Effect>

                <Effect
                    factor={$cheeseCyclesThoughtMult}
                    unlocked={$unlocked.cheeseCyclesBoostThoughts}
                    tooltipText="Scaling: cycles^1.5">
                    {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_CYCLES_BOOST_THOUGHTS)?.description}
                </Effect>

                <Effect
                    factor={$mcCycleDurationBoostFactor}
                    unlocked={$unlocked.moldyCheeseCycleDurationBoost}
                    tooltipText={`Scales ^${1.5} with relative duration.`}>
                    MC byproduct gain is boosted by the rel. duration of the cheese cycle
                </Effect>
            </EffectComponent>
        </div>
    </div>
</Window>

<style>
    .colorText {
        color: var(--themeColor2);
    }
    #cheeseBar {
        width: 100%;
    }
</style>
