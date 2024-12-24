import { makeState } from '../customStore.svelte'

export enum WindowId {
    COGITO_ERGO_SUM = 'cogitoErgoSum',
    ENLIGHTENMENT = 'enlightenment',
    STORY = 'story',

    THOUGHTS = 'thoughts',
    KNOWLEDGE = 'knowledge',
    INSIGHT = 'insight',

    CHEESE = 'cheese'
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

export const windowStackInitial = [WindowId.COGITO_ERGO_SUM]
export const windowStack = makeState(windowStackInitial)

export const windowLocationsInitial: Record<WindowId, Coordinate> = {
    cogitoErgoSum: { x: 0, y: 0 },
    enlightenment: { x: 0, y: -300 },
    story: { x: 0, y: 350 },

    thoughts: { x: 550, y: 0 },
    knowledge: { x: 800, y: 0 },
    insight: { x: 1050, y: 0 },

    cheese: { x: -600, y: 0 }
    /* cheeseComponent: { x: 580, y: 0 },
    moldyCheeseComponent: { x: 580, y: 670 },
    cheeseyardComponent: { x: 0, y: 600 },
    milkComponent: { x: 0, y: -500 },
    milkTreeComponent: { x: 400, y: -300 },
    bacteriaComponent: { x: -300, y: -300 } */
}
export const windowLocations = makeState(windowLocationsInitial)
