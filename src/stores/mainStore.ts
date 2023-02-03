import { makeStore, makeStore2 } from './customStore'


export const LORCA_OVERRIDE = makeStore(true)
export const devToolsEnabled = makeStore(true)

export const lastSaved = makeStore(Date.now())

export {resource} from './resources'

//export const thoughts = makeStore(0)
export const thoughtsPerSec = makeStore(0)
export const thoughtsBonus = makeStore(1)
export const cheeseThoughtMult = makeStore(1)
export const cheeseCyclesThoughtMult = makeStore(1)
export const monsterThoughtMult = makeStore(1)

//export const cheese = makeStore(0)
export const cheeseBatchSize = makeStore(1)
export const currentCheeseQueue = makeStore(0)
export const maxCheeseQueue = makeStore(5)
export const cheeseQueueTotalCycles = makeStore(0)
export const cheeseFactoryMode = makeStore('nominal')

//export const moldyCheese = makeStore(0)
export const moldyCheeseHalfLifeSeconds = makeStore(10)

//export const cheeseMonster = makeStore(0)

export const cheeseMonsterSpawnrate = makeStore(1)
export const cheeseMonsterCapacity = makeStore(10)


//export const upgrades = makeStore(upgradesInitial)
export {upgrades} from './upgrades'

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
  "manualMoldyCheeseConversionBoost": false,
  "cheeseyard": false,
  "moldyCheeseCycleDurationBoost": false,

  "cheeseMonsterMassacre": false,
  "cheeseMonsterCollectiveSentience": false,
  

  "cheeseQueueToppedUp": false,
})




