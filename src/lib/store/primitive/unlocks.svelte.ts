import { makeState } from '../customStore.svelte'
import type { ResourceType } from './resources.svelte'

export enum UnlockName {
    // Thoughts
    START = 'start',
    THINK_PASSIVELY = 'thinkPassively',
    THINK_FASTER = 'thinkFaster',
    NEUTRAL_MOOD = 'neutralMood',
    THOUGHT_BOOST = 'thoughtBoost',
    THOUGHTS_50_PERCENT = 'thoughts50Percent',
    SWITZERLAND = 'switzerland',
    THOUGHT_BOOST_STACK = 'thoughtBoostStack',
    MOLDY_CHEESE = 'moldyCheese',
    MILK = 'milk',
    MILK_TREE = 'milkTree',
    // Knowledge
    PONDER_PASSIVELY = 'ponderPassively',
    SAD_MOOD = 'sadMood',
    // Cheese
    CHEESE_QUEUE = 'cheeseQueue',
    CHEESE_QUEUE_OVERCLOCKING = 'cheeseQueueOverclocking',
    CHEESE_QUEUE_LENGTH_BOOST = 'cheeseQueueLengthBoost',
    CHEESE_BOOST = 'cheeseBoost',
    CHEESE_QUEUE_COST_DIVIDE = 'cheeseQueueCostDivide',
    CHEESE_CYCLE_ACCELERATOR = 'cheeseCycleAccelerator',
    THOUGHT_JERK = 'thoughtJerk',
    CHEESE_MODES = 'cheeseModes',
    CHEESE_CYCLES_BOOST_THOUGHTS = 'cheeseCyclesBoostThoughts',
    // Moldy Cheese
    MOLDY_CHEESE_BYPRODUCT = 'moldyCheeseByproduct',
    CHEESEYARD = 'cheeseyard',
    MANUAL_MOLDY_CHEESE_CONVERSION_BOOST = 'manualMoldyCheeseConversionBoost',
    CHEESEYARD_MOLD_UPGRADE = 'cheeseyardMoldUpgrade',
    MOLDY_CHEESE_CYCLE_DURATION_BOOST = 'moldyCheeseCycleDurationBoost',
    MOLDY_CHEESE_HALFLIFE_BOOST = 'moldyCheeseHalflifeBoost',
    // Cheeseyard
    MONSTER_BRAIN_WAVE_CONTROLLER = 'monsterBrainWaveController',
    CHEESE_MONSTER_MASSACRE = 'cheeseMonsterMassacre',
    CHEESE_MONSTER_COLLECTIVE_SENTIENCE = 'cheeseMonsterCollectiveSentience',
    CHEESE_MONSTER_TOTAL_DEATHS_BOOST = 'cheeseMonsterTotalDeathsBoost',
    // Milk
    BACTERIA = 'bacteria',

    // Milk upgrade effects
    STACKS_INCREASE_THOUGHT_BOOST_STRENGTH = 'stacksIncreaseThoughtBoostStrength',

    // Milk reset milestones
    BUY_MAX_UPGRADES = 'buyMaxUpgrades',
    AUTO_BUY_UPGRADES = 'autoBuyUpgrades',
    AUTO_OVERCLOCKING = 'autoOverclocking',
    PERSISTENT_DEATHS_AND_CYCLES = 'persistentDeathsAndCycles',
    AUTO_BUY_ADVANCEMENTS = 'autoBuyAdvancements',
    ADVANCEMENTS_ALREADY_UNLOCKED = 'advancementsAlreadyUnlocked',
    INFINITE_CHEESE_QUEUE = 'infiniteCheeseQueue',
    FREE_CHEESE_SACRIFICES = 'freeCheeseSacrifices',
    AUTO_CHEESE_SACRIFICES = 'autoCheeseSacrifices',
    AUTO_MONSTER_BRAIN_WAVE_CONTROLLER = 'autoMonsterBrainWaveController',
    AUTO_CHEESE_MODES = 'autoCheeseModes',
    FREE_PRE_MILK_UPGRADES = 'freePreMilkUpgrades'
}

export type UnlockType = 'Unlock' | 'Mechanic' | 'Boost' | 'Effect'
export interface IUnlock {
    name: UnlockName
    title: string
    description: string
    tooltipText: string
    cost: number
    resource: ResourceType
    type: UnlockType
    availableAt?: UnlockName
}

export const unlocks: { [key in ResourceType]: IUnlock[] } = {
    // Cogito Ergo Sum
    thoughts: [
        {
            name: UnlockName.THINK_PASSIVELY,
            title: 'Learn to think',
            description: 'You think <strong>once</strong> per second.',
            tooltipText: '"I think, therefore I am."',
            cost: 10,
            resource: 'thoughts',
            type: 'Effect'
        },
        {
            name: UnlockName.THINK_FASTER,
            title: 'Accelerate your thinking',
            description: 'Unlock the upgrade <strong>Thought Acceleration</strong>',
            tooltipText: 'Really makes you think...',
            cost: 30,
            resource: 'thoughts',
            type: 'Unlock',
            availableAt: UnlockName.THINK_PASSIVELY
        },
        {
            name: UnlockName.NEUTRAL_MOOD,
            title: 'True Neutral',
            description: 'Let go of all earthly desires and transcend emotions. You can enter into a neutral mood.',
            tooltipText: 'TBD',
            cost: 100,
            resource: 'thoughts',
            type: 'Mechanic',
            availableAt: UnlockName.THINK_PASSIVELY
        },
        {
            name: UnlockName.THOUGHTS_50_PERCENT,
            title: 'Simple Maths',
            description: 'Your thinking is boosted by 50%.',
            tooltipText: '"If you no longer go for a production multiplier that exists, you\'re no longer an incrementalist."',
            cost: 500,
            resource: 'thoughts',
            type: 'Boost',
            availableAt: UnlockName.THINK_PASSIVELY
        },
        {
            name: UnlockName.SWITZERLAND,
            title: 'Travel to Switzerland',
            description: 'You can start producing <strong style="color:yellow">Cheese</strong>.',
            tooltipText: 'The land of cheese',
            cost: 3000,
            resource: 'thoughts',
            type: 'Unlock',
            availableAt: UnlockName.THINK_PASSIVELY
        },
        {
            name: UnlockName.MOLDY_CHEESE,
            title: 'Derivative Cheese',
            description:
                'You can convert <strong style="color:yellow">Cheese</strong> into <strong style="color:rgb(60, 255, 0)">Moldy Cheese</strong>, if you think it tastes better.',
            tooltipText: 'Is it okay to eat?',
            cost: 100e9,
            resource: 'thoughts',
            type: 'Unlock',
            availableAt: UnlockName.CHEESE_QUEUE
        },
        {
            name: UnlockName.MILK,
            title: 'Prestige?',
            description:
                'You can trade your progress so far for a glass of calcium-rich <strong>Milk</strong>. Buying this will NOT reset your progress, but only unlock the next layer.',
            tooltipText: 'From cheese you get milk...I think.',
            cost: 1e22,
            resource: 'thoughts',
            type: 'Unlock',
            availableAt: UnlockName.THOUGHT_JERK
        }
    ],
    knowledge: [
        {
            name: UnlockName.PONDER_PASSIVELY,
            title: 'Deeper Learning',
            description: 'You acquire <strong style="color:lightblue">Knowledge</strong> passively at a reduced rate while in a neutral mood. ',
            tooltipText: 'TBD',
            cost: 3,
            resource: 'knowledge',
            type: 'Effect',
            availableAt: UnlockName.NEUTRAL_MOOD
        },
        {
            name: UnlockName.SAD_MOOD,
            title: 'Sadge',
            description: 'TBD',
            tooltipText: 'TBD',
            cost: 1e3,
            resource: 'knowledge',
            type: 'Mechanic',
            availableAt: UnlockName.NEUTRAL_MOOD
        },
        {
            name: UnlockName.THOUGHT_BOOST,
            title: 'Boost your thinking',
            description: 'Instead of thinking once when you click, you gain a production multiplier temporarily.',
            tooltipText: '"I dont want to spam click a gazillion times to play ur game"',
            cost: 50,
            resource: 'knowledge',
            type: 'Mechanic',
            availableAt: UnlockName.THINK_PASSIVELY
        },
        {
            name: UnlockName.THOUGHT_BOOST_STACK,
            title: 'Extended Focus',
            description: 'Gain the ability to stack Thought Boosts.',
            tooltipText: 'Viagra for the brain',
            cost: 1e6,
            resource: 'knowledge',
            type: 'Mechanic',
            availableAt: UnlockName.CHEESE_QUEUE
        }
    ],
    insight: [],

    // Switzerland Simulator
    cheese: [
        {
            name: UnlockName.CHEESE_QUEUE,
            title: 'Cheese Queue',
            description: 'You can queue up the production of <strong style="color:yellow">Cheese</strong>.',
            tooltipText: 'Cheese-o-mation lets you cheese clicking a button.',
            cost: 8,
            resource: 'cheese',
            type: 'Mechanic'
        },
        {
            name: UnlockName.CHEESE_QUEUE_OVERCLOCKING,
            title: 'Cheese Overclocking',
            description: 'You can increase the speed of your workers producing cheese by forcing them to think faster.',
            tooltipText: 'Thinking about how to cheese faster...',
            cost: 50,
            resource: 'cheese',
            type: 'Mechanic'
        },
        {
            name: UnlockName.CHEESE_QUEUE_LENGTH_BOOST,
            title: 'Length Boost',
            description: 'The capacity of the Cheese Queue boosts cheese production.',
            tooltipText: 'Give your employees more work like a good boss.',
            cost: 500,
            resource: 'cheese',
            type: 'Effect',
            availableAt: UnlockName.CHEESE_QUEUE
        },
        {
            name: UnlockName.CHEESE_BOOST,
            title: 'Cheese Boost',
            description: 'Thought Boost also affects cheese production.',
            tooltipText: 'If you think hard enough, you can create cheese out of nothing.',
            cost: 50_000,
            resource: 'cheese',
            type: 'Effect',
            availableAt: UnlockName.CHEESE_QUEUE
        },
        {
            name: UnlockName.CHEESE_QUEUE_COST_DIVIDE,
            title: 'Cheepse',
            description: 'Unlock an additional upgrade to make cheese production more cost-efficient.',
            tooltipText: 'How much does a thought weigh?',
            cost: 1e6,
            resource: 'cheese',
            type: 'Unlock',
            availableAt: UnlockName.CHEESE_QUEUE
        },
        {
            name: UnlockName.CHEESE_CYCLE_ACCELERATOR,
            title: 'Experience is key',
            description: 'Cheese production speeds up based on the amount of cheese cycles completed.',
            tooltipText: 'The mastery of cheese, a very important life skill to have.',
            cost: 5e6,
            resource: 'cheese',
            type: 'Effect',
            availableAt: UnlockName.CHEESE_QUEUE_LENGTH_BOOST
        },
        {
            name: UnlockName.THOUGHT_JERK,
            title: 'More to think about',
            description: 'Jerk(?) your thinking.',
            tooltipText: 'something something per second cubed',
            cost: 3e7,
            resource: 'cheese',
            type: 'Unlock',
            availableAt: UnlockName.CHEESE_QUEUE_LENGTH_BOOST
        },
        {
            name: UnlockName.CHEESE_MODES,
            title: 'Cheese Factory Protocol',
            description: 'Gain access to 3 modes to help manage your cheese production',
            tooltipText: 'Micromanaging your employees will lead to universal happiness.',
            cost: 5e7,
            resource: 'cheese',
            type: 'Mechanic',
            availableAt: UnlockName.CHEESE_QUEUE_LENGTH_BOOST
        },
        {
            name: UnlockName.CHEESE_CYCLES_BOOST_THOUGHTS,
            title: 'Return on Investment',
            description: 'Total cheese cycles give a boost (multiplier) to your thinking.',
            tooltipText: 'I like cycling. My favorite is cheese.',
            cost: 1e8,
            resource: 'cheese',
            type: 'Effect',
            availableAt: UnlockName.CHEESE_CYCLE_ACCELERATOR
        }
    ],

    // Moldy Cheese
    moldyCheese: [
        {
            name: UnlockName.MOLDY_CHEESE_BYPRODUCT,
            title: 'Moldomation',
            description: 'Sometimes the cheese factory will produce moldy cheese as a byproduct.',
            tooltipText: 'Is this good... or bad?',
            cost: 100,
            resource: 'moldyCheese',
            type: 'Effect'
        },
        {
            name: UnlockName.CHEESEYARD,
            title: 'End Times',
            description: 'Construct the <strong style="color:crimson">Cheeseyard</strong>, a place where abominations made of cheese reside.',
            tooltipText: 'What happens after cheese dies?',
            cost: 2000,
            resource: 'moldyCheese',
            type: 'Unlock'
        },
        {
            name: UnlockName.MANUAL_MOLDY_CHEESE_CONVERSION_BOOST,
            title: 'Passiveness',
            description: 'Cheese sacrifice produces 10x more moldy cheese, but its cooldown is also increased by 10x.',
            tooltipText: 'Mr. Gorgonzola loves penicillium roqueforti, but proper love-making needs time.',
            cost: 4000,
            resource: 'moldyCheese',
            type: 'Boost'
        },
        {
            name: UnlockName.CHEESEYARD_MOLD_UPGRADE,
            title: 'Em(b)olden',
            description: 'Your cheese monsters can get moldy. <br> Unlock an additional upgrade in the Cheeseyard.',
            tooltipText: 'This smells...',
            cost: 8000,
            resource: 'moldyCheese',
            type: 'Unlock',
            availableAt: UnlockName.MONSTER_BRAIN_WAVE_CONTROLLER
        },
        {
            name: UnlockName.MOLDY_CHEESE_CYCLE_DURATION_BOOST,
            title: 'Slow and Steady',
            description: 'Moldy cheese byproduct gain is boosted by the relative duration of the cheese cycle (which depends on the cheese factory protocol).',
            tooltipText: 'The most meticulously crafted cheese is the moldiest.',
            cost: 16000,
            resource: 'moldyCheese',
            type: 'Effect',
            availableAt: UnlockName.MONSTER_BRAIN_WAVE_CONTROLLER
        },
        {
            name: UnlockName.MOLDY_CHEESE_HALFLIFE_BOOST,
            title: 'Half-important Upgrade',
            description: 'Cheese gain is additionally boosted by MC half-life.',
            tooltipText: 'How much are 2 half-lives? They drop your braincells by 75%.',
            cost: 1e6,
            resource: 'moldyCheese',
            type: 'Effect',
            availableAt: UnlockName.CHEESEYARD_MOLD_UPGRADE
        }
    ],

    // The Cheeseyard
    cheeseBrains: [
        {
            name: UnlockName.CHEESE_MONSTER_MASSACRE,
            title: 'No Morals',
            description: 'When killing many cheese monsters at once, the loot is massively boosted.',
            tooltipText: 'Rewarding genocide! <br /> (only applies in this game and NOT in real life)',
            cost: 200,
            resource: 'cheeseBrains',
            type: 'Mechanic'
        },
        {
            name: UnlockName.CHEESE_MONSTER_COLLECTIVE_SENTIENCE,
            title: 'Collective Sentience',
            description: 'Bigger populations give a (much) bigger global boost to thinking due to emergence.',
            tooltipText: 'Completely harmless.',
            cost: 1e5,
            resource: 'cheeseBrains',
            type: 'Effect'
        },
        {
            name: UnlockName.CHEESE_MONSTER_TOTAL_DEATHS_BOOST,
            title: 'Mass Murder',
            description: 'Total cheese monster deaths boost dropped monster loot.',
            tooltipText: 'You have to perfect the art of killing to extract the most out of corpses.',
            cost: 1e6,
            resource: 'cheeseBrains',
            type: 'Effect'
        }
    ],

    milk: [
        {
            name: UnlockName.BACTERIA,
            title: 'Escherichia coli',
            description: 'You can infest your milk reserves with bacteria.',
            tooltipText: 'No Description yet.',
            cost: 1e6,
            resource: 'milk',
            type: 'Unlock'
        },
        {
            name: UnlockName.BACTERIA,
            title: 'Escherichia coli',
            description: 'You can infest your milk reserves with bacteria.',
            tooltipText: 'No Description yet.',
            cost: 1e6,
            resource: 'milk',
            type: 'Unlock'
        }
    ]
}

export const unlockedInitial = convertEnumToFlagObject(UnlockName)
export const unlocked = makeState(unlockedInitial)

function convertEnumToFlagObject(enumme: typeof UnlockName): Record<UnlockName, boolean> {
    const obj = Object.values(enumme)
    const result: { [key: string]: boolean } = {}
    obj.forEach(value => {
        if (value === enumme.START) result[value] = true
        else result[value] = false
    })

    return result as Record<UnlockName, boolean>
}
// console.log('ENUM ', Object.values(UnlockName), convertEnumToUnlockedObject(UnlockName))
