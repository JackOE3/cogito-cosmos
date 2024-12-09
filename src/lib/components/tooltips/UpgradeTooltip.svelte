<script lang="ts">
    type Data = {
        desc: string
        effects: string[]
        costs: string[]
    }
    export let data: Data
    export let x: number
    export let y: number
</script>

<div style="top: {y + 5}px; left: {x + 5}px;">
    <span>{data.desc}</span>
    {#each data.effects as effect}
        <span>{effect}</span>
    {/each}
    <span><hr /></span>
    {#each data.costs as cost}
        <span>{cost}</span>
    {/each}
</div>

<style>
    div {
        width: 300px;
        border: 1px solid var(--secondary);
        /* border-radius: 4px; */
        background: #263238;
        padding: 12px;
        position: absolute;
        display: flex;
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
        box-shadow: 4px 4px var(--Gray900);
    }
    hr {
        border: none;
        color: var(--Gray500);
        background-color: var(--Gray500);
        height: 1px;
        /* margin: auto 120px; */
    }
</style>
