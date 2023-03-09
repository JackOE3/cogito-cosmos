import { makeStore } from './customStore'

console.log('mainStore.ts')

export const LORCA_OVERRIDE = makeStore(true)
export const devToolsEnabled = makeStore(true)

export const lastSaved = makeStore(Date.now())

export { resource } from './resources'

export { upgrades } from './upgrades'

export { unlocked } from './unlocks'

export const currentThoughtBoost = makeStore(1)

export const currentCheeseQueue = makeStore(0)
export const cheeseQueueTotalCycles = makeStore(0)
export type CheeseFactoryMode = 'meticulous' | 'nominal' | 'warpSpeed'
export const cheeseFactoryMode = makeStore<CheeseFactoryMode>('nominal')

export const totalCheeseMonsterDeaths = makeStore(0)
export type BrainMode = 'peaceful' | 'neutral' | 'destructive'
export const brainMode = makeStore<BrainMode>('peaceful')
