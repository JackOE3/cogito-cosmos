import { derived } from 'svelte/store'
// import { unlocked } from '../unlocks'
import { upgrades } from '../upgrades'

const moldyCheeseHalfLifeStartingValue = 10
export const moldyCheeseHalfLifeSeconds = derived(
  upgrades,
  $upgrades => moldyCheeseHalfLifeStartingValue + 10 * $upgrades.moldyCheeseHalfLife.bought
)
export const moldyCheeseChance = derived(upgrades, $upgrades => 0.1 + 0.1 * $upgrades.moldyCheeseChance.bought)
