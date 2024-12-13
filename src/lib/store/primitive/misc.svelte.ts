import { makeState } from '../customStore.svelte'

// SETTINGS (should not be reset when resetting the game)
export const isDarkMode = makeState<boolean | 'notChecked'>('notChecked')
export type Notation = 'scientific' | 'default' | 'letters'
export const currentNotation = makeState<Notation>('default')
export const totalTimePlayed = makeState(0)

export const lastSaved = makeState(Date.now())

export type Mood = 'happy' | 'neutral' | 'sad'
export const mood = makeState<Mood>('happy')

export const currentThoughtBoost = makeState(1)
export const currentThoughtBoostTime = makeState(0)

export const currentCheeseQueue = makeState(0)
export const cheeseQueueActive = makeState(false)
export const cheeseQueueOverclockLvl = makeState(0)
export const cheeseQueueTotalCycles = makeState(0)
export type CheeseFactoryMode = 'meticulous' | 'nominal' | 'warpSpeed'
export const cheeseFactoryMode = makeState<CheeseFactoryMode>('nominal')

export const totalCheeseMonsterDeaths = makeState(0)
export type BrainMode = 'peaceful' | 'neutral' | 'destructive'
export const brainMode = makeState<BrainMode>('peaceful')

export const highestMilk = makeState(0)
export const totalMilkResets = makeState(0)
