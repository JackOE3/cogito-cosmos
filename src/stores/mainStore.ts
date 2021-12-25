import { writable, derived, get} from 'svelte/store';

import {Resource, ResourceType} from './Resources'
import {workers} from './Workers'
import {buildings} from './Buildings'
import type {Building} from './Buildings'
import {noRef} from '../gamelogic/utils'



const makeResourceStore = (initialResources: Resource[]) => {
  const store = writable(noRef(initialResources))
  /**
   * Reset all the resources to their starting values for a new game.
   */
  const reset = () => store.set(noRef(initialResources))
  /**
   * Update all the resources according to their production rate for the time step deltaT.
   * @param deltaT 
   */
  const gameUpdate = (deltaT: number) => {
    /**
     * get() the current value of the store (-> resources) and update each one in the array individually,
     * then update the whole store at once to trigger UI updates (=> only 1 store update per game tick,
     *  independent of how many resources there are)
     */
    get(store).forEach((resource: Resource) => {
      updateResource(resource, deltaT)
    })
    store.update(m => m)
    //console.log(get(store)[0].amount, resources[0].amount)
  }
  /**
   * Update a specific resource according to its production rate for the time step deltaT.
   * @param resource 
   * @param deltaT 
   */
  const updateResource = (resource: Resource, deltaT: number) => {
    if (resource.amount < resource.maxAmount) {
      resource.amount += resource.perSec * deltaT
      if (resource.amount > resource.maxAmount) resource.amount = resource.maxAmount
    }
  }
  /**
   * Force the store to update itself to trigger UI updates.
   */
  const refresh = () => store.update(m => m)

  return {
    ...store,
    reset,
    refresh,
    gameUpdate,
    updateResource
  }

}

export const resourceStore = makeResourceStore([
    new Resource(ResourceType.BONES, 'bones', 0, 50),
    new Resource(ResourceType.ESSENCE, 'essence', 0, 10),
    new Resource(ResourceType.WOOD, 'wood', 0, 100),
    new Resource(ResourceType.STONES, 'stones', 0, 100)
])

export const worker = writable(JSON.parse(JSON.stringify(workers)))
export const building = writable(JSON.parse(JSON.stringify(buildings)))


/**
 * Holds the key to the current set of actions which are displayed.
 * Usage: actionTree.get(currentActions)
 */
export const currentActions = writable(noRef("baseActions"))


const makeLockedActionsStore = (initial: object) => {
  const store = writable(noRef(initial))
  const reset = () => store.set(noRef(initial))
  return {...store, reset}
}


/**
 * Keeps track of which actions are locked/unlocked for each tree.
 */
export const lockedActionsStore = makeLockedActionsStore({
  'baseActions': [false, false, false, false, true, true],
  'secondaryActions': [false, false, false, false]
})

export const lastSaved = writable(Date.now())