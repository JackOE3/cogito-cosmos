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
        upgradeCount,
        unlocked,
        currentCheeseQueue,
        cheeseQueueOverclockLvl,
        cheeseFactoryMode,
        cheeseQueueTotalCycles,
        cheeseQueueActive,
        unlocks,
        UnlockName,
        derivedState,
        fastFowardFactor,
        addResource
    } from '$lib/store'
    import UnlockDrawer from '../UnlockDrawer.svelte'
    import { tooltip } from '../tooltips/tooltip.svelte'
    import CheeseFactoryProtocol from '../tooltips/CheeseFactoryProtocol.svelte'
    import { onDestroy, onMount } from 'svelte'
    import Image from '../Image.svelte'

    const buyMaxUpgrades = false

    // 1 if it's active, 0 when not
    // $: cheeseQueueActive = cheeseCycleBase.state === 'running'
    let cheesePerSecFromQueue = $derived(+cheeseQueueActive.value * 1000 * (derivedState.cheeseCycleYield / derivedState.cheeseCycleDuration))

    let cheeseBarProgress = $state(0)
    let lastTime: number | null = null
    let myReq: number

    onMount(() => {
        if (cheeseQueueActive.value) myReq = requestAnimationFrame(animateCheeseBar)
    })
    onDestroy(() => {
        cancelAnimationFrame(myReq)
    })

    function resetCheeseBar(): void {
        cheeseBarProgress = 0
    }

    function handleCheeseQueueButton(): void {
        if (resource.value.enerchee < derivedState.cheeseCycleCost) return
        // top up queue:
        currentCheeseQueue.value = derivedState.maxCheeseQueue
        handleCheeseGenerationInit()
    }

    /**
     * Triggered when manually starting the cheese generation (with button or input range)
     */
    function handleCheeseGenerationInit(): void {
        if (cheeseQueueActive.value) return

        if (resource.value.enerchee < derivedState.cheeseCycleCost) return
        resource.value.enerchee -= derivedState.cheeseCycleCost
        if (currentCheeseQueue.value >= 1) currentCheeseQueue.value--
        cheeseQueueActive.value = true

        lastTime = null

        /* TODO: insert here logic for if cheeseCycleBaseDuration exceeds a certain speed, then no animation, just a static bar with
    statistical averages for calculations */
        myReq = requestAnimationFrame(animateCheeseBar)
    }

    function animateCheeseBar(currentTime: number): void {
        if (lastTime === null) lastTime = currentTime
        const deltaTimeMillis = Math.max(Math.min(currentTime - lastTime), 0)
        lastTime = currentTime
        // the value of cheeseBarProgress is fed to CSSs
        cheeseBarProgress += deltaTimeMillis * fastFowardFactor.value
        while (cheeseBarProgress >= derivedState.cheeseCycleDuration) {
            handleCheeseGeneration()
            // console.log('Completed a cycle with ' + derivedState.cheeseCycleDuration, cheeseBarProgress)
            cheeseBarProgress -= derivedState.cheeseCycleDuration
            // ensures that the progress bar will always start from 0 and not carry over some remainder:
            if (cheeseBarProgress < derivedState.cheeseCycleDuration) cheeseBarProgress = 0
        }
        if (cheeseQueueActive.value) myReq = requestAnimationFrame(animateCheeseBar)
    }

    /**
     * This function shall be called whenever the cheese bar completes a cycle.
     */
    function handleCheeseGeneration(): void {
        addResource('cheese', derivedState.cheeseCycleYield)

        if (currentCheeseQueue.value === 0) {
            // 'initial' better than 'paused', because the animation might've already started a small bit
            cheeseQueueActive.value = false
            return
        }
        if (resource.value.enerchee < derivedState.cheeseCycleCost) {
            cheeseQueueActive.value = false
            return
        }

        resource.value.enerchee -= derivedState.cheeseCycleCost
        if (currentCheeseQueue.value >= 1) currentCheeseQueue.value--
        cheeseQueueTotalCycles.value += derivedState.cheeseCyclesPerBarFill

        // HANDLEMOLDY CHEESE
        if (unlocked.value.moldyCheeseByproduct) {
            if (Math.random() < derivedState.moldyCheeseChance) {
                //resource.value.moldyCheese += derivedState.mcByproductAmount
            }
        }
    }

    function handleConvertToEnerchee() {
        addResource('enerchee', derivedState.convertToEnerchee)
        resource.value.thoughts = 0
    }
</script>

<Window title="Switzerland Simulator" themeId="cheese">
    <div style="display:flex; flex-direction:column; width:516px">
        <button onclick={handleConvertToEnerchee}>Convert all thoughts <br /> to {formatNumber(derivedState.convertToEnerchee, 2)} enerchee</button>
        <span>{formatNumber(resource.value.enerchee, 2)} enerchee</span>
        <div class="flexRowContainer" style="height:max-content">
            <button
                style="width:170px; height: 2.5rem"
                onclick={handleCheeseQueueButton}
                class:disabled={resource.value.enerchee < derivedState.cheeseCycleCost}>
                {#if cheeseQueueActive.value && unlocked.value.cheeseQueue}
                    Top up the <br />cheese queue
                {:else}
                    Make cheese <br />
                    <span style="color: {costColor(resource.value.enerchee >= derivedState.cheeseCycleCost)}">
                        {formatNumber(derivedState.cheeseCycleCost, 2)} enerchee
                    </span>
                {/if}
            </button>

            <div class="gridColumn" style="width:100%">
                <div id="cheeseBar">
                    <ProgBar
                        --widthProgBar="100%"
                        --heightProgBar="1rem"
                        --barColor="var(--themeColor2)"
                        --progress="{(100 * cheeseBarProgress) / derivedState.cheeseCycleDuration}%" />
                </div>

                <div style="width:100%; margin-top:0px;">
                    {#if unlocked.value.cheeseQueue}
                        <div transition:fade|local={{ duration: 1000 }} style="display:grid; grid-template-columns: auto 1fr auto; gap: 8px">
                            <span class="flexCenter">Cheese Queue:</span>

                            <InputRange min={0} max={derivedState.maxCheeseQueue} bind:value={currentCheeseQueue.value} onChange={handleCheeseGenerationInit} />

                            <span class="flexCenter" style="width: 40px; height: 1rem; background: var(--Gray800); border-radius: 2px;">
                                {currentCheeseQueue.value}
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
            {formatNumber(derivedState.cheeseCycleYield, 2)}
            {#if derivedState.cheeseModeFactor.yield !== 1}
                <span style="color:orange;">[{derivedState.cheeseModeFactor.yield}x]</span>
            {/if} cheese every
            {formatTime(derivedState.cheeseCycleDuration / 1000)}
            {#if derivedState.cheeseModeFactor.duration !== 1}
                <span style="color:orange;">[{derivedState.cheeseModeFactor.duration}x]</span>
            {/if}
            <span>
                while consuming {formatNumber(derivedState.cheeseCycleCost, 2)}
                {#if derivedState.cheeseModeFactor.cost !== 1}
                    <span style="color:orange;">[{derivedState.cheeseModeFactor.cost}x]</span>
                {/if}
                enerchee. (-{formatNumber((derivedState.cheeseCycleCost / derivedState.cheeseCycleDuration) * 1000, 2)}
                enerchee/s, +{formatNumber((derivedState.cheeseCycleYield / derivedState.cheeseCycleDuration) * 1000, 2)} cheese/s)
            </span>
        </p>

        {#if unlocked.value.cheeseCycleAccelerator}
            <span style="margin-top: .25rem" transition:fade|local={{ duration: 500 }}>
                Total Cheese Cycles: {formatWhole(cheeseQueueTotalCycles.value)}
            </span>
        {:else}
            <span style="margin-top: .25rem"> ...??? </span>
        {/if}
    </div>

    {#if unlocked.value.cheeseQueueOverclocking || LORCA_OVERRIDE.value}
        <div class="flexRowContainer" transition:slide|local={{ duration: 1000 }} style="align-items:flex-end; margin-top: -8px; height: 71px">
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
                        <span style="font-size:.875rem;">LV{cheeseQueueOverclockLvl.value}</span>
                    </div>

                    <div style="height:2.5rem; display:flex; flex-direction:row; ">
                        <div style="width: 4rem; display:flex; flex-direction:column; justify-content:center; align-items: center; gap: 0.125rem ">
                            <span
                                style="font-weight: bold; color:white; background: rgb(10, 125, 16); padding-left:0.25rem; padding-right: 0.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.4); ">
                                SPEED
                            </span>
                            <span> {formatNumber(derivedState.cheeseQueueOverclockSpeedMult, 2)} Hz</span>
                        </div>
                        <div
                            style="width: 10rem; display:flex; flex-direction:column;  justify-content:center; align-items: center; gap: 0.125rem; border-left: 2px solid rgba(255, 255, 255, 0.4)">
                            <span
                                style="font-weight: bold; color:white; background: rgb(115, 0, 2); padding-left:0.25rem; padding-right: 0.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.4); ">
                                COST
                            </span>
                            <span> {formatNumber(derivedState.cheeseQueueOverclockCostMult, 2)}x</span>
                        </div>
                    </div>
                </div>
                <div style="width: 100%; display:flex; flex-direction:column; justify-content: space-between">
                    <button style="height: 2rem; width: 2rem; display: flex;" onclick={() => cheeseQueueOverclockLvl.value++}>
                        <div style="scale: 0.5; transform: rotate(180deg); filter: invert(100%); ">
                            <Image name="chevron-arrow-down" alt="+1 level" />
                        </div>
                    </button>
                    <button style="height: 2rem; width: 2rem; display: flex;" onclick={() => cheeseQueueOverclockLvl.value--}>
                        <div style="scale: 0.5; filter: invert(100%);">
                            <Image name="chevron-arrow-down" alt="-1 level" />
                        </div>
                    </button>
                </div>
            </div>

            {#if unlocked.value.cheeseModes || LORCA_OVERRIDE.value}
                <div transition:slide|local={{ duration: 1000 }}>
                    <fieldset onchange={resetCheeseBar}>
                        <legend>Cheese Factory Protocol</legend>

                        <label
                            class="form-control"
                            use:tooltip={{
                                data: 'meticulous',
                                Component: CheeseFactoryProtocol,
                                anchor: 'parentElement'
                            }}>
                            <input type="radio" name="cheeseFactoryMode" bind:group={cheeseFactoryMode.value} value="meticulous" />
                            meticulous
                        </label>
                        <label
                            class="form-control"
                            use:tooltip={{
                                data: 'nominal',
                                Component: CheeseFactoryProtocol,
                                anchor: 'parentElement'
                            }}>
                            <input type="radio" name="cheeseFactoryMode" bind:group={cheeseFactoryMode.value} value="nominal" />
                            nominal
                        </label>
                        <label
                            class="form-control"
                            use:tooltip={{
                                data: 'warpSpeed',
                                Component: CheeseFactoryProtocol,
                                anchor: 'parentElement'
                            }}>
                            <input type="radio" name="cheeseFactoryMode" bind:group={cheeseFactoryMode.value} value="warpSpeed" />
                            warp speed
                        </label>
                    </fieldset>
                </div>
            {/if}
        </div>
    {/if}

    <div style="width:max-content">
        <span class="resourceDisplay"
            >You have {formatNumber(resource.value.cheese, 2)} <span class="colorText" style="font-weight:bold">cheese</span>
            <br />
        </span>
        ~ {formatNumber(cheesePerSecFromQueue, 2)}/s
    </div>

    <UnlockDrawer unlocks={unlocks.cheese} folderName="Free 50 Aeromancer Skills" themeId="cheese" />

    <div class="flexRowContainer">
        <div class="gridColumn">
            <UpgradeButton upgradeName="cheeseYield" {buyMaxUpgrades} tooltipText={`Yield scales quadratically <br> Duration scales linearly`}></UpgradeButton>

            <UpgradeButton upgradeName="enercheeGeneration" {buyMaxUpgrades} btnUnlocked={unlocked.value.passiveEnerchee} tooltipText={`+1 enerchee/s`}
            ></UpgradeButton>

            <UpgradeButton
                upgradeName="cheeseQueueLength"
                {buyMaxUpgrades}
                btnUnlocked={unlocked.value.cheeseQueue}
                tooltipText={`+${5} capacity <br> Currently: ${derivedState.maxCheeseQueue}`}>
            </UpgradeButton>

            <UpgradeButton
                upgradeName="cheeseThoughtMult"
                {buyMaxUpgrades}
                btnUnlocked={unlocked.value.cheeseQueue}
                tooltipText={`Currently: ${upgradeCount.value.cheeseThoughtMult * upgradeCount.value.cheeseThoughtMult}x <br> Scales ^2 with #upgrades.`}>
            </UpgradeButton>

            <UpgradeButton
                upgradeName="cheeseQueueOverclockingCost"
                {buyMaxUpgrades}
                btnUnlocked={unlocked.value.cheeseQueueCostDivide}
                tooltipText={`Current Divisor: ${formatNumber(derivedState.cheeseQueueCostDivideBy, 2)}`}>
            </UpgradeButton>
        </div>

        <div class="gridColumn" style="height:264px; width: 100%">
            <EffectComponent title={upgradeCount.value.cheeseThoughtMult > 0 || unlocked.value.cheeseQueueLengthBoost ? 'Effects' : '???'}>
                <Effect
                    factor={derivedState.cheeseThoughtMult}
                    unlocked={upgradeCount.value.cheeseThoughtMult > 0}
                    tooltipText={`Scaling: log(cheese) &times; ${upgradeCount.value.cheeseThoughtMult * upgradeCount.value.cheeseThoughtMult}`}>
                    Cheese increases thoughts/s
                </Effect>

                <Effect factor={derivedState.cheeseQueueLengthBoostFactor} unlocked={unlocked.value.cheeseQueueLengthBoost} tooltipText="Scaling: capacity^2">
                    {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_QUEUE_LENGTH_BOOST)?.description}
                </Effect>

                <Effect factor={derivedState.cheeseCycleAcceleratorFactor} unlocked={unlocked.value.cheeseCycleAccelerator} tooltipText="Scaling: log(cycles)">
                    {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_CYCLE_ACCELERATOR)?.description}
                </Effect>

                <Effect factor={derivedState.cheeseCyclesThoughtMult} unlocked={unlocked.value.cheeseCyclesBoostThoughts} tooltipText="Scaling: cycles^1.5">
                    {unlocks.cheese.find(v => v.name === UnlockName.CHEESE_CYCLES_BOOST_THOUGHTS)?.description}
                </Effect>

                <Effect
                    factor={derivedState.mcCycleDurationBoostFactor}
                    unlocked={unlocked.value.moldyCheeseCycleDurationBoost}
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
