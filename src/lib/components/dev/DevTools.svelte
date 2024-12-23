<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import {
        addResource,
        derivedState,
        devCheat,
        devToolsEnabled,
        enlightenmentStage,
        enlightenmentSubstage,
        fastFowardFactor,
        health,
        multResource,
        Resource,
        resource,
        resourceTotal,
        type ResourceType
    } from '$lib/store'

    let healthValue: number
</script>

{#snippet resourceControls(resource: ResourceType)}
    <span>{resource} (total: {formatNumber(resourceTotal.value[resource], 2)})</span>
    <div style="display:flex;">
        <button onclick={() => addResource(resource, 1e2)}>+100</button>
        <button onclick={() => addResource(resource, 1e4)}>+10K</button>
        <button onclick={() => addResource(resource, 1e7)}>+1M</button>
        <button onclick={() => multResource(resource, 10)}>*10</button>
        <button onclick={() => multResource(resource, 0.1)}>/10</button>
    </div>
{/snippet}

{#if devToolsEnabled.value}
    <div id="devTools">
        <div id="devControls">
            <span style="font-size:1rem; font-weight: bold;">Dev Tools</span>

            <span>fast forward</span>
            <input style="width: 100px" type="number" bind:value={fastFowardFactor.value} />

            <span>enlightenment stage</span>
            <input style="width: 100px" type="number" bind:value={enlightenmentStage.value} min="1" step="1" />
            <input style="width: 100px" type="number" bind:value={enlightenmentSubstage.value} min="1" max="5" step="1" />

            <span>health: {derivedState.healthStage} ({formatNumber(health.value, 2)})</span>
            <input style="width: 100px" type="number" min="0" max="1" step="0.1" bind:value={healthValue} onchange={() => (health.value = healthValue)} />

            {@render resourceControls(Resource.THOUGHTS)}
            {@render resourceControls(Resource.KNOWLEDGE)}
            {@render resourceControls(Resource.INSIGHT)}
            {@render resourceControls(Resource.CHEESE)}

            <!--   <span>cheese monsters</span>
            <input type="number" bind:value={resource.value.cheeseMonster} />

            <span>cheese Brains</span>
            <input type="number" bind:value={resource.value.cheeseBrains} />

            <span>milk</span>
            <input type="number" bind:value={resource.value.milk} /> -->
        </div>
    </div>
{/if}

<style>
    #devTools {
        position: absolute;
        right: 16px;
        bottom: 16px;
        border-radius: 8px;
        border: 1px solid var(--text-disabled);
        padding: 16px;
        z-index: 99;
        background-color: var(--background-color);
        box-shadow: 0px 0px 16px 4px black;
    }
    #devTools:before {
        content: '';
        border-radius: inherit;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: -1;
    }
    #devTools > #devControls {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>
