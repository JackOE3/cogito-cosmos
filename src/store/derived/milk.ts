import { derived } from 'svelte/store'
import { UnlockName, highestMilk, resource, upgrades } from '../primitive'

export const milkFromReset = derived(
  resource,
  $resource => (1 + 1e-5 * Math.pow($resource.thoughts, 0.25)) * (1 + 1e-7 * Math.pow($resource.cheese, 0.5))
)

export const bacteriaGrowthFactor = derived(upgrades, $upgrades => 1 + $upgrades.bacteriaGrowth.bought)
export const bacteriaPerSec = derived(
  [highestMilk, bacteriaGrowthFactor],
  ([$highestMilk, $bacteriaGrowthFactor]) => 1e-3 * Math.pow($highestMilk, 2) * $bacteriaGrowthFactor
)

const milkUpgradeLevel = {
  thoughts: 1,
  cheese: 1,
  moldyCheese: 1,
  cheeseBrains: 1,
}
export const milkUpgradeMultiplies = derived(upgrades, $upgrades => {
  const result = {
    thoughts: 1 + 0.5 * Math.pow($upgrades.milkThoughtsGain.bought, milkUpgradeLevel.thoughts + 1),
    cheese: 1 + 0.25 * Math.pow($upgrades.milkCheeseGain.bought, milkUpgradeLevel.cheese + 1),
    moldyCheese: 1 + 0.25 * Math.pow($upgrades.milkMoldyCheeseGain.bought, milkUpgradeLevel.moldyCheese + 1),
    cheeseBrains: 1 + 0.5 * Math.pow($upgrades.milkCheeseBrainsGain.bought, milkUpgradeLevel.cheeseBrains + 1),
  }
  return result
})

export const milkUpgradeEffects = {
  milkThoughtsGain: [
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'Each stack additionally increases the strength of the Thought Boost.',
      tooltipText: '+50% per active stack (multiplicative)',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 5,
      description: 'The Cheese Queue capacity is multiplied by your active Thought Boost stacks.',
      tooltipText: '1:1 ratio',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 8,
      description: 'The cost scaling of Thought Acceleration is improved.',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 10,
      description: 'The cost scaling of Thought Jerk is improved.',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 12,
      description: 'Your total Thought Accelerations boost bacteria(?) growth ',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 15,
      description: 'Each Thought Jerk upgrade gives a free Thought Acceleration upgrade (no cost scaling applied).',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 20,
      description: 'The effect of Thought Jerk grows stronger based on total upgrades bought. ',
      tooltipText: '-',
    },
  ],
  milkCheeseGain: [
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description:
        'While the Cheese Factory is running, gain an additional Thought Boost stack for every 10(?) overclocking levels',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'Cheese upgrade 4 (divides the cost…) applies to ALL pre-milk upgrades.',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'below 50% gain more X, above 50% gain more Y',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'Unlock ability to sacrifice total cheese cycles.',
      tooltipText: '-',
    },
  ],
  milkMoldyCheeseGain: [
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'Improve moldy cheese conversion scaling (exponent grows faster).',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'Total Cheese Sacrifices boost X (bacteria maybe?)',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'The Cheese Sacrifice cooldown is reduced.',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'Cheese monsters can accumulate more moldiness over time.',
      tooltipText: 'The longer monsters are alive, the more they boost MC gain. <br> Scaling: sqrt(time)',
    },
  ],
  milkCheeseBrainsGain: [
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description:
        'Smaller monster populations passively increase the collective sentience exponent depending on their size.',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'Increase the spawn rate of cheese monsters.',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'The death toll is twice as high in destructive mode.',
      tooltipText: '-',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'Improve the effect scaling of cheeseyard upgrades.',
      tooltipText: 'From linear to quadratic.',
    },
    {
      name: UnlockName.STACKS_INCREASE_THOUGHT_BOOST_STRENGTH,
      upgradesNeeded: 3,
      description: 'Cheese monsters additionally boost milk gain.',
      tooltipText: '-',
    },
  ],
}

export const milkResetMilestones = [
  {
    name: UnlockName.BUY_MAX_UPGRADES,
    resetsNeeded: 1,
    description: 'Unlock Buy Max button for pre-milk upgrades.',
    tooltipText: 'Can be toggled ON/OFF.',
  },
  {
    name: UnlockName.AUTO_BUY_UPGRADES,
    resetsNeeded: 2,
    description: 'Gain the ability to auto-buy (repeatable) pre-milk upgrades.',
    tooltipText: 'Can be toggled ON/OFF.',
  },
  {
    name: UnlockName.AUTO_OVERCLOCKING,
    resetsNeeded: 4,
    description: 'Gain access to some automating options for cheese Overclocking.',
    tooltipText: 'TBD',
  },
  {
    name: UnlockName.PERSISTENT_DEATHS_AND_CYCLES,
    resetsNeeded: 5,
    description: 'A % of your Total Cheese Cycles and Total Monster Deaths are saved between resets.',
    tooltipText: 'TBD',
  },
  {
    name: UnlockName.AUTO_BUY_ADVANCEMENTS,
    resetsNeeded: 6,
    description: 'Gain the ability to auto-buy advancements.',
    tooltipText: 'Can be toggled ON/OFF.',
  },
  {
    name: UnlockName.ADVANCEMENTS_ALREADY_UNLOCKED,
    resetsNeeded: 10,
    description: 'Start with advancements already unlocked.',
    tooltipText: 'TBD',
  },
  {
    name: UnlockName.INFINITE_CHEESE_QUEUE,
    resetsNeeded: 12,
    description: 'The Cheese Queue does not decay any longer.',
    tooltipText: 'TBD',
  },
  {
    name: UnlockName.FREE_CHEESE_SACRIFICES,
    resetsNeeded: 13,
    description: 'Cheese Sacrifices no longer reset your cheese.',
    tooltipText: 'TBD',
  },
  {
    name: UnlockName.AUTO_CHEESE_SACRIFICES,
    resetsNeeded: 14,
    description: 'Gain some automation options for Cheese Sacrifices.',
    tooltipText: 'TBD',
  },
  {
    name: UnlockName.AUTO_MONSTER_BRAIN_WAVE_CONTROLLER,
    resetsNeeded: 15,
    description: 'Gain some automation options for the Monster Brainwave Controller.',
    tooltipText: 'TBD',
  },
  {
    name: UnlockName.AUTO_CHEESE_MODES,
    resetsNeeded: 16,
    description: 'Gain some automation options for the Cheese Factory Protocol.',
    tooltipText: 'TBD',
  },
  {
    name: UnlockName.FREE_PRE_MILK_UPGRADES,
    resetsNeeded: 20,
    description: 'Buying pre-milk upgrades no longer decrease resources.',
    tooltipText: 'TBD',
  },
]
