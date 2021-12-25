import { writable, get} from 'svelte/store';
import { sendMessage } from './notifications';

import type { Resource } from '../stores/Resources';
import type { Building } from '../stores/Buildings';
import {
  resourceStore,
  worker,
  building,
  currentActions,
  lockedActionsStore,
  lastSaved
} from '../stores/mainStore'


/**
 * This is the key the save data will be stored under inside localstorage
 */
const storageName = 'sveltedata';

 /**
 * This class holds any data that needs to be saved when the player saves their game.
 * It should only be used for values that must be saved. Anything transient should go directly on the GameModel.
 */
export class SaveData {
  private resource: Resource[]
  private worker: object
  private building: Building[]
  private currentActions: string
  private lockedActions: object
  private lastSaved: number

  public update() {
    this.resource = get(resourceStore)
    this.worker = get(worker)
    this.building = get(building)
    this.currentActions = get(currentActions)
    this.lockedActions = get(lockedActionsStore)
    this.lastSaved = get(lastSaved)
  }

  constructor(){
    this.update()
  }
}

 /**
  * Load the save data from localstorage.
  * If no data is found just return a new SaveData with default values.
  */
 export function loadSaveGame(){
 
  // using a try/catch in case this fails for some reason
  try {

    // see if data exists first
    if (localStorage.getItem(storageName)) {

      // get data from localstorage, decompress it using lz-string, then parse it back into a javascript object
      let saveDataFromLocalStorage = JSON.parse(localStorage.getItem(storageName));

      //sendMessage("Savefile loaded.")
      console.log('SaveData loaded:');
      console.log(saveDataFromLocalStorage);

      // migrate the data so we know it is good to use
      // also makes sure the function really returns a SaveData object
      dataMigrate(saveDataFromLocalStorage);

      //NEW :
      hydrateStores(saveDataFromLocalStorage)
      //update the saveData object with the freshly hydrated stores
      saveData.update()
    } else console.log("No save found, created new one.")

  } catch (error) {
    console.error(error); // log the error so at least we can see it
  }
 }

 /**
  * Loads the data from localStorage into the stores.
  */
 function hydrateStores(fromStorage){
    resourceStore.set(fromStorage.resource)
    worker.set(fromStorage.worker)
    building.set(fromStorage.building)
    currentActions.set(fromStorage.currentActions)
    lockedActionsStore.set(fromStorage.lockedActions)
    lastSaved.set(fromStorage.lastSaved)
    console.log('Stores hydrated.');
 }
 
 /**
  * Saves the data to localstorage
  * @param saveData SaveData
  */
export function saveSaveGame() {

  if (saveData) {
    lastSaved.set(Date.now())

    // update the saveData object with all the current values of all the necessary stores
    saveData.update()
    
    try {
      // Use JSON.stringify to turn the object into a string, then compress with lz-string,
      // before setting it in localstorage
      localStorage.setItem(storageName, JSON.stringify(saveData));
      console.log('SaveData saved:');
      console.log(saveData);

    } catch (error) {
        console.error(error); // log the error so at least we can see it
    }
  }
}

/**
* This function will help to update any data that was saved before new variables were added.
* Otherwise this can cause errors when something you expected to be there is not there.
*/
function dataMigrate(fromStorage) {

    // create a new saveData to use as a reference
    let master = new SaveData();

    // get an array of the properties of saveData
    // would also return functions of an object, but NOT methods from a class apparently, so it's fine
    let keys = Object.getOwnPropertyNames(master);

    // check each property to make sure it exists on the save data
    keys.forEach((prop) => {
        if (typeof fromStorage[prop] === 'undefined') {
            console.log(`${prop} was undefined, adding it to saveData`);
            fromStorage[prop] = master[prop];
        }
    })
}
 
 
/**
* Resets saveGame in localstorage, resets all the stores and updates the savaData accordingly.
*/
export function resetSaveGame() {

    // remove from local storage
    // -> actually shouldnt remove the save, only if you save afterwards
    //localStorage.removeItem(storageName);

    // update the stored gameModel with a new one
    resetStores()

    saveData.update()

    sendMessage("Game reset.")
}

/**
* Resets all the stores to their default starting values. (NewGame)
*/
function resetStores(){
  // TODO: make each store custom, so you can do store.reset() for all stores here

  resourceStore.reset()
  currentActions.set("baseActions")
  lockedActionsStore.reset()

  /*worker.set(JSON.parse(JSON.stringify(workers)))
  building.set(JSON.parse(JSON.stringify(buildings)))*/
}

/**
* This is where all the important game data to be saved is stored.
*/
const saveData = new SaveData()
loadSaveGame()