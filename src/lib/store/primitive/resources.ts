import { makeStore } from '../customStore'

export enum Resource {
    THOUGHTS = 'thoughts',
    CHEESE = 'cheese',
    MOLDY_CHEESE = 'moldyCheese',
    CHEESE_MONSTER = 'cheeseMonster',
    CHEESE_BRAINS = 'cheeseBrains',
    MILK = 'milk',
    BACTERIA = 'bacteria',
    MILK_POINTS = 'milkPoints'
}
export type Resources = Record<Resource, number>
/* export interface Resource {
  thoughts: number
  cheese: number
  moldyCheese: number
  cheeseMonster: number
  cheeseBrains: number
  milk: number
  bacteria: number
  milkPoints: number
} */

export const resource = makeStore<Resources>({
    thoughts: 0,
    cheese: 0,
    moldyCheese: 0,
    cheeseMonster: 0,
    cheeseBrains: 0,
    milk: 0,
    bacteria: 0,
    milkPoints: 0
})
