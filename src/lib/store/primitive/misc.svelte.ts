import { makeState } from '../customStore.svelte'

// SETTINGS (should not be reset when resetting the game)
export const isDarkMode = makeState<boolean | 'notChecked'>('notChecked')
export type Notation = 'scientific' | 'default' | 'letters'
export const currentNotation = makeState<Notation>('default')
export const totalTimePlayed = makeState(0)

export const lastSaved = makeState(Date.now())

/**
 * Your current stage of Enlightenment
 */
export const enlightenmentStage = makeState(1)

/**
 * Your current substage within the current stage of Enlightenment
 */
export const enlightenmentSubstage = makeState(1)

export type Mood = 'happy' | 'neutral' | 'sad'
/**
 * Your current mood
 */
export const mood = makeState<Mood>('happy')

/**
 * Your current health. Between 0 and 1.
 */
export const health = makeState(1)

/**
 * Your current multiplier from the Thought Boost
 */
export const currentThoughtBoost = makeState(1)
/**
 * The amount of time your current Thought Boost is still active
 */
export const currentThoughtBoostTime = makeState(0)

/**
 * The current (remaining) length of the Cheese Queue
 */
export const currentCheeseQueue = makeState(0)
export const cheeseQueueActive = makeState(false)
export const cheeseQueueOverclockLvl = makeState(0)
/**
 * The total amount of cycles the Cheese Queue has completed
 */
export const cheeseQueueTotalCycles = makeState(0)
export type CheeseFactoryMode = 'meticulous' | 'nominal' | 'warpSpeed'
export const cheeseFactoryMode = makeState<CheeseFactoryMode>('nominal')
export const cheeseWorkerHappiness = makeState(1)

export const totalCheeseMonsterDeaths = makeState(0)
export type BrainMode = 'peaceful' | 'neutral' | 'destructive'
export const brainMode = makeState<BrainMode>('peaceful')

export const highestMilk = makeState(0)
export const totalMilkResets = makeState(0)

const generatorTypes = ['T', 'K', 'I'] as const
const generatorTiers = [1, 2] as const

type GeneratorType = (typeof generatorTypes)[number] // "T" | "K" | "I"
type GeneratorTier = (typeof generatorTiers)[number] // 1 | 2
// Create a type for all combinations
export type GeneratorName = `${GeneratorType}${GeneratorTier}`

export type Generator = { lvl: number; exp: number; unlocked: boolean; active: boolean }

// Generate all combinations
const generatorNames = generatorTiers.flatMap(tier => generatorTypes.map(type => `${type}${tier}`))

export const generators = makeState(
    Object.fromEntries(
        generatorNames.map(name => [
            name,
            {
                lvl: 0,
                exp: 0,
                unlocked: false,
                active: false
            }
        ])
    ) as Record<GeneratorName, Generator>
)
