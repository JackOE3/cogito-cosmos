<script lang="ts">
    import '../global.css'
    import { onDestroy, onMount } from 'svelte'
    import { saveSaveGame, resetSaveGame, exportSaveGame, importSaveGame } from '$lib/gamelogic/saveload'
    import { startGameLoop, stopGameLoop } from '$lib/gamelogic/gameloop'
    import { panToWindow, resetWindowLayout } from '$lib/gamelogic/window-manager'
    import { ADMIN_MODE, devToolsEnabled, isDarkMode, LORCA_OVERRIDE, WindowId, currentNotation } from '$lib/store'

    import Notifications from '$lib/components/misc/Notifications.svelte'
    import DevTools from '$lib/components/dev/DevTools.svelte'
    import ToggleUnlocks from '$lib/components/dev/ToggleUnlocks.svelte'

    let { children } = $props()

    // Start the game loop in the background.
    startGameLoop()
    // When doing HMR, this will prevent the game loop from running multiple times in parallel.
    onDestroy(() => stopGameLoop())

    let unlockTogglesShown = $state(false)

    function onKeyPress(e: KeyboardEvent): void {
        if (!ADMIN_MODE.value) return
        if (e.key === 'f') LORCA_OVERRIDE.value = !LORCA_OVERRIDE.value
        if (e.key === 'g') devToolsEnabled.value = !devToolsEnabled.value
        if (e.key === 'u') unlockTogglesShown = !unlockTogglesShown
    }

    onMount(() => {
        // checks if dark mode is enabled in the browser:
        if (isDarkMode.value === 'notChecked') {
            isDarkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        applyTheme()

        // return false if key is 'Enter'
        // window.document.onkeydown = (e: KeyboardEvent) => e.key !== 'Enter'
    })

    function switchTheme(): void {
        isDarkMode.value = !isDarkMode.value
        applyTheme()
    }
    /**  Sets the correct theme on the root (html) tag. */
    function applyTheme(): void {
        window.document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
    }

    let saveDataString = $state('')
    function handleExport(): void {
        saveDataString = exportSaveGame()
    }
    function handleImport(): void {
        // ideally check if saveDataString is of type SaveData
        if (saveDataString !== null) importSaveGame(saveDataString)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function showCredits(): void {
        console.log('TODO Credit Modal')
        // Background: https://www.svgbackgrounds.com/
    }

    function changeNotation(): void {
        if (currentNotation.value === 'scientific') currentNotation.value = 'default'
        else if (currentNotation.value === 'default') currentNotation.value = 'letters'
        else currentNotation.value = 'scientific'
    }
</script>

<svelte:head>
    <title>Cogito Cosmos</title>
    <meta name="description" content="Play Cogito Cosmos!" />
</svelte:head>

<svelte:window onkeypress={onKeyPress} />

<main>
    <DevTools />
    {#if unlockTogglesShown}
        <ToggleUnlocks />
    {/if}
    <!-- Add the Notifications component so messages appear on every page -->
    <Notifications />

    <div id="saveload">
        <button onclick={changeNotation}>Notation: {currentNotation.value}</button>
        <button onclick={resetWindowLayout}>Layout Reset</button>
        <button onclick={switchTheme}>Theme: {isDarkMode.value ? 'Dark' : 'Light'}</button>
        <button onclick={() => panToWindow(WindowId.COGITO_ERGO_SUM, true)}>Home</button>
        <input type="string" bind:value={saveDataString} />
        <button onclick={handleExport}>Export</button>
        <button onclick={handleImport}>Import</button>
        <button onclick={saveSaveGame}>Save</button>
        <button onclick={resetSaveGame}>Reset</button>
        <!-- <button onclick={showCredits}>Credits</button> -->
    </div>

    {@render children()}
</main>

<style>
    #saveload {
        position: fixed;
        z-index: 10;
        top: 0;
        right: 0;
        display: flex;
        gap: 0;
        background: var(--background-color);
    }
</style>
