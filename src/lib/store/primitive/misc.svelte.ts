import type { Tween } from 'svelte/motion'
import { makeState } from '../customStore.svelte'
import type { IUpgrade } from './upgrades.svelte'

// SETTINGS (should not be reset when resetting the game)
export const isDarkMode = makeState<boolean | 'notChecked'>('notChecked')
export type Notation = 'scientific' | 'default' | 'letters'
export const currentNotation = makeState<Notation>('default')
export const totalTimePlayed = makeState(0)

export const lastSaved = makeState(Date.now())

export const level = makeState(1)

export type GeneratorResource = 'red' | 'green' | 'blue'

type ContentI = {
    type: string
}

export interface EmptyI extends ContentI {
    type: 'empty'
}

export interface LockedI extends ContentI {
    type: 'locked'
    cost: number
    resource: GeneratorResource
}

export interface CombatI extends ContentI {
    type: 'combat'
    HP: number
    maxHP: number
    active: boolean
    intervalId: number
    progress: Tween<number>
    defeated: boolean
}

export type Multiplier = {
    id: string
    value: number
}
export type ResourceMetric = {
    base: number
    current: number
    multipliers: Multiplier[]
    resource: GeneratorResource
}

export interface GeneratorI extends ContentI {
    readonly type: 'generator'
    gain: ResourceMetric
    cost?: ResourceMetric
    readonly baseDurationMillis: number
    speed: {
        base: number
        current: number
        multipliers: Multiplier[]
    }
    active: boolean
    progress: number
}

export type DerivativeEffect = 'boostGeneratorGain' | 'boostGeneratorSpeed'
export type Stencil = 'adjacent' | '3x3'
export interface GeneratorDerivativeI extends ContentI {
    readonly type: 'generatorDerivative'
    id: string
    effect: DerivativeEffect
    stencil: Stencil
    cost?: ResourceMetric
    level: number
    boost: number
    currentExp: number
    requiredExp: number
    expPerSec: number
    active: boolean
    progress: number
}

export type UpgradeType = 'addAttack' | 'multAttack' | 'addGeneratorGain' | 'addGeneratorSpeed'
export interface UpgradeBaseI extends ContentI {
    type: 'upgrade'
    id: string
    upgradeType: UpgradeType
    title: string
    description?: string[]
    cost: number
    resource: GeneratorResource
    costMultiplier: number
    count: number
    maxBuy?: number
}
// Specific types for each `upgradeType` with required additional properties
export interface GeneratorGainUpgrade extends UpgradeBaseI {
    upgradeType: 'addGeneratorGain'
    forGeneratorResource: GeneratorResource
    addGain: number
}
export interface GeneratorSpeedUpgrade extends UpgradeBaseI {
    upgradeType: 'addGeneratorSpeed'
    forGeneratorResource: GeneratorResource
    addSpeed: number
}
export interface AddAttackUpgrade extends UpgradeBaseI {
    upgradeType: 'addAttack'
    addAttack: number
}
export interface MultAttackUpgrade extends UpgradeBaseI {
    upgradeType: 'multAttack'
    multAttack: number
}

export type UpgradeI = GeneratorGainUpgrade | GeneratorSpeedUpgrade | AddAttackUpgrade | MultAttackUpgrade

export type CellContent = EmptyI | LockedI | CombatI | GeneratorI | GeneratorDerivativeI | UpgradeI

export type Location = {
    row: number
    col: number
}
export type Cell = {
    id: string
    location: Location
    hidden: boolean
    content: CellContent
    relX: number
    relY: number
}
export const N_ROWS = 9
export const N_COLS = 9
export const gridCell = makeState<Cell[][]>(Array.from({ length: N_ROWS }, () => new Array(N_COLS).fill(undefined)))

//--------------------------------------------------------
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
