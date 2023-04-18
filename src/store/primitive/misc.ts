import { makeStore } from '../customStore'

export const ADMIN_MODE = makeStore(true)
export const LORCA_OVERRIDE = makeStore(false)
export const devToolsEnabled = makeStore(false)

export const isDarkMode = makeStore<boolean | 'notChecked'>('notChecked')

export const lastSaved = makeStore(Date.now())
export const totalTimePlayed = makeStore(0)

export const currentThoughtBoost = makeStore(1)
export const currentThoughtBoostTime = makeStore(0)

export const currentCheeseQueue = makeStore(0)
export const cheeseQueueActive = makeStore(false)
export const cheeseQueueOverclockLvl = makeStore(0)
export const cheeseQueueTotalCycles = makeStore(0)
export type CheeseFactoryMode = 'meticulous' | 'nominal' | 'warpSpeed'
export const cheeseFactoryMode = makeStore<CheeseFactoryMode>('nominal')

export const totalCheeseMonsterDeaths = makeStore(0)
export type BrainMode = 'peaceful' | 'neutral' | 'destructive'
export const brainMode = makeStore<BrainMode>('peaceful')

export const highestMilk = makeStore(0)
