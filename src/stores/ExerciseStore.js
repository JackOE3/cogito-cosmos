import { writable } from 'svelte/store';

export const pushups = writable({
  name: "pushups",
  amount: 0,
  expPerSec: {
    str: 1,
  }
})
export const running = writable({
  name: "running",
  amount: 0,
  expPerSec: {
    end: 1,
  }
})
export const sidejumps = writable({
  name: "sidejumps",
  amount: 0,
  expPerSec: {
    spd: 1,
  }
})


export const pullups = writable({
  name: "pullups",
  amount: 0,
  expPerSec: {
    str: 1,
  }
})