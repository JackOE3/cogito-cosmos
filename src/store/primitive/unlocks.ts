import { makeStore } from '../customStore'

console.log('unlocks.ts')

export enum UnlockName {
  // Thoughts
  START = 'start',
  THINK_PASSIVELY = 'thinkPassively',
  THINK_FASTER = 'thinkFaster',
  THOUGHT_BOOST = 'thoughtBoost',
  THOUGHTS_50_PERCENT = 'thoughts50Percent',
  SWITZERLAND = 'switzerland',
  THOUGHT_BOOST_STACK = 'thoughtBoostStack',
  MOLDY_CHEESE = 'moldyCheese',
  MILK = 'milk',
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
}

export type unlockType = 'Unlock' | 'Mechanic' | 'Boost' | 'Affix'
export interface IUnlock {
  name: UnlockName
  type: unlockType
  resource: string
  cost: number
  title: string
  description: string
  tooltipText?: string
  availableAt?: UnlockName
}

export const unlocks: Record<string, IUnlock[]> = {
  // Cogito Ergo Sum
  thoughts: [
    {
      name: UnlockName.THINK_PASSIVELY,
      type: 'Boost',
      resource: 'thoughts',
      cost: 10,
      title: 'Learn to think',
      description: 'You think <strong>once</strong> per second.',
      tooltipText: '"I think, therefore I am."',
    },
    {
      name: UnlockName.THINK_FASTER,
      type: 'Unlock',
      resource: 'thoughts',
      cost: 30,
      title: 'Accelerate your thinking',
      description: 'Unlock the upgrade <strong>Thought Acceleration</strong>',
      tooltipText: 'Really makes you think...',
      availableAt: UnlockName.THINK_PASSIVELY,
    },
    {
      name: UnlockName.THOUGHT_BOOST,
      type: 'Mechanic',
      resource: 'thoughts',
      cost: 50,
      title: 'Boost your thinking',
      description: 'Instead of thinking once when you click, you gain a production multiplier temporarily.',
      tooltipText:
        '"i dont want to spam click a gazillion times to play ur stupid game" <br> <strong>- HentaiEnjoyer1978',
      availableAt: UnlockName.THINK_PASSIVELY,
    },
    {
      name: UnlockName.THOUGHTS_50_PERCENT,
      type: 'Boost',
      resource: 'thoughts',
      cost: 500,
      title: 'Simple Maths',
      description: 'Your thinking is boosted by 50%.',
      tooltipText:
        '"If you no longer go for a production multiplier that exists, you\'re no longer an incrementalist."',
      availableAt: UnlockName.THINK_PASSIVELY,
    },
    {
      name: UnlockName.SWITZERLAND,
      type: 'Unlock',
      resource: 'thoughts',
      cost: 3000,
      title: 'Travel to Switzerland',
      description: 'You can start producing <strong style="color:yellow">Cheese</strong>.',
      tooltipText: 'The land of cheese',
      availableAt: UnlockName.THINK_PASSIVELY,
    },
    {
      name: UnlockName.THOUGHT_BOOST_STACK,
      type: 'Unlock',
      resource: 'thoughts',
      cost: 1e6,
      title: 'Extended Focus',
      description: 'Gain the ability to stack Thought Boosts.',
      tooltipText: 'Viagra for the brain',
      availableAt: UnlockName.CHEESE_QUEUE,
    },
    {
      name: UnlockName.MOLDY_CHEESE,
      type: 'Unlock',
      resource: 'thoughts',
      cost: 100e9,
      title: 'Derivative Cheese',
      description:
        'You can convert <strong style="color:yellow">Cheese</strong> into <strong style="color:rgb(60, 255, 0)">Moldy Cheese</strong>, if you think it tastes better.',
      tooltipText: 'Is it okay to eat?',
      availableAt: UnlockName.CHEESE_QUEUE,
    },
    {
      name: UnlockName.MILK,
      type: 'Unlock',
      resource: 'thoughts',
      cost: 1e16,
      title: 'Prestige?',
      description: '<span>You can reset your progress for a glass of calcium-rich <strong>Milk</strong></span>.',
      tooltipText: 'From cheese you get milk...I think.',
      availableAt: UnlockName.THOUGHT_JERK,
    },
  ],

  // Switzerland Simulator
  cheese: [
    {
      name: UnlockName.CHEESE_QUEUE,
      type: 'Mechanic',
      resource: 'cheese',
      cost: 8,
      title: 'Cheese Queue',
      description: 'You can queue up the production of <strong style="color:yellow">Cheese</strong>.',
      tooltipText: 'Cheese-o-mation lets you cheese clicking a button.',
    },
    {
      name: UnlockName.CHEESE_QUEUE_OVERCLOCKING,
      type: 'Mechanic',
      resource: 'cheese',
      cost: 50,
      title: 'Cheese Overclocking',
      description: 'You can increase the speed of your workers producing cheese by forcing them to think faster.',
      tooltipText: 'Thinking about how to cheese faster...',
    },
    {
      name: UnlockName.CHEESE_QUEUE_LENGTH_BOOST,
      type: 'Affix',
      resource: 'cheese',
      cost: 500,
      title: 'Length Boost',
      description: 'The capacity of the Cheese Queue boosts cheese production.',
      tooltipText: 'Give your employees more work like a good boss.',
      availableAt: UnlockName.CHEESE_QUEUE,
    },
    {
      name: UnlockName.CHEESE_BOOST,
      type: 'Affix',
      resource: 'cheese',
      cost: 50_000,
      title: 'Cheese Boost',
      description: 'Thought Boost also affects cheese production.',
      tooltipText: 'If you think hard enough, you can create cheese out of nothing.',
      availableAt: UnlockName.CHEESE_QUEUE,
    },
    {
      name: UnlockName.CHEESE_QUEUE_COST_DIVIDE,
      type: 'Unlock',
      resource: 'cheese',
      cost: 1e6,
      title: 'Cheepse',
      description: 'Unlock an additional upgrade to make cheese production more cost-efficient.',
      tooltipText: 'How much does a thought weigh?',
      availableAt: UnlockName.CHEESE_QUEUE,
    },
    {
      name: UnlockName.CHEESE_CYCLE_ACCELERATOR,
      type: 'Affix',
      resource: 'cheese',
      cost: 2e6,
      title: 'Experience is key',
      description: 'Cheese production speeds up based on the amount of cheese cycles completed.',
      tooltipText: 'The mastery of cheese, a very important life skill to have.',
      availableAt: UnlockName.CHEESE_QUEUE_LENGTH_BOOST,
    },
    {
      name: UnlockName.THOUGHT_JERK,
      type: 'Unlock',
      resource: 'cheese',
      cost: 5e6,
      title: 'More to think about',
      description: 'Jerk(?) your thinking.',
      tooltipText: 'something something per second cubed',
      availableAt: UnlockName.CHEESE_QUEUE_LENGTH_BOOST,
    },
    {
      name: UnlockName.CHEESE_MODES,
      type: 'Mechanic',
      resource: 'cheese',
      cost: 1e7,
      title: 'Cheese Factory Protocol',
      description: 'Gain access to 3 modes to help manage your cheese production',
      tooltipText: 'Micromanaging your employees will lead to universal happiness.',
      availableAt: UnlockName.CHEESE_QUEUE_LENGTH_BOOST,
    },
    {
      name: UnlockName.CHEESE_CYCLES_BOOST_THOUGHTS,
      type: 'Affix',
      resource: 'cheese',
      cost: 2e7,
      title: 'Return on Investment',
      description: 'Total cheese cycles give a boost (multiplier) to your thinking.',
      tooltipText: 'I like cycling. My favorite is cheese.',
      availableAt: UnlockName.CHEESE_CYCLE_ACCELERATOR,
    },
  ],

  // Moldy Cheese
  moldyCheese: [
    {
      name: UnlockName.MOLDY_CHEESE_BYPRODUCT,
      type: 'Mechanic',
      resource: 'moldyCheese',
      cost: 100,
      title: 'Moldomation',
      description: 'Sometimes the cheese factory will produce moldy cheese as a byproduct.',
      tooltipText: 'Is this good... or bad?',
    },
    {
      name: UnlockName.CHEESEYARD,
      type: 'Unlock',
      resource: 'moldyCheese',
      cost: 2000,
      title: 'End Times',
      description:
        'Construct the <strong style="color:crimson">Cheeseyard</strong>, a place where abominations made of cheese reside.',
      tooltipText: 'What happens after cheese dies?',
    },
    {
      name: UnlockName.MANUAL_MOLDY_CHEESE_CONVERSION_BOOST,
      type: 'Boost',
      resource: 'moldyCheese',
      cost: 4000,
      title: 'Passiveness',
      description: 'Cheese sacrifice produces 10x more moldy cheese, but its cooldown is also increased by 10x.',
      tooltipText: 'Some scientists are still unsure whether this will increase your effective gain.',
    },
    {
      name: UnlockName.CHEESEYARD_MOLD_UPGRADE,
      type: 'Unlock',
      resource: 'moldyCheese',
      cost: 8000,
      title: 'Em(b)olden',
      description: 'Your cheese monsters can get moldy. <br> Unlock an additional upgrade in the Cheeseyard.',
      tooltipText: 'This smells...',
      availableAt: UnlockName.CHEESEYARD,
    },
    {
      name: UnlockName.MOLDY_CHEESE_CYCLE_DURATION_BOOST,
      type: 'Affix',
      resource: 'moldyCheese',
      cost: 16000,
      title: 'Slow and Steady',
      description:
        'Moldy cheese byproduct gain is boosted by the relative duration of the cheese cycle (which depends on the cheese factory protocol).',
      tooltipText: 'The most meticulously crafted cheese is the moldiest.',
      availableAt: UnlockName.CHEESEYARD,
    },
    {
      name: UnlockName.MOLDY_CHEESE_HALFLIFE_BOOST,
      type: 'Affix',
      resource: 'moldyCheese',
      cost: 1e6,
      title: 'Half-important Upgrade',
      description: 'Moldy cheese byproduct gain is additionally boosted by MC half-life.',
      tooltipText: 'How much are 2 half-lives? They drop your braincells by 75%.',
      availableAt: UnlockName.CHEESEYARD_MOLD_UPGRADE,
    },
  ],

  // The Cheeseyard
  cheeseBrains: [
    {
      name: UnlockName.CHEESE_MONSTER_MASSACRE,
      type: 'Mechanic',
      resource: 'cheeseBrains',
      cost: 200,
      title: 'No Morals',
      description:
        '<strong>Massacre effect</strong>: When killing many cheese monsters at once, the loot is massively boosted.',
      tooltipText: 'Rewarding genocide! <br /> (only applies in this game and NOT in real life)',
    },
    {
      name: UnlockName.CHEESE_MONSTER_COLLECTIVE_SENTIENCE,
      type: 'Mechanic',
      resource: 'cheeseBrains',
      cost: 1e5,
      title: 'Emancipation',
      description:
        '<strong>Collective sentience</strong>: Bigger populations give a (much) bigger global boost to thinking due to emergence.',
      tooltipText: 'Completely harmless.',
    },
    {
      name: UnlockName.CHEESE_MONSTER_TOTAL_DEATHS_BOOST,
      type: 'Affix',
      resource: 'cheeseBrains',
      cost: 1e6,
      title: 'Mass Murder',
      description: 'Total cheese monster deaths boost their dropped loot.',
      tooltipText: 'You have to perfect to art of killing to extract the most out of corpses.',
    },
  ],
}

export const unlocked = makeStore<Record<UnlockName, boolean>>(convertEnumToFlagObject(UnlockName))
/* export const unlocked = makeStore<Record<UnlockName, boolean>>({
  start: true,

  // Cogito Ergo Sum
  thinkPassively: false,
  thinkFaster: false,
  thoughtBoost: false,
  thoughts50Percent: false,
  switzerland: false,
  thoughtBoostStack: false,
  moldyCheese: false,
  milk: false,

  // Switzerland Simulator
  cheeseQueue: false,
  cheeseQueueLengthBoost: false,
  cheeseBoost: false,
  cheeseCycleAccelerator: false,
  thoughtJerk: false,
  cheeseModes: false,
  cheeseCyclesBoostThoughts: false,

  // Moldy Cheese
  moldyCheeseByproduct: false,
  manualMoldyCheeseConversionBoost: false,
  cheeseyard: false,
  moldyCheeseCycleDurationBoost: false,

  // The Cheeseyard
  monsterBrainWaveController: false,
  cheeseMonsterMassacre: false,
  cheeseMonsterCollectiveSentience: false,
  cheeseMonsterTotalDeathsBoost: false,

  // Milk
}) */

function convertEnumToFlagObject(enumme: typeof UnlockName): Record<UnlockName, boolean> {
  const obj = Object.values(enumme)
  const result = {}
  obj.forEach(value => {
    if (value === enumme.START) result[value] = true
    else result[value] = false
  })

  return result as Record<UnlockName, boolean>
}
// console.log('ENUM ', Object.values(UnlockName), convertEnumToUnlockedObject(UnlockName))
