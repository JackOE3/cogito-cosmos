import { writable } from 'svelte/store';

/**
 * This is the key the save data will be stored under inside localstorage
 */
 const storageName = 'sveltedata';

 /**
  * Load the save data from localstorage.
  * If no data is found just return a new SaveData with default values.
  */
 export function loadSaveGame() {
 
     // using a try/catch in case this fails for some reason
     try {
 
         // see if data exists first
         if (localStorage.getItem(storageName)) {
 
             // get data from localstorage, decompress it using lz-string, then parse it back into a javascript object
             let saveData = JSON.parse(localStorage.getItem(storageName));
 
             console.log('SaveData loaded:');
             console.log(saveData);
 
             // migrate the data so we know it is good to use
             dataMigrate(saveData);
 
             return saveData;
         }
 
         // if nothing in storage just create a new one
         return new SaveData();
 
     } catch (error) {
         console.error(error); // log the error so at least we can see it
     }
 
 }
 
 /**
  * Saves the data to localstorage
  * @param saveData SaveData
  */
 export function saveSaveGame(saveData) {
     // if save data exists
     if (saveData) {
 
         // set the last saved time
         saveData.lastSaved = Date.now();
 
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
 function dataMigrate(saveData) {
 
     // create a new saveData to use as a reference
     let master = new SaveData();
 
     // get an array of the properties of saveData
     let keys = Object.getOwnPropertyNames(master);
 
     // check each property to make sure it exists on the save data
     keys.forEach((prop) => {
         if (typeof saveData[prop] === 'undefined') {
             console.log(`${prop} was undefined, adding it to saveData`);
             saveData[prop] = master[prop];
         }
     })
 }
 
 
 /**
  * Resets save game in localstorage and resets the gameModel
  */
 export function resetSaveGame() {
 
     // remove from local storage
     localStorage.removeItem(storageName);
 
     // update the stored gameModel with a new one
     gameModel.update(g => new GameModel());
 }



/**
 * This class holds any data that needs to be saved when the player saves their game.
 * It should only be used for values that must be saved. Anything transient should go directly on the GameModel.
 */
export class SaveData {

    // Used to hold the current money the player has, initialized at 0
    money = 0
    resources = [];

    // Used to hold which upgrades have been bought, and the quantity
    // we will only save the id and the qty of each upgrade to avoiding wasting save game storage
    upgradesBought = [];

    // Used to hold when the game was last saved, needed to calculate offline progress
    lastSaved = Date.now();
}

/**
 * This class holds the data the game needs to function.
 * It will be accessible from anywhere in the game using svelte stores.
 */
export class GameModel {
    saveData;

    constructor() {
        // when we first create the game model we need to load any save data from localstorage
        this.saveData = loadSaveGame();
    }

    /**
     * Add money to the save data
     * @param value Amount of money to add
     */
    addMoney(value) {
        if (!isNaN(value)) {
            this.saveData.money += value;
        }
    }

    /**
     * Takes money from the save data.
     * Returns true if there was enough money, false if not.
     * @param value Amount of money to spend
     */
    spendMoney(value) {
        if (!isNaN(value) && this.saveData.money >= value) {
            this.saveData.money -= value;
            return true;
        }
        return false;
    }
}

/**
 * A writable store of the gameModel that can be accessed from other parts of the application.
 */
export const gameModel = writable(new GameModel());

/**
 * A function that can be called anywhere to update the game model in the svelte store.
 * This will trigger the svelte components to re-evaluate and update their content.
 */
export function updateGameModel() {
    gameModel.update(m => m = m);
}