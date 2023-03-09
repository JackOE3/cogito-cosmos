import { derived } from 'svelte/store'
import { unlocked } from '../unlocks'
import { upgrades } from '../upgrades'
import { resource } from '../resources'
import { currentThoughtBoost, cheeseQueueTotalCycles } from '../mainStore'
import { monsterThoughtMult } from './cheeseMonster' // potentially dangerous importing from other derived/stores (cyclical dependencies)

console.log('stores/thoughts.ts')

export const thoughtBoostMax = derived(upgrades, $upgrades => 2 + 0.25 * $upgrades.thoughtBoostStrength.bought)
export const thoughtBoostDuration = derived(upgrades, $upgrades => 4000 + 2000 * $upgrades.thoughtBoostDuration.bought)
export const thoughtBoostMaxStacks = derived(upgrades, $upgrades => 1 + $upgrades.thoughtBoostStack.bought)

export const thoughtsPerSecBase = derived(
  [unlocked, upgrades],
  ([$unlocked, $upgrades]) =>
    +$unlocked.thinkPassively + $upgrades.thoughtAcceleration.bought * (1 * $upgrades.thoughtJerk.bought + 1)
)

export const cheeseThoughtMult = derived(
  [resource, upgrades],
  ([$resource, $upgrades]) => 1 + Math.log($resource.cheese + 1) * $upgrades.cheeseThoughtMult.bought
)

export const cheeseCyclesThoughtMult = derived(
  [unlocked, cheeseQueueTotalCycles],
  ([$unlocked, $cheeseQueueTotalCycles]) =>
    $unlocked.cheeseCyclesBoostThoughts ? Math.sqrt(1 + 0.1 * $cheeseQueueTotalCycles) : 1
)
export const thoughtsPerSec = derived(
  [thoughtsPerSecBase, currentThoughtBoost, cheeseThoughtMult, cheeseCyclesThoughtMult, monsterThoughtMult],
  $factors => $factors.reduce((prev, curr) => prev * curr, 1)
)
