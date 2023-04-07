import { get } from 'svelte/store'
import { makeStore } from './customStore'
import { resource } from './resources'

export enum MilkBoost {
  ThoughtAccelBoostsItself = 'thoughtAccelBoostsItself',
  ImproveFormulaCheeseBoostsThoughts = 'improveFormulaCheeseBoostsThoughts',
  ImproveFormulaCheeseQueueLengthBoostsCheese = 'improveFormulaCheeseQueueLengthBoostsCheese',
  ImproveFormulaTotalCheeseCyclesBoostsThoughts = 'improveFormulaTotalCheeseCyclesBoostsThoughts',
  UnlockAdditionalUpgradesCheeseProductionTime = 'unlockAdditionalUpgradesCheeseProductionTime',
  MCByproductBoostedByMCHalflife = 'mCByproductBoostedByMCHalflife',
  CheeseCyclesPerCheeseModeBoostCheese = 'cheeseCyclesPerCheeseModeBoostCheese',
  CheeseUpgradeProductionTimeGivesFreeCheeseUpgradeYield = 'cheeseUpgradeProductionTimeGivesFreeCheeseUpgradeYield',
  ThoughtGainBoostedByThoughts = 'thoughtGainBoostedByThoughts',
  MilkGainMultiplied = 'milkGainMultiplied',
  UnspentMilkBoostsCheese = 'unspentMilkBoostsCheese',
  GainPercentageOfPotentialMilk = 'gainPercentageOfPotentialMilk',
  MassacreEffectBoosted = 'massacreEffectBoosted',
  CollectiveSentienceBoosted = 'collectiveSentienceBoosted',
  BetterScalingTotalCheeseMonsterDeathsLootBoost = 'betterScalingTotalCheeseMonsterDeathsLootBoost',
  UnspentCheeseBrainsBoostMonsterResourceGeneration = 'unspentCheeseBrainsBoostMonsterResourceGeneration',
}

export const milkBoostActive = makeStore<Record<MilkBoost, boolean>>({
  thoughtAccelBoostsItself: false,
  improveFormulaCheeseBoostsThoughts: false,
  improveFormulaCheeseQueueLengthBoostsCheese: false,
  improveFormulaTotalCheeseCyclesBoostsThoughts: false,
  unlockAdditionalUpgradesCheeseProductionTime: false,
  mCByproductBoostedByMCHalflife: false,
  cheeseCyclesPerCheeseModeBoostCheese: false,
  cheeseUpgradeProductionTimeGivesFreeCheeseUpgradeYield: false,
  thoughtGainBoostedByThoughts: false,
  milkGainMultiplied: false,
  unspentMilkBoostsCheese: false,
  gainPercentageOfPotentialMilk: false,
  massacreEffectBoosted: false,
  collectiveSentienceBoosted: false,
  betterScalingTotalCheeseMonsterDeathsLootBoost: false,
  unspentCheeseBrainsBoostMonsterResourceGeneration: false,
})

interface Boost {
  label: string
  description: string
  cost: number
  activated: boolean
  available: boolean
}
const loremIpsum = 'Lorem Ipsum' as const
const mockSkill: Boost = {
  label: loremIpsum,
  description: 'No Desc',
  cost: 100,
  activated: false,
  available: false,
}

const milkBoosts: Record<MilkBoost, Boost> = {
  [MilkBoost.ThoughtAccelBoostsItself]: {
    label: 'Reacceleration',
    description:
      'The effect of Thought Acceleration is multiplied by a factor proportional to the ' +
      'amount of Thought Acceleration upgrades you own.',
    cost: 5,
    activated: false,
    available: false,
  },
  [MilkBoost.ImproveFormulaCheeseBoostsThoughts]: {
    label: 'Cheesy Thoughts',
    description:
      'Improve the formula for cheese increasing thoughts/s <br> Current Formula: log(cheese + 1) <br>' +
      'Improved Formula: sqrt(cheese)',
    cost: 10,
    activated: false,
    available: false,
  },
  [MilkBoost.ImproveFormulaCheeseQueueLengthBoostsCheese]: {
    label: 'Polynomial Queue',
    description:
      'Improves the formula for Cheese Queue Length affecting cheese production. <br>' +
      'Current Formula: MaxLength / 10 <br> Improved Formula: MaxLength^3 / 100',
    cost: 5,
    activated: false,
    available: false,
  },
  [MilkBoost.ImproveFormulaTotalCheeseCyclesBoostsThoughts]: {
    label: 'Braincycles',
    description:
      'Improves the Formula for Total Cheese Cycles boosting your thinking <br>' +
      'Current Formula: sqrt(cycles / 10) <br> Improved Formula: cycles^2 / 1000 ',
    cost: 15,
    activated: false,
    available: false,
  },
  [MilkBoost.UnlockAdditionalUpgradesCheeseProductionTime]: {
    label: 'Crunch Time',
    description: 'Unlock 50 additional upgrades for “cheese production 5% takes less time...”',
    cost: 15,
    activated: false,
    available: false,
  },
  [MilkBoost.MCByproductBoostedByMCHalflife]: {
    label: 'Moldy Time',
    description:
      'The relative duration of the meticulous cheese factory protocol is multiplied by 100. <br>' +
      'MC byproduct yield is additionally boosted by MC half-life (in seconds). <br> Factor: (half-life / 100)^3',
    cost: 25,
    activated: false,
    available: false,
  },
  [MilkBoost.CheeseCyclesPerCheeseModeBoostCheese]: {
    label: 'Diverse Factory',
    description:
      'Cheese Cycles completed for each cheese factory protocol give a boost to cheese production. ' +
      'Each mode contributes to a separate factor, and cheese gain is multiplied by all 3 factors. <br>' +
      '(If this boost is deactivated, these factors are saved at their current values.)',
    cost: 20,
    activated: false,
    available: false,
  },
  [MilkBoost.CheeseUpgradeProductionTimeGivesFreeCheeseUpgradeYield]: {
    label: 'Overproduction',
    description:
      'When increasing the workload of your cheese factory workers, they complete their work in the same amount of time. <br>' +
      '(Their families are being threatened, they know what happens if they dont comply.)',
    cost: 10,
    activated: false,
    available: false,
  },
  [MilkBoost.ThoughtGainBoostedByThoughts]: {
    label: 'Thoughtback Loop',
    description: 'Thoughts/s are boosted by total thoughts. <br> Relationship: thoughts/s *= sqrt(thoughts)',
    cost: 20,
    activated: false,
    available: false,
  },
  [MilkBoost.MilkGainMultiplied]: {
    label: 'Milkiplied',
    description: 'Milk gain is tripled.',
    cost: 5,
    activated: false,
    available: false,
  },
  [MilkBoost.UnspentMilkBoostsCheese]: {
    label: 'Milky Cheese',
    description: 'Your unspent milk increases cheese gain proportionally. <br> (cheeseGain *= milk / 10)',
    cost: 15,
    activated: false,
    available: false,
  },
  [MilkBoost.MassacreEffectBoosted]: {
    label: 'Genocidal Tendencies',
    description: 'The Massacre effect for cheese monsters is more potent. <br> Exponent: 1.3 -> 2.0',
    cost: 15,
    activated: false,
    available: false,
  },
  [MilkBoost.CollectiveSentienceBoosted]: {
    label: 'Der Schwarm',
    description:
      'The collective sentience of cheese monsters is boosted. (use at your own risk) <br> ' + 'Exponent: 3.0 -> 5.0',
    cost: 20,
    activated: false,
    available: false,
  },
  [MilkBoost.BetterScalingTotalCheeseMonsterDeathsLootBoost]: {
    label: 'Death Scaling',
    description:
      'Better scaling for Upgrade “Total cheese monster deaths boost loot gain” <br>' +
      'Scaling: quadratic -> cubic(?)',
    cost: 25,
    activated: false,
    available: false,
  },
  [MilkBoost.UnspentCheeseBrainsBoostMonsterResourceGeneration]: {
    label: 'Brain Scaling',
    description:
      'The cheese monster resource generation is boosted based on unspent cheese brains <br>' +
      'Factor: cheeseBrains^1.5',
    cost: 25,
    activated: false,
    available: false,
  },
  [MilkBoost.GainPercentageOfPotentialMilk]: {
    label: '',
    description: '',
    cost: 0,
    activated: false,
    available: false,
  },
}

export const skillTree: Boost[][] = [
  [
    milkBoosts.thoughtAccelBoostsItself,
    milkBoosts.improveFormulaCheeseQueueLengthBoostsCheese,
    milkBoosts.milkGainMultiplied,
  ],
  [milkBoosts.improveFormulaCheeseBoostsThoughts, milkBoosts.cheeseUpgradeProductionTimeGivesFreeCheeseUpgradeYield],
  [
    milkBoosts.improveFormulaTotalCheeseCyclesBoostsThoughts,
    milkBoosts.massacreEffectBoosted,
    milkBoosts.unspentMilkBoostsCheese,
    milkBoosts.unlockAdditionalUpgradesCheeseProductionTime,
  ],
  [
    milkBoosts.cheeseCyclesPerCheeseModeBoostCheese,
    milkBoosts.thoughtGainBoostedByThoughts,
    milkBoosts.collectiveSentienceBoosted,
  ],
  [
    milkBoosts.mCByproductBoostedByMCHalflife,
    milkBoosts.betterScalingTotalCheeseMonsterDeathsLootBoost,
    milkBoosts.unspentCheeseBrainsBoostMonsterResourceGeneration,
  ],
]

export const allowedSkillTreeConnections = [
  '000',
  '010',
  '011',
  '021',
  '100',
  '101',
  '112',
  '113',
  '210',
  '211',
  '221',
  '222',
  '300',
  '311',
  '322',
]
