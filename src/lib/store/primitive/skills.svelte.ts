export type Skill = {
    name: string
    unlockedAt: number //enlightenmentStage
    description: string
    tooltipText: string
    icon?: string
}

export const skills: Skill[] = [
    {
        name: 'Knowledge is Power',
        unlockedAt: 1,
        description: 'Triple your knowledge acqisition rate.',
        tooltipText: "Don't be single, be triple instead."
    },
    {
        name: 'Duality',
        unlockedAt: 1,
        description: 'You also acquire knowledge while thinking.',
        tooltipText: 'Thin can, no ledge.'
    },
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
        name: 'Enthusiastic Lethargy',
        unlockedAt: 1,
        description: 'If you havent interacted with the cosmos for the last minute, all production will be boosted by 300%.',
        tooltipText: 'Doing nothing is the most productive.'
    }
]
