<script lang="ts">
    import Window from './window-model/Window.svelte'
    import { formatNumber, formatTime, formatWhole } from '$lib/gamelogic/utils'
    import { Direction, tooltip } from '../tooltips/tooltip.svelte'
    import { addResource, resource, resourceTotal } from '$lib/store'
    import Thoughts from './Thoughts.svelte'

    const randomThoughts = [
        'Do penguins ever get tired of wearing tuxedos?',
        'If my shadow is always behind me, does it know where I’m going?',
        'What if the universe is just a big game of Sims and I’m the glitch?',
        'Why is ‘silent’ an anagram of ‘listen’? Was this a clue all along?',
        'If I eat a banana, am I technically stealing a monkey’s lunch?',
        'Do clouds ever argue over who’s fluffiest?',
        'What if every time I lose something, a wormhole eats it?',
        'Why does my brain think about my brain thinking?',
        'If trees scream when we cut them, are they just very quiet?',
        'Maybe socks disappear because they’re tired of my feet.',
        'Is cereal technically just soup for the impatient?',
        'If I invent a time machine, have I already done it?',
        'Does my goldfish think I’m a giant alien outside its universe?',
        'If I forget what I was thinking about, was it ever real?',
        'What if every sneeze is a mini exorcism?',
        'If mirrors could talk, would they just insult me?',
        'Does my toaster secretly judge my bread choices?',
        'What if the moon is actually Earth’s therapist?',
        'Is life just one long improv show and I’m forgetting my lines?',
        'If I dream about a taco, does the taco dream about me?'
    ]

    const iterator = randomThoughts[Symbol.iterator]()

    enum ActionId {
        THINK = 'think',
        MOOD = 'mood'
    }

    class ActionAvailable implements Record<ActionId, boolean> {
        think = $state(true)
        mood = $derived(resourceTotal.value.thoughts > 100)
    }
    const actionAvailable = new ActionAvailable()

    interface Action {
        name: string
        callback: () => void
        tooltip?: string
    }

    const actions2: Record<ActionId, Action> = {
        think: {
            name: 'Think about something',
            tooltip: '+1 thought',
            callback: () => {
                addResource('thoughts', 1)
                const randomThought = iterator.next().value
                if (randomThought) message = randomThought
            }
        },
        mood: {
            name: 'What is my mood?',
            callback: () => {}
        }
    }

    const story: string[] = $state([])
    let message = $state('')
</script>

<Window title="Inbox" themeId="cogitoErgoSum" --width="500px">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem">
        <div style="width:100%; height: 8rem; background: var(--dp01); border: 1px solid var(--dp08);">
            <div style="height: 100%; padding: 1rem">
                {#each story as s}
                    <p>{s}</p>
                {/each}
                {message}
            </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0px">
            {#each Object.entries(actions2) as [actionId, action] (actionId)}
                {#if actionAvailable[actionId as ActionId]}
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
