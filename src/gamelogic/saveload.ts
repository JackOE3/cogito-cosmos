import { get } from 'svelte/store'
import { sendMessage } from './notifications'
import * as store from '../stores/mainStore'
import { upgradesInitial } from '../stores/upgrades'
// import {compress, decompress} from 'lz-string'

console.log('savedload.ts')

const CURRENT_SAVE_VERSION = '0.0.1'
/**
 * This is the key the save data will be stored under inside localstorage
 */
const storageName = 'cogitoErgoSum'

/**
 * This class holds any data that needs to be saved when the player saves their game.
 * It should only be used for values that must be saved. Anything transient should go directly on the GameModel.
 */
export class SaveData {
  // maybe make private with getters? throws error though...

  public version: string = CURRENT_SAVE_VERSION
  public data: object = {} // ALL STORE-RELATED DATA

  public updateFromStores(): void {
    for (const key in store) this.data[key] = get(store[key])
  }

  constructor() {
    this.updateFromStores()
  }
}

/**
 * Load the save data from localstorage.
 * If no data is found just return a new SaveData with default values.
 */
export function loadSaveGame(): void {
  // using a try/catch in case this fails for some reason
  try {
    // see if data exists first
    if (localStorage.getItem(storageName) !== null) {
      // get data from localstorage, decompress it using lz-string, then parse it back into a javascript object
      const saveDataFromLocalStorage = JSON.parse(localStorage.getItem(storageName) as string)

      // sendMessage("Savefile loaded.")
      console.log('saveData loaded:')
      console.log(saveDataFromLocalStorage)

      // migrate the data so we know it is good to use
      dataMigrate(saveDataFromLocalStorage)

      hydrateStores(saveDataFromLocalStorage)

      // update the saveData object with the freshly hydrated stores
      // saveData.updateFromStores()

      // update all the other data that is not from stores
      // saveData.updateFromLocalStorage(saveDataFromLocalStorage)
    } else {
      console.log('No save found, created new one.')
    }
  } catch (error) {
    console.error(error) // log the error so at least we can see it
  }
}

/**
 * Loads the data from localStorage into the stores.
 */
function hydrateStores(fromStorage: SaveData): void {
  for (const key in store) {
    store[key].set(fromStorage.data[key])
  }
  // for(let key in store) console.log(key, get(store[key]))
  console.log('Stores hydrated.')
}

/**
 * Saves the data to localstorage
 * @param saveData SaveData
 */
export function saveSaveGame(): void {
  if (saveData !== null) {
    store.lastSaved.set(Date.now())

    // update the saveData object with all the current values of all the necessary stores
    saveData.updateFromStores()

    try {
      // Use JSON.stringify to turn the object into a string, then compress with lz-string,
      // before setting it in localstorage
      localStorage.setItem(storageName, JSON.stringify(saveData))
      console.log('saveData saved:')
      console.log(saveData)
    } catch (error) {
      console.error(error) // log the error so at least we can see it
    }
  }
}

export function exportSaveGame(): string {
  if (saveData !== null) {
    saveData.updateFromStores()
    return JSON.stringify(saveData)
  }
  return 'Error: saveData is null.'
}
export function importSaveGame(data: string): void {
  try {
    const importedSaveData = JSON.parse(data)
    dataMigrate(importedSaveData)
    hydrateStores(importedSaveData)
  } catch (error) {
    console.error(error)
  }
}

/**
 * This function will help to update any data that was saved before new variables were added.
 * Otherwise this can cause errors when something you expected to be there is not there.
 */
function dataMigrate(fromStorage: SaveData): void {
  console.log('Migrating saveData...')

  // create a new saveData to use as a reference
  const master = new SaveData()

  console.log('fromStorage', fromStorage.version)
  if (fromStorage.version !== master.version) {
    // TODO: define more rigorous type
    if (typeof fromStorage.version !== 'string') {
      console.log('Corrupted save file found: Invalid version number.')
    } else {
      console.log('Outdated version save file found.')
      // Logic for upgrading to newer versions goes here.
    }
  }

  // TODO: check version: if(master.version !== fromStorage.version) {...}
  // -> Logic for upgrading from version A to version B? (if theres breaking changes idk)

  // get an array of the properties of saveData
  // would also return functions of an object, but NOT methods from a class apparently, so it's fine
  const propertiesMaster = Object.getOwnPropertyNames(master.data)
  const propertiesFromStorage = Object.getOwnPropertyNames(fromStorage.data)

  // check each property to make sure it exists on the save data, if not add it
  propertiesMaster.forEach(prop => {
    if (typeof fromStorage.data[prop] === 'undefined') {
      console.log(`${prop} was undefined, adding it to saveData`)
      fromStorage.data[prop] = master.data[prop]
    } else if (typeof fromStorage.data[prop] === 'object') {
      // console.log(prop, 'is an object')
      const innerPropertiesMaster = Object.getOwnPropertyNames(master.data[prop] as object)
      // console.log('innerProperties', innerProperties)
      innerPropertiesMaster.forEach(innerProp => {
        if (typeof fromStorage.data[prop][innerProp] === 'undefined') {
          console.log(`${prop}.${innerProp} was undefined, adding it to saveData`)
          fromStorage.data[prop][innerProp] = master.data[prop][innerProp]
        }
      })
    }
  })

  // check if there are properties which are deprecated or deleted in a newer version, if so delete them
  propertiesFromStorage.forEach(prop => {
    if (typeof master.data[prop] === 'undefined') {
      console.log(`${prop} should not be in saveData, deleting it from saveData`)
      fromStorage.data[prop] = master.data[prop]
      Reflect.deleteProperty(fromStorage.data, prop)
    } else if (typeof master.data[prop] === 'object') {
      const innerPropertiesFromStorage = Object.getOwnPropertyNames(fromStorage.data[prop] as object)
      innerPropertiesFromStorage.forEach(innerProp => {
        if (typeof master.data[prop][innerProp] === 'undefined') {
          console.log(`${prop}.${innerProp} should not be in saveData, deleting it from saveData`)
          Reflect.deleteProperty(fromStorage.data[prop], innerProp)
        }
      })
    }
  })

  console.log('Migration complete.')
}

/**
 * Resets saveGame in localstorage, resets all the stores and updates the savaData accordingly.
 */
export function resetSaveGame(): void {
  // update the stored gameModel with a new one
  resetStores()
  if (saveData !== null) saveData.updateFromStores()
  sendMessage('Game reset.')
}

/**
 * Resets all the stores to their default starting values. (NewGame)
 */
function resetStores(): void {
  for (const key in store) store[key].reset()
}

/**
 * If there already is a saved game, but eg. the base cost of an upgrade changes or its cost multiplier,
 * this function will recalculate the current price for the upgrade
 * Also can be utilized for possible upgrades where the base cost or multiplier of another upgrade changes.
 */
export function recalculateStores(): void {
  let upgrades: object = {}
  // maybe change to store.upgrades.update() instead?
  const unsubscribe = store.upgrades.subscribe($store => {
    upgrades = $store
  })

  for (const [key, value] of Object.entries(upgrades)) {
    value.maxBuy = upgradesInitial[key].maxBuy
    if (typeof value.maxBuy === 'number' && value.bought > value.maxBuy) value.bought = value.maxBuy
    value.costMultiplier = upgradesInitial[key].costMultiplier
    value.cost = upgradesInitial[key].cost * Math.pow(upgradesInitial[key].costMultiplier, value.bought)
  }
  store.upgrades.refresh()
  unsubscribe()
}

/**
 * This is where all the important game data to be saved is stored.
 */
const saveData: SaveData = new SaveData()
loadSaveGame()
