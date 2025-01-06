<script lang="ts">
    import { formatNumber, square } from '$lib/gamelogic/utils'
    import { derivedGrid, formulas } from '$lib/store'
    import type { GeneratorResource, UpgradeI, UpgradeType } from '$lib/store'

    type Props = {
        data: UpgradeI
        top: number
        left: number
    }
    const { data: upgrade, top, left }: Props = $props()

    // export let rect: DOMRect
    const style = `top: ${top}px; left: ${left}px;`

    // very hacky
    let arg: unknown
    if (upgrade.upgradeType === 'addGeneratorGain' || upgrade.upgradeType === 'addGeneratorSpeed') {
        arg = upgrade.forGeneratorResource
    }

    /**
     * Depending on the type of upgrade, supply the formula/function to calculate what value it changes.
     */
    const formulaDict: Record<UpgradeType, (upgrades: UpgradeI[]) => number> = {
        //to insert other dependencies into the formula (there will be others):
        addAttack: upgrades => formulas.attack(upgrades),
        //clean but probably wont be enough:
        multAttack: formulas.attack,
        //paceholder:
        addGeneratorGain: upgrades => formulas.generatorGainForResource(upgrades)[arg as GeneratorResource],
        addGeneratorSpeed: upgrades => formulas.generatorDurationForResource(upgrades)[arg as GeneratorResource] / 1000
    }
    const valueNameDict: Record<UpgradeType, string> = {
        addAttack: 'Attack',
        multAttack: 'Attack',
        addGeneratorGain: 'Red/Fill',
        addGeneratorSpeed: 'Duration'
    }

    let currentValue = $state(0)
    let newValue = $state(0)
    const valueName = valueNameDict[upgrade.upgradeType]

    $effect(() => {
        //console.log('UpgradeCellTooltipComponent mounted')
        // THIS IS HELLA EXPENSIVE AND WILL MAKE THE GAME LAG OUT OF ITS MIND
        const upgradesSnapshot = $state.snapshot(derivedGrid.upgradesInCellGrid) as UpgradeI[]
        const upgradeSnap = upgradesSnapshot.find(u => u.id == upgrade.id)
        currentValue = formulaDict[upgrade.upgradeType](upgradesSnapshot)
        upgradeSnap!.count++
        newValue = formulaDict[upgrade.upgradeType](upgradesSnapshot)

        return () => {
            //console.log('UpgradeCellTooltipComponent destroyed')
        }
    })
</script>

<div class="tooltip" {style}>
    <div class="background">
        {@html upgrade.description!.join('<br>')} <br />
        {valueName}: {formatNumber(currentValue, 2)} <span style="font-size: 0.75rem">&#8594;</span>
        {formatNumber(newValue, 2)} <br /> Cost: {formatNumber(upgrade.cost, 2)}
        {@html square[upgrade.resource]}
    </div>
</div>

<style>
</style>
