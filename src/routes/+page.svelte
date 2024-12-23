<script lang="ts">
    import '../global.css'
    import { onDestroy, onMount } from 'svelte'
    import { saveSaveGame, resetSaveGame, exportSaveGame, importSaveGame } from '$lib/gamelogic/saveload'
    import { startGameLoop, stopGameLoop } from '$lib/gamelogic/gameloop'
    import {
        initWindow,
        keysDisabled,
        panToWindow,
        resetWindowLayout,
        selectWindow,
        setAllWindowLocations,
        updateWindowLocation,
        updateWindowStacking
    } from '$lib/gamelogic/window-manager'
    import { ADMIN_MODE, devToolsEnabled, isDarkMode, LORCA_OVERRIDE, WindowId, currentNotation, unlocked } from '$lib/store'

    import Notifications from '$lib/components/misc/Notifications.svelte'
    import DevTools from '$lib/components/dev/DevTools.svelte'
    import ToggleUnlocks from '$lib/components/dev/ToggleUnlocks.svelte'

    /*
    import MoldyCheeseComponent from '$lib/components/game-windows/MoldyCheeseComponent.svelte'
    import CheeseyardComponent from '$lib/components/game-windows/CheeseyardComponent.svelte'
    import MilkComponent from '$lib/components/game-windows/MilkComponent.svelte'
    import MilkTreeComponent from '$lib/components/game-windows/MilkTreeComponent.svelte'
    import BacteriaComponent from '$lib/components/game-windows/BacteriaComponent.svelte' */
    import backgroundImage from '$lib/images/endless-constellation.svg'
    import Image from '$lib/components/Image.svelte'
    import Thoughts from '$lib/components/game-windows/Thoughts.svelte'
    import Knowledge from '../lib/components/game-windows/Knowledge.svelte'
    import Insight from '$lib/components/game-windows/Insight.svelte'
    import CogitoErgoSum from '$lib/components/game-windows/CogitoErgoSum.svelte'
    import Enlightenment from '$lib/components/game-windows/Enlightenment.svelte'

    import CheeseComponent from '$lib/components/game-windows/CheeseComponent.svelte'
    import Story from '$lib/components/game-windows/Story.svelte'

    // Start the game loop in the background.
    startGameLoop()
    // When doing HMR, this will prevent the game loop from running multiple times in parallel.
    onDestroy(() => stopGameLoop())

    let unlockTogglesShown = $state(false)

    let secretImage: HTMLElement
    let background: HTMLElement
    let gameWindow: HTMLElement
    let dragWindow: HTMLElement | null = null
    let windowContainer: HTMLElement | null = null

    // for moving with mouse:
    let clickedAtX: number, clickedAtY: number
    let clickedAtWindowPosX: number, clickedAtWindowPosY: number

    let clickedAtBackgroundPosX: number, clickedAtBackgroundPosY: number
    let clickedAtSecretImagePosX: number, clickedAtSecretImagePosY: number

    // for moving with arrow keys:
    let gameWindowLeftInitial: number, gameWindowTopInitial: number
    let backgroundPosXInitial: number, backgroundPosYInitial: number
    let secretImageLeftInitial: number, secretImageTopInitial: number

    // how much slower the background moves compared to the game window
    const backgroundParallaxRatio = 1 / 8
    const movingTo = {
        right: false,
        left: false,
        top: false,
        bottom: false
    }
    let movingWithMouse = false
    let isMoving = false
    const startTime: Record<string, number | null> = {
        xLeft: null,
        xRight: null,
        yUp: null,
        yDown: null
    }

    function translateFromCSSToArray(el: HTMLElement): [number, number] | null {
        const str = window.getComputedStyle(el).getPropertyValue('transform')
        // eslint-disable-next-line no-useless-escape
        const transformArray = str.match(/(-?[0-9\.]+)/g)

        if (transformArray === null) {
            console.error('Could not get the proper transform coordinates.')
            return null
        }
        return [parseInt(transformArray[4]), parseInt(transformArray[5])]
    }

    function onKeyPress(e: KeyboardEvent): void {
        if (!ADMIN_MODE.value) return
        if (e.key === 'f') LORCA_OVERRIDE.value = !LORCA_OVERRIDE.value
        if (e.key === 'g') devToolsEnabled.value = !devToolsEnabled.value
        if (e.key === 'u') unlockTogglesShown = !unlockTogglesShown
    }
    function onKeyDown(e: KeyboardEvent): void {
        if (keysDisabled.value) return
        // this would prevent spamming buttons with 'Enter':
        //if (e.key === 'Enter') e.preventDefault()

        if (e.key === 'ArrowRight' && !movingTo.right) movingTo.right = true
        if (e.key === 'ArrowLeft' && !movingTo.left) movingTo.left = true
        if (e.key === 'ArrowUp' && !movingTo.top) movingTo.top = true
        if (e.key === 'ArrowDown' && !movingTo.bottom) movingTo.bottom = true

        if (Object.values(movingTo).includes(true) && !isMoving) {
            isMoving = true
            startTime.xLeft = null
            startTime.xRight = null
            startTime.yUp = null
            startTime.yDown = null
            requestAnimationFrame(moveWindow)
        }
    }
    function onKeyUp(e: KeyboardEvent): void {
        if (keysDisabled.value) return
        if (e.key === 'ArrowRight' && movingTo.right) movingTo.right = false
        if (e.key === 'ArrowLeft' && movingTo.left) movingTo.left = false
        if (e.key === 'ArrowUp' && movingTo.top) movingTo.top = false
        if (e.key === 'ArrowDown' && movingTo.bottom) movingTo.bottom = false

        if (Object.values(movingTo).every(v => v === false)) isMoving = false
    }
    function onMouseDown(e: MouseEvent): void {
        if (!(e.target instanceof HTMLElement)) return

        // handle individual windows able to be dragged over the screen:
        if (e.target.classList.contains('window-bar')) {
            windowContainer = e.target.closest('.window')
            // if flex or grid layout before and then you want users to drag the windows,
            // you'd need to make all windows absolutely positioned and compute their current location
            /* if (windowContainer) windowContainer.style.position = 'absolute' */
            e.target.style.cursor = 'grab'
            return
        }
        // keep eg. sliders draggable without moving the window
        if (e.target.classList.contains('draggable')) return

        // drag the entire game window around freely:
        movingWithMouse = true
        dragWindow = gameWindow

        clickedAtX = e.pageX
        clickedAtY = e.pageY

        const arr = translateFromCSSToArray(dragWindow)
        if (arr === null) {
            dragWindow = null
            return
        }
        clickedAtWindowPosX = arr[0]
        clickedAtWindowPosY = arr[1]
        // console.log(clickedAtWindowPosX, clickedAtWindowPosY)

        /* clickedAtWindowPosX = getOffset(dragWindow).left
      clickedAtWindowPosY = getOffset(dragWindow).top */
        //console.log('AFWAFAWF', background.style.backgroundPositionX, parseInt(background.style.backgroundPositionX))
        clickedAtBackgroundPosX = parseInt(background.style.backgroundPositionX)
        clickedAtBackgroundPosY = parseInt(background.style.backgroundPositionY)
        clickedAtSecretImagePosX = parseInt(secretImage.style.left)
        clickedAtSecretImagePosY = parseInt(secretImage.style.top)
    }
    function onMouseMove(e: MouseEvent): void {
        if (windowContainer !== null) {
            windowContainer.style.left = windowContainer.offsetLeft + e.movementX + 'px'
            windowContainer.style.top = windowContainer.offsetTop + e.movementY + 'px'
            return
        }
        if (dragWindow === null) return

        /* dragWindow.style.left = clickedAtWindowPosX + (e.pageX - clickedAtX) + 'px'
      dragWindow.style.top = clickedAtWindowPosY + (e.pageY - clickedAtY) + 'px' */
        dragWindow.style.transform = `translate(${clickedAtWindowPosX + e.pageX - clickedAtX}px, ${clickedAtWindowPosY + e.pageY - clickedAtY}px)`

        background.style.backgroundPositionX = clickedAtBackgroundPosX + (e.pageX - clickedAtX) * backgroundParallaxRatio + 'px'
        background.style.backgroundPositionY = clickedAtBackgroundPosY + (e.pageY - clickedAtY) * backgroundParallaxRatio + 'px'
        secretImage.style.left = clickedAtSecretImagePosX + (e.pageX - clickedAtX) * backgroundParallaxRatio + 'px'
        secretImage.style.top = clickedAtSecretImagePosY + (e.pageY - clickedAtY) * backgroundParallaxRatio + 'px'
    }
    function onMouseUp(e: MouseEvent): void {
        if (windowContainer !== null) {
            if (e.target instanceof HTMLElement && e.target.classList.contains('window-bar')) {
                e.target.style.cursor = 'pointer'
            }
            updateWindowLocation(windowContainer)
            windowContainer = null
        }
        /* if (dragWindow === null) return
      dragWindow.style.left = clickedAtWindowPosX + (e.pageX - clickedAtX) + 'px'
      dragWindow.style.top = clickedAtWindowPosY + (e.pageY - clickedAtY) + 'px' */
        movingWithMouse = false
        dragWindow = null
    }

    onMount(() => {
        updateWindowStacking(gameWindow)
        setAllWindowLocations()
        background.style.backgroundPositionX = '0px'
        background.style.backgroundPositionY = '0px'
        panToWindow(WindowId.COGITO_ERGO_SUM, true)

        background.style.background = `url("${backgroundImage}")`

        // checks if dark mode is enabled in the browser:
        if (isDarkMode.value === 'notChecked') {
            isDarkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        applyTheme()

        // return false if key is 'Enter'
        // window.document.onkeydown = (e: KeyboardEvent) => e.key !== 'Enter'
    })

    function resetInitialPositionsX(): void {
        gameWindowLeftInitial = gameWindow.offsetLeft
        secretImageLeftInitial = secretImage.offsetLeft
        backgroundPosXInitial = parseInt(background.style.backgroundPositionX)
    }
    function resetInitialPositionsY(): void {
        gameWindowTopInitial = gameWindow.offsetTop
        secretImageTopInitial = secretImage.offsetTop
        backgroundPosYInitial = parseInt(background.style.backgroundPositionY)
    }

    function moveWindow(currentTime: number): void {
        if (movingWithMouse) return

        if (movingTo.right && !movingTo.left) {
            if (startTime.xRight === null) {
                resetInitialPositionsX()
                startTime.xRight = currentTime
            }
            const elapsed = currentTime - startTime.xRight
            gameWindow.style.left = gameWindowLeftInitial - 1 * elapsed + 'px'
            secretImage.style.left = secretImageLeftInitial - backgroundParallaxRatio * elapsed + 'px'
            background.style.backgroundPositionX = backgroundPosXInitial - backgroundParallaxRatio * elapsed + 'px'
        } else {
            startTime.xRight = null
        }

        if (movingTo.left && !movingTo.right) {
            if (startTime.xLeft === null) {
                resetInitialPositionsX()
                startTime.xLeft = currentTime
            }
            const elapsed = currentTime - startTime.xLeft
            gameWindow.style.left = gameWindowLeftInitial + 1 * elapsed + 'px'
            secretImage.style.left = secretImageLeftInitial + backgroundParallaxRatio * elapsed + 'px'
            background.style.backgroundPositionX = backgroundPosXInitial + backgroundParallaxRatio * elapsed + 'px'
        } else {
            startTime.xLeft = null
        }

        if (movingTo.top && !movingTo.bottom) {
            if (startTime.yUp === null) {
                resetInitialPositionsY()
                startTime.yUp = currentTime
            }
            const elapsed = currentTime - startTime.yUp
            gameWindow.style.top = gameWindowTopInitial + 1 * elapsed + 'px'
            secretImage.style.top = secretImageTopInitial + backgroundParallaxRatio * elapsed + 'px'
            background.style.backgroundPositionY = backgroundPosYInitial + backgroundParallaxRatio * elapsed + 'px'
        } else {
            startTime.yUp = null
        }

        if (movingTo.bottom && !movingTo.top) {
            if (startTime.yDown === null) {
                resetInitialPositionsY()
                startTime.yDown = currentTime
            }
            const elapsed = currentTime - startTime.yDown
            gameWindow.style.top = gameWindowTopInitial - 1 * elapsed + 'px'
            secretImage.style.top = secretImageTopInitial - backgroundParallaxRatio * elapsed + 'px'
            background.style.backgroundPositionY = backgroundPosYInitial - backgroundParallaxRatio * elapsed + 'px'
        } else {
            startTime.yDown = null
        }

        /* let transformX = gameWindowLeftInitial
      let transformY = gameWindowTopInitial
      if (startTime.xRight !== null) transformX -= 1 * currentTime - startTime.xRight
      if (startTime.xLeft !== null) transformX += 1 * currentTime - startTime.xLeft
      if (startTime.yUp !== null) transformY += 1 * currentTime - startTime.yUp
      if (startTime.yDown !== null) transformY += 1 * currentTime - startTime.yDown
      gameWindow.style.transform = `transform(${transformX}px, ${transformY}px)` */

        if (isMoving) requestAnimationFrame(moveWindow)
    }

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

<svelte:window onkeypress={onKeyPress} onkeydown={onKeyDown} onkeyup={onKeyUp} onmousedown={onMouseDown} onmouseup={onMouseUp} onmousemove={onMouseMove} />

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

    <div id="display" bind:this={background}>
        <div id="secretImage" style="position: absolute; left: -800px; top: -500px; scale: 0.25" bind:this={secretImage}>
            <Image name="thonk" alt="secret" />
        </div>

        <div id="game" bind:this={gameWindow}>
            <div id={WindowId.COGITO_ERGO_SUM} class="window" onmousedown={() => selectWindow(WindowId.COGITO_ERGO_SUM, gameWindow)} use:initWindow role="none">
                <CogitoErgoSum></CogitoErgoSum>
            </div>

            {#if unlocked.value.start || LORCA_OVERRIDE.value}
                <div id={WindowId.ENLIGHTENMENT} class="window" onmousedown={() => selectWindow(WindowId.ENLIGHTENMENT, gameWindow)} use:initWindow role="none">
                    <Enlightenment></Enlightenment>
                </div>
            {/if}

            {#if unlocked.value.switzerland || LORCA_OVERRIDE.value}
                <div id={WindowId.STORY} class="window" onmousedown={() => selectWindow(WindowId.STORY, gameWindow)} use:initWindow role="none">
                    <Story />
                </div>
            {/if}

            <div id={WindowId.THOUGHTS} class="window" onmousedown={() => selectWindow(WindowId.THOUGHTS, gameWindow)} use:initWindow role="none">
                <Thoughts></Thoughts>
            </div>

            {#if unlocked.value.neutralMood || LORCA_OVERRIDE.value}
                <div id={WindowId.KNOWLEDGE} class="window" onmousedown={() => selectWindow(WindowId.KNOWLEDGE, gameWindow)} use:initWindow role="none">
                    <Knowledge></Knowledge>
                </div>
            {/if}

            {#if unlocked.value.sadMood || LORCA_OVERRIDE.value}
                <div id={WindowId.INSIGHT} class="window" onmousedown={() => selectWindow(WindowId.INSIGHT, gameWindow)} use:initWindow role="none">
                    <Insight></Insight>
                </div>
            {/if}

            {#if unlocked.value.switzerland || LORCA_OVERRIDE.value}
                <div id={WindowId.CHEESE} class="window" onmousedown={() => selectWindow(WindowId.CHEESE, gameWindow)} use:initWindow role="none">
                    <CheeseComponent />
                </div>
            {/if}

            <!--
            {#if $unlocked.moldyCheese || $LORCA_OVERRIDE}
                <div
                    id={WindowId.moldyCheeseComponent}
                    class="window"
                    on:mousedown={() => selectWindow(WindowId.moldyCheeseComponent, gameWindow)}
                    use:initWindow
                    role="none">
                    <MoldyCheeseComponent windowId={WindowId.moldyCheeseComponent} />
                </div>
            {/if}
            {#if $unlocked.cheeseyard || $LORCA_OVERRIDE}
                <div
                    id={WindowId.cheeseyardComponent}
                    class="window"
                    on:mousedown={() => selectWindow(WindowId.cheeseyardComponent, gameWindow)}
                    use:initWindow
                    role="none">
                    <CheeseyardComponent windowId={WindowId.cheeseyardComponent} />
                </div>
            {/if}
            {#if $unlocked.milk || $LORCA_OVERRIDE}
                <div
                    id={WindowId.milkComponent}
                    class="window"
                    on:mousedown={() => selectWindow(WindowId.milkComponent, gameWindow)}
                    use:initWindow
                    role="none">
                    <MilkComponent windowId={WindowId.milkComponent} />
                </div>
            {/if}
            {#if $unlocked.milkTree || $LORCA_OVERRIDE}
                <div
                    id={WindowId.milkTreeComponent}
                    class="window"
                    on:mousedown={() => selectWindow(WindowId.milkTreeComponent, gameWindow)}
                    use:initWindow
                    role="none">
                    <MilkTreeComponent windowId={WindowId.milkTreeComponent} />
                </div>
            {/if}
            {#if $unlocked.bacteria || $LORCA_OVERRIDE}
                <div
                    id={WindowId.bacteriaComponent}
                    class="window"
                    on:mousedown={() => selectWindow(WindowId.bacteriaComponent, gameWindow)}
                    use:initWindow
                    role="none">
                    <BacteriaComponent windowId={WindowId.bacteriaComponent} />
                </div>
            {/if} -->
        </div>
    </div>
</main>

<style>
    * {
        --x0: 2; /* Column of home*/
        --y0: 2; /* Row of home*/
    }

    #display {
        position: fixed;
        width: 100vw;
        height: 100vh;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        /* background: url('/cogito-cosmos/assets/endless-constellation.svg'), url('/assets/endless-constellation.svg'); */
        /* background-color: var(--background-color); */
    }
    #game {
        position: absolute; /** also resets positioning of child elements just like relative! */
        transform: translateZ(0);

        /* width: 1000px;
        height: 1000px;
        border: 1px solid red;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--window-gap); */
    }
    .window {
        position: absolute;
    }

    #saveload {
        position: fixed;
        z-index: 10;
        top: 0;
        right: 0;
        display: flex;
        gap: 0;
    }
</style>
