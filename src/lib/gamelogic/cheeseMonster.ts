import { get } from 'svelte/store'
import {
  totalMonsterDeathsLootBoost,
  cheeseMonsterSpawnrate,
  cheeseMonsterDeathrate,
  cheeseMonsterCapacity,
  cheeseMonsterDropRate,
  cheeseMonsterLootAmount,
  totalCheeseMonsterDeaths,
  cheeseMonsterDeathsPerSec,
  approxCheeseBrainsPerSec,
  type Resources,
} from '$lib/store'

let accumulateSecond = 0

export function handleCheeseMonster(resource: Resources, deltaTimeSeconds: number): void {
  const cap = get(cheeseMonsterCapacity)
  if (resource.cheeseMonster < cap) {
    const births = get(cheeseMonsterSpawnrate) * deltaTimeSeconds
    resource.cheeseMonster += births
  } else resource.cheeseMonster = cap

  const deathsPerSec = get(cheeseMonsterDeathsPerSec)
  if (deathsPerSec > 0) {
    if (resource.cheeseMonster > 30) {
      // for many monsters, use the statistical average deathrate
      const deaths = deathsPerSec * deltaTimeSeconds
      resource.cheeseMonster -= deaths
      totalCheeseMonsterDeaths.update($total => $total + deaths)
      resource.cheeseBrains += get(approxCheeseBrainsPerSec) * deltaTimeSeconds
      // TODO: calculate loot on death(s)
    } else {
      // for just a few monsters, use random chance for deaths for variance
      accumulateSecond += deltaTimeSeconds
      if (accumulateSecond >= 1) {
        for (let i = 0; i < resource.cheeseMonster; i++) {
          if (Math.random() < get(cheeseMonsterDeathrate)) {
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

function calculateMonsterLootSingle(): number {
  if (Math.random() >= get(cheeseMonsterDropRate)) return 0
  return 1 * get(cheeseMonsterLootAmount) * get(totalMonsterDeathsLootBoost)
}
