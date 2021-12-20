import { get, writable } from 'svelte/store';
import {formatNumber, formatWhole} from '../gamelogic/utils.js'

export const graveyard = writable({
  name: 'Graveyard',
  level: 0,
  effects: {
    maxSkeletons: 2
  }
})
export const crypt = writable({
  name: 'Crypt',
  level: 0,
  cost: (bones, stones) => {
    
    let bonesCost = 20 * Math.pow(1.5, get(crypt).level)
    let stonesCost = 10 * Math.pow(1.5, get(crypt).level)
    console.log("bonesCost:" + formatWhole(bonesCost) + ", stonesCost: " + formatWhole(stonesCost))

    if (bones >= bonesCost && stones >= stonesCost) return true
    return false
  },
  effects: {
    maxBones: 100,
    maxStones: 50
  }
})