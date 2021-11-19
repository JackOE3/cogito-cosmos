import { writable, get } from 'svelte/store';

export const str = writable({
  name: 'strength',
  points: 0,
  exp: 0,
  expPerSec: 0,
  expToNextPoint: 10,
  multiplier: 1.5,
  active: false,
  perAction: 1
})
