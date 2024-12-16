/**
 * only this state here will get saved and reset when you reset the game, everything else
 * is either transient (never gets saved) or derived from this
 */

export { resource } from './resources.svelte'

export { upgradeCount, upgradeCost } from './upgrades.svelte'

export { unlocked } from './unlocks.svelte'

export { milkBoostActive } from './boosts.svelte'

export * from './misc.svelte'

export { windowLocations } from './window.svelte'
