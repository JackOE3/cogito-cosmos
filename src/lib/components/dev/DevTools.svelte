<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import { addResource, devToolsEnabled, fastFowardFactor, multResource, Resource, resource, resourceTotal, type ResourceType } from '$lib/store'
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
            <input type="number" bind:value={fastFowardFactor.value} />

            {@render resourceControls(Resource.THOUGHTS)}
            {@render resourceControls(Resource.KNOWLEDGE)}
            {@render resourceControls(Resource.INSIGHT)}
            {@render resourceControls(Resource.ENLIGHTENMENT_POINTS)}
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
        padding: 16px;
        z-index: 99;
        background-color: rgb(0, 0, 0, 0.8);
    }
    #devTools > #devControls {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>
