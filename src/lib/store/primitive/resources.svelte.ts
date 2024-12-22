import { makeState } from '../customStore.svelte'

export enum Resource {
    THOUGHTS = 'thoughts',
    KNOWLEDGE = 'knowledge',
    INSIGHT = 'insight',

    ENLIGHTENMENT_POINTS = 'enlightenmentPoints',

    ENERCHEE = 'enerchee',
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

export const resourceTotal = makeState(resourcesInitial as Resources)

export function addResource(res: ResourceType, value: number): void {
    resource.value[res] += value
    resourceTotal.value[res] += value
}

export function multResource(res: ResourceType, value: number): void {
    // this is to that resourceTotal is only changed the correct amount
    const amount = resource.value[res]
    const difference = amount * value - amount
    resource.value[res] += difference
    resourceTotal.value[res] += difference
}
