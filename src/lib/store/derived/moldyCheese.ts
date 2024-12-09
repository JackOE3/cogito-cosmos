import { derived } from 'svelte/store'
// import { unlocked } from '../unlocks'
import { upgrades } from '../primitive/upgrades'
import { resource } from '../primitive/resources'

const moldyCheeseHalfLifeStartingValue = 10
export const moldyCheeseHalfLifeSeconds = derived(
  upgrades,
  $upgrades => moldyCheeseHalfLifeStartingValue + 10 * $upgrades.moldyCheeseHalfLife.bought
)
export const moldyCheeseChance = derived(upgrades, $upgrades => 0.1 + 0.1 * $upgrades.moldyCheeseChance.bought)

/* // softcap upgrade when exponent > 1? (currently at >323 bought)
export const mcConversionExponent = derived(upgrades, $upgrades => 0.1 + 0.05 * Math.sqrt($upgrades.moldyCheeseConversionExponent.bought + 1))

export const mcConversionAmount = derived([resource, mcConversionExponent],([$resource, $mcConversionExponent]) => Math.pow($resource.cheese, $mcConversionExponent) * $monsterMoldyCheeseMult)
// reactive so it is updated when conversionExponent changes
$: conversionAmount = (cheese: number): number => Math.pow(cheese, conversionExponent) * $monsterMoldyCheeseMult
$: manualConversionAmount = conversionAmount($resource.cheese) * ($unlocked.manualMoldyCheeseConversionBoost ? 10 : 1)

const moldyCheeseCycleDurationBoostExponent = 1.5
$: moldyCheeseCycleDurationBoostFactor = Math.pow($cheeseModeFactor.duration, moldyCheeseCycleDurationBoostExponent)
$: moldyCheeseHalflifeBoostFactor = 1 + 1e-6 * Math.pow($moldyCheeseHalfLifeSeconds, 3)

$: moldyCheeseByproductGain =
  $cheeseFactoryMode !== 'warpSpeed'
    ? conversionAmount($cheeseCycleBatchSize) *
      ($unlocked.moldyCheeseCycleDurationBoost ? moldyCheeseCycleDurationBoostFactor : 1) *
      ($unlocked.moldyCheeseHalflifeBoost ? moldyCheeseHalflifeBoostFactor : 1)
    : 0 */
