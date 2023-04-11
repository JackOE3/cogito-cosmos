import { derived } from 'svelte/store'
import { unlocked } from '../primitive/unlocks'
import { upgrades } from '../primitive/upgrades'
import { resource } from '../primitive/resources'
import { highestMilk } from '../primitive'

export const milkFromReset = derived(
  resource,
  $resource => 1e-5 * Math.pow($resource.thoughts, 0.25) * 1e-3 * Math.pow($resource.cheese, 0.5)
)

export const milkPowerPerSec = derived(highestMilk, $highestMilk => 1 * Math.pow($highestMilk, 2))

const upgradesToNextTier = [10, 10, 10, 10] as const
export const cummulativeUpgradesToTier = [
  upgradesToNextTier[0],
  upgradesToNextTier[0] + upgradesToNextTier[1],
  upgradesToNextTier[0] + upgradesToNextTier[1] + upgradesToNextTier[2],
  upgradesToNextTier[0] + upgradesToNextTier[1] + upgradesToNextTier[2] + upgradesToNextTier[3],
] as const

export const milkUpgradeTier = derived(upgrades, $upgrades => {
  console.log('milkUpgradeTier')
  const result: number[] = []
  let i = 0
  for (const upgradeBought of [
    $upgrades.milkThoughtsGain.bought,
    $upgrades.milkCheeseGain.bought,
    $upgrades.milkMoldyCheeseGain.bought,
    $upgrades.milkMonsterGain.bought,
  ]) {
    if (upgradeBought >= cummulativeUpgradesToTier[3]) result[i] = 5
    else if (upgradeBought >= cummulativeUpgradesToTier[2]) result[i] = 4
    else if (upgradeBought >= cummulativeUpgradesToTier[1]) result[i] = 3
    else if (upgradeBought >= cummulativeUpgradesToTier[0]) result[i] = 2
    else result[i] = 1
    i++
  }
  return result
})

const milkUpgradeEffectFactor = [2, 1.4, 1.2, 0.5]
export const milkUpgradeEffect = derived([milkUpgradeTier, upgrades], ([$milkUpgradeTier, $upgrades]) => {
  const result: number[] = []
  for (const [upgradeBought, i] of [
    $upgrades.milkThoughtsGain.bought,
    $upgrades.milkCheeseGain.bought,
    $upgrades.milkMoldyCheeseGain.bought,
    $upgrades.milkMonsterGain.bought,
  ].entries()) {
    if (i < 3) {
      result[i] = Math.pow(milkUpgradeEffectFactor[i], upgradeBought)
      result[i] *= Math.pow(5, $milkUpgradeTier[i] - 1)
    } else {
      result[i] = milkUpgradeEffectFactor[i] * upgradeBought
      result[i] *= Math.pow(2, $milkUpgradeTier[i] - 1)
    }
  }
  return result
})
