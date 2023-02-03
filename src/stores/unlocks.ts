
function Unlock(name: string, resource: string, cost: number) {
  this.name = name
  this.resource = resource
  this.cost = cost
}

export let unlocks = {
  thinkPassively: new Unlock("thinkPassively", 'thoughts', 10),
  thinkFaster: new Unlock("thinkFaster", 'thoughts', 30),
  thoughtBoost: new Unlock("thoughtBoost", 'thoughts',50),
  switzerland: new Unlock("switzerland", 'thoughts', 3000),
  thoughtBoostStack: new Unlock("thoughtBoostStack", 'thoughts', 1e6),
  moldyCheese: new Unlock("moldyCheese", 'thoughts', 1e9),

  cheeseQueue: new Unlock("cheeseQueue", 'cheese', 8),
  cheeseQueueLengthBoost: new Unlock("cheeseQueueLengthBoost", 'cheese', 1_000),
  cheeseBoost: new Unlock("cheeseBoost", 'cheese', 25_000),
  cheeseCycleAccelerator: new Unlock("cheeseCycleAccelerator", 'cheese', 100_000),
  thoughtJerk: new Unlock("thoughtJerk", 'cheese', 300_000),
  cheeseModes: new Unlock("cheeseModes", 'cheese', 500_000),
  cheeseCyclesBoostThoughts: new Unlock("cheeseCyclesBoostThoughts", 'cheese', 5_000_000),

  moldyCheeseByproduct: new Unlock("moldyCheeseByproduct", 'moldyCheese', 50),
  cheeseyard: new Unlock("cheeseyard", 'moldyCheese', 1000),
  manualMoldyCheeseConversionBoost: new Unlock("manualMoldyCheeseConversionBoost", 'moldyCheese', 2000),
  moldyCheeseCycleDurationBoost: new Unlock("moldyCheeseCycleDurationBoost", 'moldyCheese', 2000),

}
