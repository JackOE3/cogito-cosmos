import { derived } from 'svelte/store'
import {
  cheeseMonsterCapacityPerUpgrade,
  cheeseMonsterDeathrate,
  cheeseQueueCostDivideBy,
  cheeseQueueOverclockCostMult,
  cheeseYieldDeltaDuration,
  collectiveSentienceBoost,
  monsterMoldyCheeseFactor,
  monsterThoughtFactor,
  resourceFactorFromBrainMode,
} from './from-primitive'
import { resource, upgrades } from '../primitive'

const baseCost = 10
export const cheeseQueue = {
  infinite: false,
  state: 'initial',
  capDelta: 5,
  cycleDuration: derived(upgrades, $upgrades => 1000 + cheeseYieldDeltaDuration * $upgrades.cheeseYield.bought), // milliseconds
  yield: derived(
    upgrades,
    $upgrades => 1 + 0.5 * ($upgrades.cheeseYield.bought + $upgrades.cheeseYield.bought * $upgrades.cheeseYield.bought)
  ),
  cost: derived(
    [cheeseQueueOverclockCostMult, cheeseQueueCostDivideBy],
    ([$cheeseQueueOverclockCostMult, $cheeseQueueCostDivideBy]) => {
      return (baseCost * $cheeseQueueOverclockCostMult) / $cheeseQueueCostDivideBy
    }
  ),
}

// eh.... should be in fromPrimitive.ts
export const maxCheeseQueue = derived(
  upgrades,
  $upgrades => 5 + cheeseQueue.capDelta * $upgrades.cheeseQueueLength.bought
)

export const cheeseMonsterCapacity = derived(
  [upgrades, cheeseMonsterCapacityPerUpgrade],
  ([$upgrades, $cheeseMonsterCapacityPerUpgrade]) =>
    $cheeseMonsterCapacityPerUpgrade * (1 + $upgrades.cheeseMonsterCapacity.bought)
)

export const cheeseMonsterDeathsPerSec = derived(
  [cheeseMonsterDeathrate, resource],
  ([$cheeseMonsterDeathrate, $resource]) => $cheeseMonsterDeathrate * $resource.cheeseMonster
)

export const monsterThoughtMult = derived(
  [monsterThoughtFactor, resource, resourceFactorFromBrainMode, collectiveSentienceBoost],
  ([$monsterThoughtFactor, $resource, $resourceFactorFromBrainMode, $collectiveSentienceBoost]) =>
    1 + $monsterThoughtFactor * $collectiveSentienceBoost * $resource.cheeseMonster * $resourceFactorFromBrainMode
)

export const monsterMoldyCheeseMult = derived(
  [monsterMoldyCheeseFactor, resource, resourceFactorFromBrainMode],
  ([$monsterMoldyCheeseFactor, $resource, $resourceFactorFromBrainMode]) =>
    1 + $monsterMoldyCheeseFactor * $resource.cheeseMonster * $resourceFactorFromBrainMode
)
