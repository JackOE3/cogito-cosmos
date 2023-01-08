import { writable, derived, get} from 'svelte/store'; 

export const LORCA_OVERRIDE = writable(false)
export const devToolsEnabled = writable(true)


export const lastSaved = writable(Date.now())

export const thoughts= writable(0)
export const thoughtsPerSec = writable(0)
export const thoughtsBonus = writable(1)
export const cheeseThoughtMult = writable(1)
export const thoughtsSacrificed = writable(0)

export const cheese = writable(0)
export const cheesePerSec = writable(0)
export const moldyCheese = writable(0)


export const unlocked = writable({
  "thinkPassively": false,
  "thinkFaster": false,
  "thoughtBoost": false,
  "switzerland": false,
  "cheeseQueue": false,
  "thoughtSacrifice": false,
  "thoughtJerk": false,
  "moldyCheese": false,
})

