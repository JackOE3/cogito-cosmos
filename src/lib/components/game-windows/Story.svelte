<script lang="ts">
    import Window from './window-model/Window.svelte'
    import { formatNumber, formatTime, formatWhole } from '$lib/gamelogic/utils'
    import { Direction, tooltip } from '../tooltips/tooltip.svelte'
    import { resource } from '$lib/store'

    enum StoryProgress {
        START = 'start',
        THINK = 'think'
    }

    const storyProgress = $state({
        start: true,
        think: false
    })

    interface Action {
        name: string
        tooltip?: string
        callback: () => void
        available: StoryProgress
    }
    const actions: Action[] = [
        {
            name: 'Think',
            callback: () => {
                storyProgress.think = true
                story.push('Where am I?')
            },
            available: StoryProgress.START
        },
        {
            name: 'What is my mood?',
            callback: () => {},
            available: StoryProgress.THINK
        }
    ]

    const story: string[] = $state([])
</script>

<Window title="Inbox" themeId="cogitoErgoSum" --width="500px">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem">
        <div style="width:100%; height: 8rem; background: var(--dp01); border: 1px solid var(--dp08);">
            <div style="height: 100%; padding: 1rem">
                {#each story as s}
                    <p>{s}</p>
                {/each}
            </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0px">
            {#each actions as action}
                {#if storyProgress[action.available]}
                    <button onclick={action.callback} use:tooltip={{ data: action.tooltip }} style="width: 200px;">
                        {action.name}
                    </button>
                {/if}
            {/each}
        </div>
    </div>
</Window>

<style>
</style>
