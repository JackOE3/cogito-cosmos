import { writable, get} from 'svelte/store';
import { sendMessage } from './notifications';
import * as store from '../stores/mainStore'
//import {compress, decompress} from 'lz-string'

/**
 * This is the key the save data will be stored under inside localstorage
 */
const storageName = 'cogitoErgoSum';


 /**
 * This class holds any data that needs to be saved when the player saves their game.
 * It should only be used for values that must be saved. Anything transient should go directly on the GameModel.
 */
export class SaveData {
  // maybe make private with getters? throws error though...

  // ALL STORE-RELATED DATA
  public data: object = {}

  public updateFromStores() {
    for(let key in store) this.data[key] = get(store[key])
  }

  constructor(){
    this.updateFromStores()
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
      dataMigrate(saveDataFromLocalStorage);

      hydrateStores(saveDataFromLocalStorage)
      //update the saveData object with the freshly hydrated stores
      //saveData.updateFromStores()

      // update all the other data that is not from stores
      //saveData.updateFromLocalStorage(saveDataFromLocalStorage)
    } else console.log("No save found, created new one.")

  } catch (error) {
    console.error(error); // log the error so at least we can see it
  }
}

/**
* Loads the data from localStorage into the stores.
*/
function hydrateStores(fromStorage: SaveData){
 
  for(let key in store) {
    store[key].set(fromStorage.data[key])
  }
  //for(let key in store) console.log(key, get(store[key]))
  console.log('Stores hydrated.');
}
 
/**
* Saves the data to localstorage
* @param saveData SaveData
*/
export function saveSaveGame() {

  if (saveData) {
    store.lastSaved.set(Date.now())

    // update the saveData object with all the current values of all the necessary stores
    saveData.updateFromStores()
    
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

export function exportSaveGame(): string {
  if (saveData) {
    saveData.updateFromStores()
  }
  return JSON.stringify(saveData)
}
export function importSaveGame(data: string) {
  try {
    let importedSaveData = JSON.parse(data); 
    dataMigrate(importedSaveData);
    hydrateStores(importedSaveData)
  } catch (error) {
    console.error(error);
  }
  
}

/**
* This function will help to update any data that was saved before new variables were added.
* Otherwise this can cause errors when something you expected to be there is not there.
*/
function dataMigrate(fromStorage: SaveData) {

    // create a new saveData to use as a reference
    let master = new SaveData();

    // get an array of the properties of saveData
    // would also return functions of an object, but NOT methods from a class apparently, so it's fine
    let keys = Object.getOwnPropertyNames(master.data);

    // check each property to make sure it exists on the save data
    keys.forEach((prop) => {
        if (typeof fromStorage.data[prop] === 'undefined') {
            console.log(`${prop} was undefined, adding it to saveData`);
            fromStorage.data[prop] = master.data[prop];
        }
    })
}
 
 
/**
* Resets saveGame in localstorage, resets all the stores and updates the savaData accordingly.
*/
export function resetSaveGame() {
    // update the stored gameModel with a new one
    resetStores()
    saveData.updateFromStores()
    sendMessage("Game reset.")
}

/**
* Resets all the stores to their default starting values. (NewGame)
*/
function resetStores(){
  for(let key in store) store[key].reset()
}

/**
* This is where all the important game data to be saved is stored.
*/
export const saveData = new SaveData()
loadSaveGame()