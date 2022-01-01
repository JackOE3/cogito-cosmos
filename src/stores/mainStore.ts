import { writable, derived, get} from 'svelte/store';
import {workers} from './Workers'
import {buildings} from './Buildings'
import {noRef} from '../gamelogic/utils'


export const lastSaved = writable(Date.now())

export const worker = writable(JSON.parse(JSON.stringify(workers)))
export const building = writable(JSON.parse(JSON.stringify(buildings)))