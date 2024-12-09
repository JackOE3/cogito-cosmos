<script lang="ts">
  import Window from './window-model/Window.svelte'
  import { formatNumber } from '$lib/gamelogic/utils'
  import { tooltip } from '../tooltips/tooltip'
  import FixedSizeTooltip from '../tooltips/FixedSizeTooltip.svelte'
  import { resource, skillTree, allowedSkillTreeConnections, WindowId } from '$lib/store'
  import { onMount } from 'svelte'

  export let windowId: WindowId

  const rows: HTMLElement[] = []

  type coord = { x: number; y: number }
  type connection = { id: string; start: coord; end: coord; allowed: boolean; active: boolean }
  const connections: connection[][] = []

  onMount(() => {
    for (let i = 0; i < rows.length - 1; i++) {
      for (const [startIndex, startNode] of Array.from(rows[i].children).entries()) {
        // console.log(startNode, startNode.id)
        const start = startNode as HTMLElement
        for (const [endIndex, endNode] of Array.from(rows[i + 1].children).entries()) {
          const end = endNode as HTMLElement
          if (connections[i] === undefined) connections[i] = []
          const id = i.toString() + startIndex.toString() + endIndex.toString()
          const allowed = allowedSkillTreeConnections.includes(id)
          connections[i].push({
            id,
            start: { x: start.offsetLeft + start.offsetWidth / 2, y: start.offsetTop + start.offsetHeight / 2 },
            end: { x: end.offsetLeft + end.offsetWidth / 2, y: end.offsetTop + end.offsetHeight / 2 },
            allowed,
            active: false,
          })
        }
      }
    }
    updateSkillTreeButtons()
  })

  function updateSkillTreeButtons(): void {
    for (const [i, skillRow] of skillTree.entries()) {
      for (const [j] of skillRow.entries()) {
        if (isBtnEnabled(i, j)) skillTree[i][j].available = true
      }
    }
  }
  function isBtnEnabled(i: number, j: number): boolean {
    if (i < 1) return true
    const neccessaryConnectionIds = allowedSkillTreeConnections.filter(
      ac => ac[0] === (i - 1).toString() && ac[2] === j.toString()
    )
    const neccessaryConnections = connections[i - 1].filter(c => neccessaryConnectionIds.find(v => v === c.id))
    const allConnectionsActive = neccessaryConnections.every(c => c.active)
    // console.log(neccessaryConnections, allConnectionsActive)
    return allConnectionsActive
  }

  /**
   * kinda useless, just access index1 & index2 manually instead
   * @param connectionToActivate
   */
  function toggleConnection(connectionToToggle: string, setActive: boolean): void {
    if (!allowedSkillTreeConnections.includes(connectionToToggle))
      throw new Error(connectionToToggle + ' is not an allowed connection between MP boosts!')
    const index1 = connectionToToggle[0]
    const index2 = connections[index1].findIndex((c: connection) => c.id === connectionToToggle)
    connections[index1][index2].active = setActive
  }

  function handleButton(row: number, nth: number): void {
    if (!skillTree[row][nth].available) return
    if (!skillTree[row][nth].activated) {
      const connectionsToActivate = allowedSkillTreeConnections.filter(
        c => c[0] === row.toString() && c[1] === nth.toString()
      )
      for (const connection of connectionsToActivate) toggleConnection(connection, true)
      skillTree[row][nth].activated = true
    }

    updateSkillTreeButtons()
  }
</script>

<Window title="The Milk Tree" themeId="milk" {windowId}>
  <div>
    <span class="resourceDisplay"
      >You have {formatNumber($resource.milkPoints, 2)} unspent <strong style="color:white"> milk points</strong> <br />
    </span>
    <span>Total: {16}</span>
  </div>

  <div class="btnContainer">
    <button> Gain 1 milk point <br /> Cost: {1} thoughts</button>
    <button> Gain 1 milk point <br /> Cost: {1} cheese brains </button>
    <button> Gain 1 milk point <br /> Cost: {1} milk </button>
  </div>

  <div id="skillTree">
    {#each skillTree as skillTreeRow, i}
      <div class="skillTreeRow" bind:this={rows[i]}>
        {#each skillTreeRow as boost, j}
          <div style="position:relative">
            <button
              on:click={() => handleButton(i, j)}
              class:activated={boost.activated}
              disabled={!boost.available}
              use:tooltip={{ Component: FixedSizeTooltip, data: boost.description }}
            >
              <span>{boost.label} <br /></span>
              <span>{boost.cost} MP</span>
            </button>
            <div class="backDrop" />
          </div>
        {/each}
      </div>
    {/each}

    <svg>
      {#if connections}
        {#each connections as connectionLayer}
          {#each connectionLayer as connection}
            {#if connection.allowed}
              <line
                x1={connection.start.x}
                y1={connection.start.y}
                x2={connection.end.x}
                y2={connection.end.y}
                stroke={connection.active ? 'var(--activatedColor)' : 'var(--Gray800)'}
                stroke-width="5"
                shape-rendering="geometricPrecision"
              />
            {/if}
          {/each}
        {/each}
      {/if}
    </svg>
  </div>
</Window>

<style>
  * {
    --unlockedColor: white;
    --maxedColor: var(--unlockedColor);
    z-index: 1;
    --activatedColor: green;
  }
  .btnContainer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--btn-gap);
  }
  .btnContainer button {
    width: 100%;
  }
  #skillTree {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 40px;
    position: relative;
  }
  .skillTreeRow {
    display: flex;
    flex-direction: row;
    gap: 20px;
    justify-content: center;
  }
  .skillTreeRow button {
    width: 100px;
    height: 50px;
  }
  .backDrop {
    z-index: -1;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--Gray900);
  }
  .activated {
    outline: 2px var(--activatedColor) solid;
  }
  svg {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
