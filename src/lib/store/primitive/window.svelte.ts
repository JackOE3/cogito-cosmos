import { makeState } from '../customStore.svelte'

export enum WindowId {
    COGITO_ERGO_SUM = 'cogitoErgoSum',
    THOUGHTS = 'thoughts',
    KNOWLEDGE = 'knowledge',
    INSIGHT = 'insight'
    /* cheeseComponent = 'cheeseComponent',
    moldyCheeseComponent = 'moldyCheeseComponent',
    cheeseyardComponent = 'cheeseyardComponent',
    milkComponent = 'milkComponent',
    bacteriaComponent = 'bacteriaComponent',
    milkTreeComponent = 'milkTreeComponent' */
}

interface Coordinate {
    x: number
    y: number
}

export const windowStackInitial = [WindowId.COGITO_ERGO_SUM, WindowId.KNOWLEDGE]
export const windowStack = windowStackInitial

export const windowLocationsInitial: Record<WindowId, Coordinate> = {
    cogitoErgoSum: { x: 0, y: 0 },
    thoughts: { x: 0, y: 0 },
    knowledge: { x: 0, y: 0 },
    insight: { x: 0, y: 0 }
    /* cheeseComponent: { x: 580, y: 0 },
    moldyCheeseComponent: { x: 580, y: 670 },
    cheeseyardComponent: { x: 0, y: 600 },
    milkComponent: { x: 0, y: -500 },
    milkTreeComponent: { x: 400, y: -300 },
    bacteriaComponent: { x: -300, y: -300 } */
}
export const windowLocations = makeState(windowLocationsInitial)
