import { writable } from 'svelte/store';

export const skeletons = writable({
  name: 'skeletons',
  amount: 0,
  perSec: 0,
  perAction: 1,
  maxAmount: 5,
  cost: {
    bones: 10,
    essence: 1
  }
})

