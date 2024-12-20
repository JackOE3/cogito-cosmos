<script lang="ts">
    import { formatNumber } from '$lib/gamelogic/utils'
    import { addResource, devToolsEnabled, multResource, Resource, resource, resourceTotal } from '$lib/store'
</script>

{#if devToolsEnabled.value}
    <div id="devTools">
        <div id="devControls">
            <span style="font-size:1rem; font-weight: bold;">Dev Tools</span>

            <span>thoughts (total: {formatNumber(resourceTotal.value.thoughts, 2)})</span>
            <div style="display:flex;">
                <button onclick={() => addResource(Resource.THOUGHTS, 1e2)}>+100</button>
                <button onclick={() => addResource(Resource.THOUGHTS, 1e4)}>+10K</button>
                <button onclick={() => addResource(Resource.THOUGHTS, 1e7)}>+1M</button>
                <button onclick={() => multResource(Resource.THOUGHTS, 10)}>*10</button>
                <button onclick={() => multResource(Resource.THOUGHTS, 0.1)}>/10</button>
            </div>
            <span>knowledge (total: {formatNumber(resourceTotal.value.knowledge, 2)})</span>
            <div style="display:flex;">
                <button onclick={() => addResource(Resource.KNOWLEDGE, 1e2)}>+100</button>
                <button onclick={() => addResource(Resource.KNOWLEDGE, 1e4)}>+10K</button>
                <button onclick={() => addResource(Resource.KNOWLEDGE, 1e7)}>+1M</button>
                <button onclick={() => multResource(Resource.KNOWLEDGE, 10)}>*10</button>
                <button onclick={() => multResource(Resource.KNOWLEDGE, 0.1)}>/10</button>
            </div>
            <span>insight (total: {formatNumber(resourceTotal.value.insight, 2)})</span>
            <div style="display:flex;">
                <button onclick={() => addResource(Resource.INSIGHT, 1e2)}>+100</button>
                <button onclick={() => addResource(Resource.INSIGHT, 1e4)}>+10K</button>
                <button onclick={() => addResource(Resource.INSIGHT, 1e7)}>+1M</button>
                <button onclick={() => multResource(Resource.INSIGHT, 10)}>*10</button>
                <button onclick={() => multResource(Resource.INSIGHT, 0.1)}>/10</button>
            </div>

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
