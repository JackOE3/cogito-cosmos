import { writable, derived, get} from 'svelte/store'; 
import {noRef} from '../gamelogic/utils'


export const lastSaved = writable(Date.now())

export const currentCPU = writable({
  cores: 4,
  activeCore: 1,
  control: 0,
})