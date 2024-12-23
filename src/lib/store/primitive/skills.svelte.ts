export type Skill = {
    name: string
    unlockedAt: number //enlightenmentStage
    description: string
    tooltipText: string
    icon?: string
}

export const skills: Skill[] = [
    {
        name: 'Life Review',
        unlockedAt: 1,
        description: 'Moments before death, you quickly relive your life, giving you a massive boost to thoughts (+1min worth of production).',
        tooltipText: 'Death is an effective tool to increase your productivity.'
    },
    {
        name: 'Second Coming',
        unlockedAt: 1,
        description: 'You will automatically resurrect after dying.',
        tooltipText: 'This mechanic was invented in 33 AD.'
    },
    {
        name: 'Biostasis',
        unlockedAt: 1,
        description: 'Your health is preserved at its current stage and will not change.',
        tooltipText: 'B.J. sends his regards.'
    },
    {
        name: 'Duality',
        unlockedAt: 1,
        description: 'When happy, you also acquire a tiny fraction of knowledge (1% of your base rate).',
        tooltipText: 'No ledge, thin can.'
    },
    {
        name: 'Enthusiastic Lethargy',
        unlockedAt: 1,
        description: 'If you havent interacted with the cosmos for the last minute, all production will be boosted by 300%.',
        tooltipText: 'Doing nothing is the most productive.'
    }
]
