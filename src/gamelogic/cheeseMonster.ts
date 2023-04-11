import { get } from 'svelte/store'
import type { Resource } from '@store'
import {
  totalMonsterDeathsLootBoost,
  cheeseMonsterSpawnrate,
  cheeseMonsterDeathrate,
  cheeseMonsterCapacity,
  cheeseMonsterDropRate,
  cheeseMonsterLootAmount,
} from '@store'
import { totalCheeseMonsterDeaths } from '@store'

console.log('cheeseMonster.ts')

let accumulateSecond = 0

export function handleCheeseMonster(resource: Resource, deltaTimeSeconds: number): void {
  const cap = get(cheeseMonsterCapacity)
  if (resource.cheeseMonster < cap) {
    const births = get(cheeseMonsterSpawnrate) * deltaTimeSeconds
    resource.cheeseMonster += births
  } else resource.cheeseMonster = cap

  const deathrate = get(cheeseMonsterDeathrate)
  if (deathrate > 0 && resource.cheeseMonster > 0) {
    if (resource.cheeseMonster > 30) {
      // for many monsters, use the statistical average deathrate
      const deaths = resource.cheeseMonster * deathrate * deltaTimeSeconds
      resource.cheeseMonster -= deaths
      totalCheeseMonsterDeaths.update($total => $total + deaths)
      resource.cheeseBrains += calculateMonsterLoot(deaths)
      // TODO: calculate loot on death(s)
    } else {
      // for just a few monsters, use random chance for deaths for variance
      accumulateSecond += deltaTimeSeconds
      if (accumulateSecond >= 1) {
        for (let i = 0; i < resource.cheeseMonster; i++) {
          if (Math.random() < deathrate) {
            resource.cheeseMonster--
            // TODO: calculate loot on death
            totalCheeseMonsterDeaths.update($total => $total + 1)
            resource.cheeseBrains += calculateMonsterLootSingle()
          }
        }
        accumulateSecond = 0
      }
    }
  }
}

function calculateMonsterLoot(deaths: number): number {
  return deaths * get(cheeseMonsterLootAmount) * get(cheeseMonsterDropRate) * get(totalMonsterDeathsLootBoost)
}
function calculateMonsterLootSingle(): number {
  if (Math.random() >= get(cheeseMonsterDropRate)) return 0
  return 1 * get(cheeseMonsterLootAmount) * get(totalMonsterDeathsLootBoost)
}
