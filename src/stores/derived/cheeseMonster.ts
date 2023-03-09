import { derived } from 'svelte/store'
import { unlocked } from '../unlocks'
import { upgrades } from '../upgrades'
import { resource } from '../resources'
import { brainMode, totalCheeseMonsterDeaths } from '../mainStore'

console.log('stores/cheeseMonster.ts')

export const resourceFactorFromBrainMode = derived(brainMode, $brainMode => {
  const result = {
    thoughts: 1,
    cheese: 1,
  }
  switch ($brainMode) {
    case 'peaceful': {
      result.thoughts = 1
      break
    }
    case 'neutral': {
      result.thoughts = 0.2
      break
    }
    case 'destructive': {
      result.thoughts = 0
      break
    }
  }

  return result
})

export const cheeseMonsterCapacity = derived(upgrades, $upgrades => 10 + 10 * $upgrades.cheeseMonsterCapacity.bought)

/** per second */
export const cheeseMonsterSpawnrate = derived(
  [unlocked, upgrades],
  ([$unlocked, $upgrades]) => (+$unlocked.cheeseyard * (1 + $upgrades.cheeseMonsterSpawnrate.bought)) / 6
)
export const cheeseMonsterDeathrate = derived(brainMode, $brainMode =>
  $brainMode === 'peaceful' ? 0 : $brainMode === 'neutral' ? 0.01 : 0.1
)

export const cheeseMonsterLootAmount = derived(upgrades, $upgrades => 1 + $upgrades.cheeseMonsterLoot.bought)
export const cheeseMonsterDropRate = derived(upgrades, $upgrades => 0.1 + 0.05 * $upgrades.cheeseMonsterDropRate.bought)
export const totalMonsterDeathsLootBoost = derived([unlocked, totalCheeseMonsterDeaths], ([$unl, $totalDeaths]) =>
  $unl.cheeseMonsterTotalDeathsBoost ? Math.sqrt(1 + $totalDeaths / 10) : 1
)

export const collectiveSentienceBoost = derived([resource, unlocked], ([$resource, $unlocked]) =>
  $unlocked.collectiveSentienceBoost ? $resource.cheeseMonster : 1
)

// how much each monster boosts thoughts/s (additive per monster)
const monsterThoughtFactorBase = 2
export const monsterThoughtFactor = derived(
  [upgrades, collectiveSentienceBoost],
  ([$upgrades, $collectiveSentienceBoost]) =>
    (monsterThoughtFactorBase + $upgrades.cheeseMonsterSentience.bought) * $collectiveSentienceBoost
)

export const monsterThoughtMult = derived(
  [monsterThoughtFactor, resource, resourceFactorFromBrainMode],
  ([$monsterThoughtFactor, $resource, $resourceFactorFromBrainMode]) =>
    $monsterThoughtFactor * $resource.cheeseMonster * $resourceFactorFromBrainMode.thoughts
)
