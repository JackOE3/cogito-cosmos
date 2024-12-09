import { makeStore } from '../customStore'

export enum WindowId {
  thoughtComponent = 'thoughtComponent',
  cheeseComponent = 'cheeseComponent',
  moldyCheeseComponent = 'moldyCheeseComponent',
  cheeseyardComponent = 'cheeseyardComponent',
  milkComponent = 'milkComponent',
  bacteriaComponent = 'bacteriaComponent',
  milkTreeComponent = 'milkTreeComponent',
}

interface Coordinate {
  x: number
  y: number
}
export const windowStack = makeStore<WindowId[]>([WindowId.thoughtComponent])
export const windowLocations = makeStore<Record<WindowId, Coordinate>>({
  thoughtComponent: { x: 0, y: 0 },
  cheeseComponent: { x: 580, y: 0 },
  moldyCheeseComponent: { x: 580, y: 670 },
  cheeseyardComponent: { x: 0, y: 600 },
  milkComponent: { x: 0, y: -500 },
  milkTreeComponent: { x: 400, y: -300 },
  bacteriaComponent: { x: -300, y: -300 },
})
export const windowMinimized = makeStore<Record<WindowId, boolean>>({
  thoughtComponent: false,
  cheeseComponent: false,
  moldyCheeseComponent: false,
  cheeseyardComponent: false,
  milkComponent: false,
  milkTreeComponent: false,
  bacteriaComponent: false,
})
