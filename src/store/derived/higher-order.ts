import { derived } from 'svelte/store'
import {
  cheeseBoostFactorYield,
  cheeseCycleAcceleratorFactor,
  cheeseCyclesThoughtMult,
  cheeseModeFactor,
  cheeseMonsterCapacityPerUpgrade,
  cheeseMonsterDeathrate,
  cheeseQueueCostDivideBy,
  cheeseQueueOverclockCostMult,
  cheeseQueueOverclockSpeedMult,
  cheeseThoughtMult,
  cheeseYieldDeltaDuration,
  collectiveSentienceBoost,
  maxCheeseQueue,
  mcConversionExponent,
  mcHalfLifeSeconds,
  monsterMoldyCheeseFactor,
  monsterThoughtFactor,
  resourceFactorFromBrainMode,
  thoughtMultFromUnlocks,
  thoughtsPerSecBase,
} from './from-primitive'
import { cheeseFactoryMode, currentThoughtBoost, resource, unlocked, upgrades } from '../primitive'
import { checkBoolForNum } from '@gamelogic/utils'

const baseCost = 10
export const cheeseCycleBase = {
  duration: derived(upgrades, $upgrades => 1000 + cheeseYieldDeltaDuration * $upgrades.cheeseYield.bought), // milliseconds
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

export const cheeseQueueLengthBoostFactor = derived([unlocked, maxCheeseQueue], ([$unlocked, $maxCheeseQueue]) =>
  checkBoolForNum($unlocked.cheeseQueueLengthBoost, ($maxCheeseQueue * $maxCheeseQueue) / 100)
)

/* Reactive variables for Yield, Duration & Cost of the cheese cycle */

export const cheeseCycleBatchSize = derived(
  [cheeseCycleBase.yield, cheeseQueueLengthBoostFactor, cheeseBoostFactorYield, cheeseModeFactor],
  ([$cheeseCycleBaseYield, $cheeseQueueLengthBoostFactor, $cheeseBoostFactorYield, $cheeseModeFactor]) =>
    $cheeseCycleBaseYield * $cheeseQueueLengthBoostFactor * $cheeseBoostFactorYield * $cheeseModeFactor.yield
)

export const cheeseCycleDuration = derived(
  [cheeseCycleBase.duration, cheeseQueueOverclockSpeedMult, cheeseModeFactor, cheeseCycleAcceleratorFactor],
  ([$cheeseCycleBaseDuration, $cheeseQueueOverclockSpeedMult, $cheeseModeFactor, $cheeseCycleAcceleratorFactor]) =>
    $cheeseCycleBaseDuration *
    (1 / $cheeseQueueOverclockSpeedMult) *
    $cheeseModeFactor.duration *
    (1 / $cheeseCycleAcceleratorFactor)
)

export const cheeseCycleCost = derived(
  [cheeseCycleBase.cost, cheeseModeFactor],
  ([$cheeseCycleBaseCost, $cheeseModeFactor]) => $cheeseCycleBaseCost * $cheeseModeFactor.cost
)

export const mcCycleDurationBoostFactor = derived(cheeseModeFactor, $cheeseModeFactor =>
  Math.pow($cheeseModeFactor.duration, 1.5)
)

export const mcHalflifeBoostFactor = derived(
  mcHalfLifeSeconds,
  $mcHalfLifeSeconds => +1e-6 * Math.pow($mcHalfLifeSeconds, 3)
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

export const cheeseMonsterMassacreMultiplier = derived(
  [unlocked, cheeseMonsterDeathsPerSec],
  ([$unlocked, $cheeseMonsterDeathsPerSec]) =>
    $unlocked.cheeseMonsterMassacre ? 1 + Math.pow($cheeseMonsterDeathsPerSec, 1.3) : 1
)

export const cheeseMonsterLootAmount = derived(
  [upgrades, cheeseMonsterMassacreMultiplier],
  ([$upgrades, $cheeseMonsterMassacreMultiplier]) =>
    (1 + $upgrades.cheeseMonsterLoot.bought) * $cheeseMonsterMassacreMultiplier
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

export const mcByproductAmount = derived(
  [
    unlocked,
    mcConversionExponent,
    monsterMoldyCheeseMult,
    cheeseFactoryMode,
    cheeseCycleBatchSize,
    mcCycleDurationBoostFactor,
    mcHalflifeBoostFactor,
  ],
  ([
    $unlocked,
    $mcConversionExponent,
    $monsterMoldyCheeseMult,
    $cheeseFactoryMode,
    $cheeseCycleBatchSize,
    $mcCycleDurationBoostFactor,
    $mcHalflifeBoostFactor,
  ]) =>
    $cheeseFactoryMode !== 'warpSpeed'
      ? Math.pow($cheeseCycleBatchSize, $mcConversionExponent) *
        $monsterMoldyCheeseMult *
        ($unlocked.moldyCheeseCycleDurationBoost ? $mcCycleDurationBoostFactor : 1) *
        ($unlocked.moldyCheeseHalflifeBoost ? $mcHalflifeBoostFactor : 1)
      : 0
)

export const mcManualConversionAmount = derived(
  [resource, unlocked, mcConversionExponent, monsterMoldyCheeseMult],
  ([$resource, $unlocked, $mcConversionExponent, $monsterMoldyCheeseMult]) =>
    Math.pow($resource.cheese, $mcConversionExponent) *
    $monsterMoldyCheeseMult *
    ($unlocked.manualMoldyCheeseConversionBoost ? 10 : 1)
)

export const thoughtsPerSec = derived(
  [
    thoughtsPerSecBase,
    thoughtMultFromUnlocks,
    currentThoughtBoost,
    cheeseThoughtMult,
    cheeseCyclesThoughtMult,
    monsterThoughtMult,
  ],
  $factors => $factors.reduce((prev, curr) => prev * curr, 1)
)
