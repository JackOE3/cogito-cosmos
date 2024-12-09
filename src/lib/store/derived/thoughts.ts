import { derived } from 'svelte/store'
import { unlocked } from '../primitive/unlocks'
import { upgrades } from '../primitive/upgrades'
import { resource } from '../primitive/resources'
import { currentThoughtBoost, cheeseQueueTotalCycles } from '../primitive'
import { monsterThoughtMult } from './cheeseMonster' // potentially dangerous importing from other derived/stores (cyclical dependencies)
import { checkBoolForNum } from '../../gamelogic/utils'

console.log('stores/thoughts.ts')

/* export const thoughtBoostMax = derived(upgrades, $upgrades => 2 + 0.25 * $upgrades.thoughtBoostStrength.bought) */
export const thoughtBoostMax = derived(upgrades, $upgrades => 1.5 + 0.2 * Math.pow($upgrades.thoughtBoostStrength.bought, 1.5))
export const thoughtBoostDuration = derived(upgrades, $upgrades => 5000 + 5000 * $upgrades.thoughtBoostDuration.bought)
export const thoughtBoostMaxStacks = derived(upgrades, $upgrades => 1 + $upgrades.thoughtBoostStack.bought)

export const thoughtsPerSecBase = derived([unlocked, upgrades], ([$unlocked, $upgrades]) => {
    const fromBasicUpgrades = $upgrades.thoughtAcceleration.bought * (1 * $upgrades.thoughtJerk.bought + 1)

    return +$unlocked.thinkPassively + fromBasicUpgrades
})
export const thoughtMultFromUnlocks = derived(unlocked, $unlocked => checkBoolForNum($unlocked.thoughts50Percent, 1.5))

export const cheeseThoughtMult = derived(
    [resource, upgrades],
    ([$resource, $upgrades]) => 1 + Math.log($resource.cheese + 1) * $upgrades.cheeseThoughtMult.bought * $upgrades.cheeseThoughtMult.bought
)

export const cheeseCyclesThoughtMult = derived([unlocked, cheeseQueueTotalCycles], ([$unlocked, $cheeseQueueTotalCycles]) =>
    checkBoolForNum($unlocked.cheeseCyclesBoostThoughts, 1 + 0.001 * Math.pow($cheeseQueueTotalCycles, 1.5))
)

export const thoughtsPerSec = derived(
    [thoughtsPerSecBase, thoughtMultFromUnlocks, currentThoughtBoost, cheeseThoughtMult, cheeseCyclesThoughtMult, monsterThoughtMult],
    $factors => $factors.reduce((prev, curr) => prev * curr, 1)
)
