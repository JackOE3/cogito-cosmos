<script lang="ts">
    import { onMount } from 'svelte'
    import loadingSpinner from '$lib/images/loading-spinner.svg'

    export let name: string = ''
    export let alt: string = name
    const images = import.meta.glob(`/src/lib/images/**/*.{png,jpg,svg}`)
    let image: HTMLImageElement

    export const setImage = (imageName: string): void => {
        if (!imageName) return
        const path = `/src/lib/images/${imageName}.png`
        if (images[path]) {
            images[path]()
                .then(img => {
                    if (image) image.setAttribute('src', img.default)
                })
                .catch(error => {
                    console.error(`Error loading image ${path}:`, error)
                })
        }
    }

    onMount(() => {
        setImage(name)
    })
</script>

<img src={loadingSpinner} draggable="false" {alt} bind:this={image} />

<style>
    img {
        width: 100%;
        height: 100%;
        border-radius: inherit;
        /* contain: Image is scaled to fit within the container. */
        /* Aspect ratio IS maintained */
        /* cover: image scaled, aspect ratio mantained, but not entire image must be within container */
        object-fit: cover;
    }
</style>
