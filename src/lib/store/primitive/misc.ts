import { makeStore } from '../customStore'

// SETTINGS (should not be reset when resetting the game)
export const isDarkMode = makeStore<boolean | 'notChecked'>('notChecked')
export type Notation = 'scientific' | 'default' | 'letters'
export const currentNotation = makeStore<Notation>('default')
export const totalTimePlayed = makeStore(0)

export const lastSaved = makeStore(Date.now())

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
export const totalMilkResets = makeStore(0)
