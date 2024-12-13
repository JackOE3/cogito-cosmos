<script lang="ts">
    import { devToolsEnabled, resource } from '$lib/store'
</script>

{#if devToolsEnabled.value}
    <div id="devTools">
        <div id="devControls">
            <strong>Developer Tools</strong>

            <span>thoughts</span>
            <div style="display:flex;">
                <button onclick={() => (resource.value.thoughts += 1000)}>+1K</button>
                <button onclick={() => (resource.value.thoughts += 100000)}>+100K</button>
                <button onclick={() => (resource.value.thoughts += 1000000)}>+1M</button>
                <button onclick={() => (resource.value.thoughts *= 10)}>*10</button>
                <button onclick={() => (resource.value.thoughts /= 10)}>/10</button>
            </div>
            <span>knowledge</span>
            <div style="display:flex;">
                <button onclick={() => (resource.value.knowledge += 1000)}>+1K</button>
                <button onclick={() => (resource.value.knowledge += 100000)}>+100K</button>
                <button onclick={() => (resource.value.knowledge += 1000000)}>+1M</button>
                <button onclick={() => (resource.value.knowledge *= 10)}>*10</button>
                <button onclick={() => (resource.value.knowledge /= 10)}>/10</button>
            </div>
            <span>insight</span>
            <div style="display:flex;">
                <button onclick={() => (resource.value.insight += 1000)}>+1K</button>
                <button onclick={() => (resource.value.insight += 100000)}>+100K</button>
                <button onclick={() => (resource.value.insight += 1000000)}>+1M</button>
                <button onclick={() => (resource.value.insight *= 10)}>*10</button>
                <button onclick={() => (resource.value.insight /= 10)}>/10</button>
            </div>

            <span>cheese</span>
            <div style="display:flex;">
                <button onclick={() => (resource.value.cheese += 1000)}>+1K</button>
                <button onclick={() => (resource.value.cheese += 100000)}>+100K</button>
                <button onclick={() => (resource.value.cheese += 1000000)}>+1M</button>
                <button onclick={() => (resource.value.cheese *= 10)}>*10</button>
                <button onclick={() => (resource.value.cheese /= 10)}>/10</button>
            </div>

            <span>moldy cheese</span>
            <div style="display:flex;">
                <button onclick={() => (resource.value.moldyCheese += 1000)}>+1K</button>
                <button onclick={() => (resource.value.moldyCheese += 100000)}>+100K</button>
                <button onclick={() => (resource.value.moldyCheese += 1000000)}>+1M</button>
                <button onclick={() => (resource.value.moldyCheese *= 10)}>*10</button>
                <button onclick={() => (resource.value.moldyCheese /= 10)}>/10</button>
            </div>

            <span>cheese monsters</span>
            <input type="number" bind:value={resource.value.cheeseMonster} />

            <span>cheese Brains</span>
            <input type="number" bind:value={resource.value.cheeseBrains} />

            <span>milk</span>
            <input type="number" bind:value={resource.value.milk} />
        </div>
    </div>
{/if}

<style>
    #devTools {
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 1;
        background-color: rgb(0, 0, 0, 0.8);
    }
    #devTools > #devControls {
        margin: 24px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>
