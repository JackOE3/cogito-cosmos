export function movable(element: HTMLElement): void {
    $effect(() => {
        console.log('movable $effect')
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        element.addEventListener('mousedown', onMouseDown)
        element.addEventListener('mouseup', onMouseUp)
        element.addEventListener('mousemove', onMouseMove)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)

            element.removeEventListener('mousedown', onMouseDown)
            element.removeEventListener('mouseup', onMouseUp)
            element.removeEventListener('mousemove', onMouseMove)
        }
    })

    let dragWindow: HTMLElement | null = null

    // for moving with mouse:
    let clickedAtX: number, clickedAtY: number
    let clickedAtWindowPosX: number, clickedAtWindowPosY: number

    // for moving with arrow keys:
    let gameWindowLeftInitial: number, gameWindowTopInitial: number

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

    function onKeyDown(e: KeyboardEvent): void {
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
        if (e.key === 'ArrowRight' && movingTo.right) movingTo.right = false
        if (e.key === 'ArrowLeft' && movingTo.left) movingTo.left = false
        if (e.key === 'ArrowUp' && movingTo.top) movingTo.top = false
        if (e.key === 'ArrowDown' && movingTo.bottom) movingTo.bottom = false

        if (Object.values(movingTo).every(v => v === false)) isMoving = false
    }
    function onMouseDown(e: MouseEvent): void {
        if (!(e.target instanceof HTMLElement)) return
        // keep eg. sliders draggable without moving the window
        if (e.target.classList.contains('draggable')) return

        // drag the entire game window around freely:
        movingWithMouse = true
        dragWindow = element

        clickedAtX = e.pageX
        clickedAtY = e.pageY

        const arr = translateFromCSSToArray(dragWindow)
        if (arr === null) {
            dragWindow = null
            return
        }
        clickedAtWindowPosX = arr[0]
        clickedAtWindowPosY = arr[1]
    }
    function onMouseMove(e: MouseEvent): void {
        if (dragWindow === null) return
        dragWindow.style.transform = `translate(${clickedAtWindowPosX + e.pageX - clickedAtX}px, ${clickedAtWindowPosY + e.pageY - clickedAtY}px)`
    }
    function onMouseUp(e: MouseEvent): void {
        movingWithMouse = false
        dragWindow = null
    }

    function resetInitialPositionsX(): void {
        gameWindowLeftInitial = element.offsetLeft
    }
    function resetInitialPositionsY(): void {
        gameWindowTopInitial = element.offsetTop
    }

    function moveWindow(currentTime: number): void {
        if (movingWithMouse) return

        if (movingTo.right && !movingTo.left) {
            if (startTime.xRight === null) {
                resetInitialPositionsX()
                startTime.xRight = currentTime
            }
            const elapsed = currentTime - startTime.xRight
            element.style.left = gameWindowLeftInitial - 1 * elapsed + 'px'
        } else {
            startTime.xRight = null
        }

        if (movingTo.left && !movingTo.right) {
            if (startTime.xLeft === null) {
                resetInitialPositionsX()
                startTime.xLeft = currentTime
            }
            const elapsed = currentTime - startTime.xLeft
            element.style.left = gameWindowLeftInitial + 1 * elapsed + 'px'
        } else {
            startTime.xLeft = null
        }

        if (movingTo.top && !movingTo.bottom) {
            if (startTime.yUp === null) {
                resetInitialPositionsY()
                startTime.yUp = currentTime
            }
            const elapsed = currentTime - startTime.yUp
            element.style.top = gameWindowTopInitial + 1 * elapsed + 'px'
        } else {
            startTime.yUp = null
        }

        if (movingTo.bottom && !movingTo.top) {
            if (startTime.yDown === null) {
                resetInitialPositionsY()
                startTime.yDown = currentTime
            }
            const elapsed = currentTime - startTime.yDown
            element.style.top = gameWindowTopInitial - 1 * elapsed + 'px'
        } else {
            startTime.yDown = null
        }
        if (isMoving) requestAnimationFrame(moveWindow)
    }
}
