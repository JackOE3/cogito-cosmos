import { writable, derived, get} from 'svelte/store'; 

export const LORCA_OVERRIDE = writable(false)
export const devToolsEnabled = writable(true)


export const lastSaved = writable(Date.now())

export const thoughts= writable(0)
export const thoughtsPerSec = writable(0)
export const thoughtsBonus = writable(1)
export const cheeseThoughtMult = writable(1)

export const cheese = writable(0)
export const cheeseBatchSize = writable(1)
export const currentCheeseQueue = writable(0)
export const maxCheeseQueue = writable(5)
export const cheeseQueueTotalCycles = writable(0)

export const moldyCheese = writable(0)
export const moldyCheeseHalfLifeSeconds = writable(10)


export const unlocked = writable({
  "thinkPassively": false,
  "thinkFaster": false,
  "thoughtBoost": false,
  "switzerland": false,
  "thoughtSacrifice": false,
  "thoughtBoostStack": false,
  "moldyCheese": false,

  "cheeseQueue": false,
  "thoughtJerk": false,
  "cheeseQueueLengthBoost": false,
  "cheeseBoost": false,
  "cheeseQueueToppedUp": false,
  "cheeseCycleAccelerator": false,

  "moldyCheeseByproduct": false,
  "cheeseyard": false,
  
})

