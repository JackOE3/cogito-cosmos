import { makeState } from '../customStore.svelte'

export enum Resource {
    THOUGHTS = 'thoughts',
    KNOWLEDGE = 'knowledge',
    INSIGHT = 'insight',
    CHEESE = 'cheese',
    MOLDY_CHEESE = 'moldyCheese',
    CHEESE_MONSTER = 'cheeseMonster',
    CHEESE_BRAINS = 'cheeseBrains'
    /* MILK = 'milk',
    BACTERIA = 'bacteria',
    MILK_POINTS = 'milkPoints' */
}
export type ResourceType = `${Resource}`

export type Resources = Record<Resource, number>

const resourcesInitial = Object.fromEntries(Object.values(Resource).map(resource => [resource, 0]))

export const resource = makeState(resourcesInitial as Resources)
