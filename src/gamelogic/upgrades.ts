

function Upgrade(name: string, resource: string, cost: number, costMultiplier: number, maxBuy: number = Infinity) {
  this.name = name
  this.resource = resource
  this.cost = cost
  this.costMultiplier = costMultiplier
  this.maxBuy = maxBuy
}
console.log(typeof(new Upgrade()))

export let upgrades = {
  thoughtAcceleration: new Upgrade('thoughtAcceleration', 'thoughts', 10, 1.15),
  thoughtJerk: new Upgrade('thoughtJerk','thoughts', 5_000_000, 1.5),
  thoughtBoostStrength: new Upgrade('thoughtBoostStrength','thoughts', 100, 2.0),
  thoughtBoostDuration: new Upgrade('thoughtBoostDuration','thoughts', 150, 1.4),
  thoughtBoostStack: new Upgrade('thoughtBoostStack','thoughts', 1_000_000, 3),

  cheeseQueueLength: new Upgrade('cheeseQueueLength','cheese', 5, 2),
  cheeseYield: new Upgrade('cheeseYield','cheese', 15, 1.3),
  cheeseDuration: new Upgrade('cheeseDuration','cheese', 50, 1.4, 50),
  cheeseThoughtMult: new Upgrade('cheeseThoughtMult','cheese', 300, 2),
}


