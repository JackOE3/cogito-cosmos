import type { Tween } from 'svelte/motion'
import { makeState } from '../customStore.svelte'
import { uuidv4 } from '$lib/gamelogic/utils'

// SETTINGS (should not be reset when resetting the game)
export const isDarkMode = makeState<boolean | 'notChecked'>('notChecked')
export type Notation = 'scientific' | 'default' | 'letters'
export const currentNotation = makeState<Notation>('default')
export const totalTimePlayed = makeState(0)

export const lastSaved = makeState(Date.now())

//---------------------------------------------------

export const level = makeState(1)

export type GeneratorResource = 'red' | 'green' | 'blue'

type Content = {
    readonly type: string
}

export interface Empty extends Content {
    readonly type: 'empty'
}

export interface Locked extends Content {
    readonly type: 'locked'
    cost: number
    resource: GeneratorResource
}

export interface Combat extends Content {
    readonly type: 'combat'
    HP: number
    maxHP: number
    active: boolean
    intervalId: number
    progress: Tween<number>
    defeated: boolean
}

export type Multiplier = {
    readonly id: string
    value: number
}

/**
 * This represents a numeric values which can be modified by multipliers from dynamic effects in the game. `base` is the starting value, and `current` is the dynamic value with all applied `multipliers`.
 */
export type Metric = {
    /**
     * Intrinstic (unmodified) value of this metric.
     */
    base: number
    /**
     * Base value with multipliers from external sources applied on top. (eg other cells)
     */
    current: number
    /**
     * Current value with a multiplicity applied on top (eg. level of a generator or count of upgrade)
     */
    currentCumulative?: number
    multipliers: Multiplier[]
}
export type ResourceMetric = Metric & {
    resource: GeneratorResource
}

export type Stencil =
    | 'adjacent'
    | '3x3'
    | '5x5'
    | 'row'
    | 'column'
    | 'diagonals'
    | 'all'
    | 'upperHalf'
    | 'lowerHalf'
    | 'leftHalf'
    | 'rightHalf'
    | 'lowerLeftQuadrant'
    | 'lowerRightQuadrant'
    | 'upperLeftQuadrant'
    | 'upperRightQuadrant'

/**
 * Effects for a generator
 */
export type EffectGenerator = 'boostGeneratorGain' | 'boostGeneratorSpeed' | 'decreaseGeneratorCost'

/**
 * Effects for a skill
 */
export type EffectSkill = 'boostSkillExpGain' | 'decreaseSkillExpRequirement' | 'boostSkillEffect'

/**
 * Effects for an upgrade
 */
export type EffectUpgrade = 'decreaseUpgradeCost' | 'boostUpgradeEffect'

export type EffectSpecial = 'increaseAreaOfEffect'

export type EffectType = EffectGenerator | EffectSkill | EffectUpgrade

export type EffectTier = 1 | 2 | 3

/**
 * Helper type to contrain the possible effect types for every tier.
 */
export type EffectWithTier =
    | {
          tier: 1
          type: EffectGenerator
      }
    | {
          tier: 2
          type: EffectSkill | EffectUpgrade
      }
    | {
          tier: 3
          type: EffectSkill | EffectUpgrade
      }

export type Formula = 'additive' | 'multiplicative'

export interface CellEffect {
    type: EffectType
    tier: EffectTier
    stencil: Stencil
    value: Metric
    formula: Formula
}

export interface ResourceGenerator extends Content {
    readonly type: 'generator'
    gain: ResourceMetric
    cost?: ResourceMetric
    readonly baseDurationMillis: number
    speed: Metric
    active: boolean
    progress: number
}

export interface Skill extends Content {
    readonly type: 'skill'
    effect: CellEffect
    cost?: ResourceMetric
    level: number
    currentExp: number
    requiredExp: Metric
    expPerSec: Metric
    active: boolean
    progress: number
}

export interface Upgrade extends Content {
    readonly type: 'upgrade'
    effect: CellEffect
    //title: string
    description?: string[]
    cost: ResourceMetric
    costMultiplier: number
    count: number
    maxBuy?: number
}

export type CellContent = Empty | ResourceGenerator | Skill | Upgrade | Locked | Combat

export type Coordinate = {
    row: number
    col: number
}
export type Cell = {
    readonly id: string
    coord: Coordinate
    hidden: boolean
    content: CellContent
    dependencies: string[]
    relX: number
    relY: number
    highlighted: false | 'affected' | 'notAffected'
}

export const N_ROWS = makeState(9)
export const N_COLS = makeState(9)

const gridCellInitial: Cell[][] = []

{
    for (let i = 0; i < N_ROWS.value; i++) {
        const row: Cell[] = []
        for (let j = 0; j < N_COLS.value; j++) {
            row.push({
                id: uuidv4(),
                coord: { row: i, col: j },
                hidden: true,
                content: { type: 'empty' },
                dependencies: [],
                relX: 0,
                relY: 0,
                highlighted: false
            })
        }
        gridCellInitial.push(row)
    }
    const centerRow = Math.floor(N_ROWS.value / 2)
    const centerCol = Math.floor(N_COLS.value / 2)

    gridCellInitial[centerRow][centerCol].hidden = false
    gridCellInitial[centerRow][centerCol].content = {
        type: 'locked',
        cost: 0,
        resource: 'green'
    }
}

export const gridCell = makeState<Cell[][]>(gridCellInitial)

export type CellShopItem = {
    cost: ResourceMetric
    costMultiplier: number
    count: number
}
export const cellShopItems = makeState<CellShopItem[]>([
    {
        cost: {
            base: 10,
            current: 10,
            resource: 'red',
            multipliers: []
        },
        costMultiplier: 4,
        count: 0
    },
    {
        cost: {
            base: 10,
            current: 10,
            resource: 'green',
            multipliers: []
        },
        costMultiplier: 4,
        count: 0
    },
    {
        cost: {
            base: 10,
            current: 10,
            resource: 'blue',
            multipliers: []
        },
        costMultiplier: 4,
        count: 0
    }
])

export const showStencilHighlight = makeState(true)

/**
 * The maximum number of actions points you have available.
 */
export const maxActionPoints = makeState(3)

export const selectionCellIds = makeState<string[]>([])
export const nextCellContent = makeState<CellContent | null>(null)
export const cellSelectionActive = makeState(false)

// COGITO COSMOS:
//------------------------------------------------------------------
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

export type GeneratorOld = { lvl: number; exp: number; unlocked: boolean; active: boolean }

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
    ) as Record<GeneratorName, GeneratorOld>
)
