<script lang="ts">
    import type { Snippet } from 'svelte'
    import { debounce } from 'ts-debounce'
    import { tooltip, type Options } from './tooltips/tooltip.svelte'

    interface Props {
        onclick: () => void
        tooltipOptions?: Options
        disabled?: boolean
        children: Snippet
        style?: string
        class?: string
    }

    let { onclick: onClick, tooltipOptions = { data: null }, disabled = false, style, class: className, children }: Props = $props()

    const onClickDebounced = debounce(onClick, 200, { isImmediate: true, maxWait: 200 })

    function onclick(): void {
        if (disabled) return
        onClickDebounced()
    }

    let interval: number
    function onmousedown(): void {
        if (disabled) return
        clearInterval(interval)
        interval = setTimeout(() => {
            interval = setInterval(onClick, 100)
        }, 150)
    }
    function onmouseup(): void {
        if (disabled) return
        clearInterval(interval)
    }

    $effect(() => {
        return () => {
            clearInterval(interval)
        }
    })
</script>

<button {onclick} {onmousedown} {onmouseup} {style} class={className} use:tooltip={() => tooltipOptions} class:disabled>
    {@render children?.()}
</button>
