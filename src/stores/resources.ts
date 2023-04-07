import { makeStore } from './customStore'

console.log('resources.ts')

export interface Resource {
  thoughts: number
  cheese: number
  moldyCheese: number
  cheeseMonster: number
  cheeseBrains: number
  milk: number
  milkPower: number
  milkPoints: number
}

export const resource = makeStore<Resource>({
  thoughts: 0,
  cheese: 0,
  moldyCheese: 0,
  cheeseMonster: 0,
  cheeseBrains: 0,
  milk: 0,
  milkPower: 0,
  milkPoints: 0,
})

/* const resource2 = {
  thoughts: makeStore(0),
  cheese: makeStore(0),
  moldyCheese: makeStore(0),
  cheeseMonster: makeStore(0),
  cheeseBrains: makeStore(0),
} */
