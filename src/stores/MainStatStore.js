import { writable, get } from 'svelte/store';
import {strColor, spdColor, endColor} from '../constants.js'

export const str = writable({
  name: 'strength',
  points: 0,
  exp: 0,
  expPerSec: 0,
  expToNextPoint: 10,
  multiplier: 1.5,
  active: false,
  perAction: 1,
  action: 'Do 100 pushups'
})
export const spd = writable({
  name: 'speed',
  points: 0,
  exp: 0,
  expPerSec: 0,
  expToNextPoint: 10,
  multiplier: 1.5,
  active: false,
  perAction: 1,
  action: 'Do 100 side jumps'
})
export const end = writable({
  name: 'endurance',
  points: 0,
  exp: 0,
  expPerSec: 0,
  expToNextPoint: 10,
  multiplier: 1.5,
  active: false,
  perAction: 1,
  action: 'Run 10km'
})

export const capacity = writable(1)

export const capacityReq = [[2,0,0], [0,1,1], [1,1,3]]


/**
 * A function that can be called anywhere to update the stats in the svelte stores.
 * This will trigger the svelte components to re-evaluate and update their content.
 */
export function updateStats() {
  str.update(m => m = m)
  spd.update(m => m = m)
  end.update(m => m = m)
}