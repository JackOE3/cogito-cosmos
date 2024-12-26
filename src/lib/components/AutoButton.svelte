<script lang="ts">
    import type { Snippet } from 'svelte'
    import { debounce } from 'ts-debounce'
    import { tooltip, type Options } from './tooltips/tooltip.svelte'

    interface Props {
        onclick: () => void
        tooltipOptions?: Options
        children: Snippet
    }

    let { onclick: onClick, tooltipOptions, children }: Props = $props()

    if (!tooltipOptions) tooltipOptions = {}

    const onClickDebounced = debounce(onClick, 200, { isImmediate: true, maxWait: 200 })

    function onclick(): void {
        onClickDebounced()
    }

    let interval: number
    function onmousedown(): void {
        clearInterval(interval)
        interval = setTimeout(() => {
            interval = setInterval(onClick, 100)
        }, 150)
    }
    function onmouseup(): void {
        clearInterval(interval)
    }
</script>

<button {onclick} {onmousedown} {onmouseup} use:tooltip={tooltipOptions}>
    {@render children?.()}
</button>
