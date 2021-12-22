import {formatNumber, formatWhole} from '../gamelogic/utils.js'
import {ResourceType} from '../stores/Resources'

export enum BuildingType {
  GRAVEYARD,
  CRYPT
}
/**
 * The Building Type.
 */
interface cost {
  resourceType: ResourceType,
  amount: number,
  multiplier: number
}
export interface Building {
  buildingType: BuildingType
  name: string,
  level: number,
  effects: object,
  cost: cost[]
}

const crypt = {
  name: 'Crypt',
  level: 0,
  /*cost: (bones, stones) => {
    
    let bonesCost = 20 * Math.pow(1.5, get(crypt).level)
    let stonesCost = 10 * Math.pow(1.5, get(crypt).level)
    console.log("bonesCost:" + formatWhole(bonesCost) + ", stonesCost: " + formatWhole(stonesCost))

    if (bones >= bonesCost && stones >= stonesCost) return true
    return false
  },*/
  effects: {
    maxBones: 100,
    maxStones: 50
  }
}



export const buildings: Building[] = [
  {
    buildingType: BuildingType.GRAVEYARD,
    name: 'Graveyard',
    level: 0,
    effects: {
      maxSkeletons: 2
    },
    cost: [
      {
        resourceType: ResourceType.BONES,
        amount: 20,
        multiplier: 1.5
      },
      {
        resourceType: ResourceType.STONES,
        amount: 10,
        multiplier: 1.5
      }
    ]
  },
  {
    buildingType: BuildingType.CRYPT,
    name: 'Crypt',
    level: 0,
    effects: {
      maxBones: 100,
      maxStones: 50
    },
    cost: [
      {
        resourceType: ResourceType.BONES,
        amount: 50,
        multiplier: 1.4
      },
      {
        resourceType: ResourceType.STONES,
        amount: 25,
        multiplier: 1.4
      }
    ]
  }


]


