import { derived } from 'svelte/store'
import { unlocked } from '../primitive/unlocks'
import { upgrades } from '../primitive/upgrades'
import { resource } from '../primitive/resources'
import { brainMode, totalCheeseMonsterDeaths } from '../primitive'

console.log('stores/cheeseMonster.ts')

export const resourceFactorFromBrainMode = derived(brainMode, $brainMode => {
    switch ($brainMode) {
        case 'peaceful': {
            return 1
        }
        case 'neutral': {
            return 0.2
        }
        case 'destructive': {
            return 0
        }
    }
})

export const cheeseMonsterCapacityPerUpgrade = derived(upgrades, $upgrades =>
    $upgrades.cheeseMonsterCapacityPerUpgrade.bought > 0 ? 0.1 * Math.pow($upgrades.cheeseMonsterCapacityPerUpgrade.bought + 10, 2) : 10
)
export const cheeseMonsterCapacity = derived(
    [upgrades, cheeseMonsterCapacityPerUpgrade],
    ([$upgrades, $cheeseMonsterCapacityPerUpgrade]) => $cheeseMonsterCapacityPerUpgrade * (1 + $upgrades.cheeseMonsterCapacity.bought)
)

/** per second */
export const cheeseMonsterSpawnrate = derived(
    [unlocked, upgrades],
    ([$unlocked, $upgrades]) => (+$unlocked.cheeseyard * $upgrades.cheeseMonsterSpawnrate.bought) / 6
)
export const cheeseMonsterDeathrate = derived(brainMode, $brainMode => ($brainMode === 'peaceful' ? 0 : $brainMode === 'neutral' ? 0.01 : 0.1))

export const cheeseMonsterDeathsPerSec = derived(
    [cheeseMonsterDeathrate, resource],
    ([$cheeseMonsterDeathrate, $resource]) => $cheeseMonsterDeathrate * $resource.cheeseMonster
)
export const cheeseMonsterMassacreMultiplier = derived([unlocked, cheeseMonsterDeathsPerSec], ([$unlocked, $cheeseMonsterDeathsPerSec]) =>
    $unlocked.cheeseMonsterMassacre ? 1 + Math.pow($cheeseMonsterDeathsPerSec, 1.3) : 1
)

export const cheeseMonsterLootAmount = derived(
    [upgrades, cheeseMonsterMassacreMultiplier],
    ([$upgrades, $cheeseMonsterMassacreMultiplier]) => (1 + $upgrades.cheeseMonsterLoot.bought) * $cheeseMonsterMassacreMultiplier
)
export const cheeseMonsterDropRate = derived(upgrades, $upgrades => 0.1 + 0.05 * $upgrades.cheeseMonsterDropRate.bought)

export const totalMonsterDeathsLootBoost = derived([unlocked, totalCheeseMonsterDeaths], ([$unlocked, $totalDeaths]) =>
    $unlocked.cheeseMonsterTotalDeathsBoost ? 1 + 1e-6 * $totalDeaths * $totalDeaths : 1
)

export const cheeseMonsterCollectiveSentienceMultiplier = derived([resource, unlocked], ([$resource, $unlocked]) =>
    $unlocked.cheeseMonsterCollectiveSentience ? 1 + 1e-6 * Math.pow($resource.cheeseMonster, 3) : 1
)

// how much each monster boosts thoughts/s (additive per monster)
export const monsterThoughtFactor = derived(upgrades, $upgrades => 1 + 1 * $upgrades.cheeseMonsterSentience.bought)

export const monsterThoughtMult = derived(
    [monsterThoughtFactor, resource, resourceFactorFromBrainMode, cheeseMonsterCollectiveSentienceMultiplier],
    ([$monsterThoughtFactor, $resource, $resourceFactorFromBrainMode, $cheeseMonsterCollectiveSentienceMultiplier]) =>
        1 + $monsterThoughtFactor * $cheeseMonsterCollectiveSentienceMultiplier * $resource.cheeseMonster * $resourceFactorFromBrainMode
)

export const monsterMoldyCheeseFactor = derived(upgrades, $upgrades => 0.01 * $upgrades.cheeseMonsterMoldiness.bought)

export const monsterMoldyCheeseMult = derived(
    [monsterMoldyCheeseFactor, resource, resourceFactorFromBrainMode],
    ([$monsterMoldyCheeseFactor, $resource, $resourceFactorFromBrainMode]) =>
        1 + $monsterMoldyCheeseFactor * $resource.cheeseMonster * $resourceFactorFromBrainMode
)
