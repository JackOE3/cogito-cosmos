import { makeStore } from '../customStore'

export enum WindowId {
  thoughtComponent = 'thoughtComponent',
  cheeseComponent = 'cheeseComponent',
  moldyCheeseComponent = 'moldyCheeseComponent',
  cheeseyardComponent = 'cheeseyardComponent',
  milkComponent = 'milkComponent',
}

export const windowStack = makeStore<WindowId[]>([WindowId.thoughtComponent])
export const windowLocations = makeStore<Record<WindowId, [number, number]>>({
  thoughtComponent: [0, 0],
  cheeseComponent: [580, 0],
  moldyCheeseComponent: [580, 670],
  cheeseyardComponent: [0, 600],
  milkComponent: [0, -300],
})
export const windowMinimized = makeStore<Record<WindowId, boolean>>({
  thoughtComponent: false,
  cheeseComponent: false,
  moldyCheeseComponent: false,
  cheeseyardComponent: false,
  milkComponent: false,
})
