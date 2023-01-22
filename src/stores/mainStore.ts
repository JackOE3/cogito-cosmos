import { writable, derived, get, readable} from 'svelte/store'; 
import {noRef} from '../gamelogic/utils'

function makeStore<T>(init: T) {
  const initial = init
  const store = writable(noRef(initial))
  const reset = () => store.set(initial)
  return {...store, reset}
}


export const LORCA_OVERRIDE = makeStore(true)
export const devToolsEnabled = makeStore(true)

export const lastSaved = makeStore(Date.now())

export const resource = makeStore({
  thoughts: 0,
  cheese: 0,
  moldyCheese: 0,
  cheeseBrains: 0
})

export const thoughts = makeStore(0)
export const thoughtsPerSec = makeStore(0)
export const thoughtsBonus = makeStore(1)
export const cheeseThoughtMult = makeStore(1)
export const monsterThoughtMult = makeStore(1)

export const cheese = makeStore(0)
export const cheeseBatchSize = makeStore(1)
export const currentCheeseQueue = makeStore(0)
export const maxCheeseQueue = makeStore(5)
export const cheeseQueueTotalCycles = makeStore(0)

export const moldyCheese = makeStore(0)
export const moldyCheeseHalfLifeSeconds = makeStore(10)

export const cheeseMonster = makeStore(0)
export const cheeseMonsterSpawnrate = makeStore(0)
export const cheeseMonsterCapacity = makeStore(10)
export const cheeseBrains = makeStore(0)

export const unlocked = makeStore({
  "thinkPassively": false,
  "thinkFaster": false,
  "thoughtBoost": false,
  "switzerland": false,
  "thoughtBoostStack": false,
  "moldyCheese": false,

  "cheeseQueue": false,
  "cheeseQueueLengthBoost": false,
  "cheeseBoost": false,
  "cheeseCycleAccelerator": false,
  "cheeseMode": false,
  "thoughtJerk": false,

  "moldyCheeseByproduct": false,
  "cheeseyard": false,
  "manualMoldyCheeseConversionBoost": false,

  "cheeseMonsterMassacre": false,
  

  "cheeseQueueToppedUp": false,
})

/* export const thoughtUpgradesBought = makeStore({
  "thoughtAcceleration": 0,
  "thoughtJerk": 0,
  "thoughtBoostStrength": 0,
  "thoughtBoostDuration": 0,
  "thoughtBoostStack": 0,
})
export const cheeseUpgradesBought = makeStore({
  "cheeseQueueLength": 0,
  "cheeseYield": 0,
  "cheeseDuration": 0,
  "cheeseThoughtMult": 0,
})
export const moldyCheeseUpgradesBought = makeStore({
  "conversionExponent": 0,
  "moldyCheeseHalfLife": 0,
  "moldyCheeseChance": 0,
  "cheeseMonsterSpawnrate": 0,
  "cheeseMonsterCapacity": 0,
}) */

export const upgradesBought = makeStore({
  "thoughtAcceleration": 0,
  "thoughtJerk": 0,
  "thoughtBoostStrength": 0,
  "thoughtBoostDuration": 0,
  "thoughtBoostStack": 0,

  "cheeseQueueLength": 0,
  "cheeseYield": 0,
  "cheeseDuration": 0,
  "cheeseThoughtMult": 0,

  "conversionExponent": 0,
  "moldyCheeseHalfLife": 0,
  "moldyCheeseChance": 0,
  "cheeseMonsterSpawnrate": 0,
  "cheeseMonsterCapacity": 0,
})
