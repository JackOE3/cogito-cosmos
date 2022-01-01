import { writable, get} from 'svelte/store'
import {noRef} from '../gamelogic/utils'

/**
 * The different types of resources.
 */
export enum ResourceType {
  BONES,
  ESSENCE,
  WOOD,
  STONES
}

/**
 * The resource object.
 */
export class Resource {
  public resourceType: ResourceType;
  public name: string;
  public amount: number;
  public perSec: number;
  public perAction: number;
  public maxAmount: number;
  public active: boolean;

  constructor(resourceType: ResourceType, name: string, amount: number, maxAmount: number) {
    this.resourceType = resourceType;
    this.name = name;
    this.amount = amount;
    this.maxAmount = maxAmount;

    this.perSec = 0;
    this.perAction = 1;
  }
}

const makeResourceStore = (initialResources: Resource[]) => {
  const store = writable(noRef(initialResources))
  /**
   * Reset all the resources to their starting values for a new game.
   */
  const reset = () => store.set(noRef(initialResources))

  /**
   * Force the store to update itself to trigger UI updates.
   */
  const refresh = () => store.update(m => m)

  /**
   * Update all the resources according to their production rate for the time step deltaT.
   * @param deltaT 
   */
  const gameUpdate = function(deltaT: number) {
    /**
     * get() the current value of the store (-> resources) and update each one in the array individually,
     * then update the whole store at once to trigger UI updates (=> only 1 store update per game tick,
     *  independent of how many resource updates there are)
     */
    get(store).forEach((resource: Resource) => {
      updateResource(resource, deltaT)
    })
    this.refresh()
  }
  /**
   * Update a specific resource according to its production rate for the time step deltaT.
   * @param resource 
   * @param deltaT 
   */
  const updateResource = function(resource: Resource, deltaT: number) {
    if (resource.amount < resource.maxAmount) {
      resource.amount += resource.perSec * deltaT
      if (resource.amount > resource.maxAmount) resource.amount = resource.maxAmount
    }
  }
  /**
   * Manually add an specified amount to a specific resource.
   * @param resourceType specifies the resource to be added
   * @param amount the amount to add
   */
  const addResource = function(resourceType: ResourceType, amount: number) {

    // returns the resource with the specified resourceType
    let resource = get(store).find((resource: Resource) => resource.resourceType === resourceType)
    if (!resource) return

    if (resource.amount < resource.maxAmount) {
      resource.amount += amount
      if (resource.amount > resource.maxAmount) resource.amount = resource.maxAmount
      this.refresh()
    }
  }
 

  return {
    ...store,
    reset,
    refresh,
    gameUpdate,
    addResource,
  }

}

//Maybe in future, store resources (or all large data) as a JSON file and directly parse it here, better than hardcoded (?)
export const resourceStore = makeResourceStore([
    new Resource(ResourceType.BONES, 'bones', 0, 50),
    new Resource(ResourceType.ESSENCE, 'essence', 0, 10),
    new Resource(ResourceType.WOOD, 'wood', 0, 100),
    new Resource(ResourceType.STONES, 'stones', 0, 100)
])

