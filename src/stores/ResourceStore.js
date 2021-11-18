import { writable, get } from 'svelte/store';

export const bones = writable({
  name: 'bones',
  amount: 0,
  perSec: 0,
  perAction: 1,
  maxAmount: 50,
  active: false
})

export const essence = writable({
  name: 'essence',
  amount: 0,
  perSec: 0,
  perAction: 1,
  maxAmount: 10,
  active: false,
  requirements: () => {
    if (get(bones).amount < 10) return false
    return true
  }
})
