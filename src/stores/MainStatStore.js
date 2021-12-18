import { writable, get, set } from 'svelte/store';

export const str = writable({
  name: 'strength',
  points: 0,
  exp: 0,
  expPerSec: 0,
  expToNextPoint: 10,
  multiplier: 1.5,
  active: false,
  perAction: 1,
  action: 'Do 100 pushups',
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

export var nextCapacityReq = (function() {
  var totalPoints = 0 // This is the private persistent value
  // The outer function returns a nested function that has access
  // to the persistent value.  It is this nested function we're storing
  // in the variable nextCapacityReq above.
  const pIndex1 = 0.45
  const pIndex2 = 0.30
  //const pIndex3 = 1 - pIndex1 - pIndex2
  return function() {
    let req = [0,0,0]
    let index1 = Math.floor(Math.random()*3) // 0, 1 or 2
    let index2 = (index1+1)%3
    let index3 = (index1+2)%3
    totalPoints++
    for (let p = 0; p < totalPoints; p++) {
      let rnd = Math.random()
      if (rnd <= pIndex1) req[index1]++
      else if (rnd <= pIndex1 + pIndex2) req[index2]++
      else req[index3]++
    }
    return req
  }
})() // Invoke the outer function after defining it.

/**
 * A function that can be called anywhere to update the stats in the svelte stores.
 * This will trigger the svelte components to re-evaluate and update their content.
 */
export function updateStats() {
  str.update(m => m = m)
  spd.update(m => m = m)
  end.update(m => m = m)
}