import { makeStore } from './customStore'

console.log('unlocks.ts')

export interface IUnlock {
  name: string
  resource: string
  cost: number
}
class Unlock implements IUnlock {
  constructor(public name: string, public resource: string, public cost: number) {}
}

export const unlocks: Record<string, IUnlock> = {
  // Cogito Ergo Sum
  thinkPassively: new Unlock('thinkPassively', 'thoughts', 10),
  thinkFaster: new Unlock('thinkFaster', 'thoughts', 30),
  thoughtBoost: new Unlock('thoughtBoost', 'thoughts', 50),
  switzerland: new Unlock('switzerland', 'thoughts', 3000),
  thoughtBoostStack: new Unlock('thoughtBoostStack', 'thoughts', 1e6),
  moldyCheese: new Unlock('moldyCheese', 'thoughts', 1e9),
  milk: new Unlock('milk', 'thoughts', 1e14),

  // Switzerland Simulator
  cheeseQueue: new Unlock('cheeseQueue', 'cheese', 8),
  cheeseQueueLengthBoost: new Unlock('cheeseQueueLengthBoost', 'cheese', 1_000),
  cheeseBoost: new Unlock('cheeseBoost', 'cheese', 25_000),
  cheeseCycleAccelerator: new Unlock('cheeseCycleAccelerator', 'cheese', 100_000),
  thoughtJerk: new Unlock('thoughtJerk', 'cheese', 300_000),
  cheeseModes: new Unlock('cheeseModes', 'cheese', 500_000),
  cheeseCyclesBoostThoughts: new Unlock('cheeseCyclesBoostThoughts', 'cheese', 5_000_000),

  // Moldy Cheese
  moldyCheeseByproduct: new Unlock('moldyCheeseByproduct', 'moldyCheese', 50),
  cheeseyard: new Unlock('cheeseyard', 'moldyCheese', 1000),
  manualMoldyCheeseConversionBoost: new Unlock('manualMoldyCheeseConversionBoost', 'moldyCheese', 2000),
  moldyCheeseCycleDurationBoost: new Unlock('moldyCheeseCycleDurationBoost', 'moldyCheese', 4000),

  // The Cheeseyard
  cheeseMonsterMassacre: new Unlock('cheeseMonsterMassacre', 'cheeseBrains', 50),
  cheeseMonsterCollectiveSentience: new Unlock('cheeseMonsterCollectiveSentience', 'cheeseBrains', 1000),
  cheeseMonsterTotalDeathsBoost: new Unlock('cheeseMonsterTotalDeathsBoost', 'cheeseBrains', 10000),
}

export const unlocked = makeStore<Record<string, boolean>>({
  // Cogito Ergo Sum
  thinkPassively: false,
  thinkFaster: false,
  thoughtBoost: false,
  switzerland: false,
  thoughtBoostStack: false,
  moldyCheese: false,
  milk: false,

  // Switzerland Simulator
  cheeseQueue: false,
  cheeseQueueLengthBoost: false,
  cheeseBoost: false,
  cheeseCycleAccelerator: false,
  thoughtJerk: false,
  cheeseModes: false,
  cheeseCyclesBoostThoughts: false,

  // Moldy Cheese
  moldyCheeseByproduct: false,
  manualMoldyCheeseConversionBoost: false,
  cheeseyard: false,
  moldyCheeseCycleDurationBoost: false,

  // The Cheeseyard
  monsterBrainWaveController: false,
  cheeseMonsterMassacre: false,
  cheeseMonsterCollectiveSentience: false,
  cheeseMonsterTotalDeathsBoost: false,

  // Milk

  cheeseQueueToppedUp: false,
})
