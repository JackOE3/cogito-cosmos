import type { Resource } from "../stores/Resources"
import { resourceStore, lastSaved as lastSavedStore } from '../stores/mainStore'
import { saveSaveGame } from './saveload'
import { sendMessage } from "./notifications"
import { formatWhole } from "./utils"

/**
 * Reference to some stores.
 * We use the subscribe function so if the store is updated our local instance will also update.
 */
let resource: Resource[]
resourceStore.subscribe(m => resource = m)
let lastSaved: number
lastSavedStore.subscribe(m => lastSaved = m)

/**
 * how often to run the loop. 200ms = 5 times per second 
 * 200ms or 100ms is usually fast enough to feel responsive without wasting too much CPU time
 */ 
const ms = 1000

/**
 * How often to auto save the game. 60_000 = 60 seconds.
 */
const autoSaveTime = 60_000

/**
 * A reference to the interval that can be used to stop it if we need to
 */ 
let interval

/**
 * This function will start the game loop running at the desired rate, and save a reference to the interval so it can be stopped later
 */
export function startGameLoop() {
    
  console.log('Calculating offline progess...')
  calculateOfflineProgress()
  lastSaved = Date.now()

  console.log('Starting the game loop...')
  interval = setInterval(gameLoop, ms)
}

// some datetime values we will be using to calculate how much time has passed
let lastRunTime = Date.now()

/**
 * deltaT or delta time is the time difference in seconds since the last time the loop ran
 */ 
let deltaT = 0

/**
 * The game loop function that runs multiple times per second in the background.
 */
function gameLoop() {
  const currentTime = Date.now()

  // if lastSaved was more than 60 seconds ago we should save the game DEACTIVATED!!!!
  if (currentTime - lastSaved > autoSaveTime) {
    lastSaved = currentTime;
    //saveSaveGame()
    sendMessage("Game auto-saved")
  }

  // calculate deltaT based on the current time and the last run time
  // we are using Math.max and Math.min to make sure deltaT is between 0 and 1 seconds
  deltaT = Math.max(Math.min((currentTime - lastRunTime) / 1000, 1), 0)
  lastRunTime = currentTime

  // Now we know what deltaT is we can update the game
  gameUpdate(deltaT)
}


/**
 * Function to update all game data based on time.
 * This is where all idle calculations should start so they can be 
 * used by the main loop and the offline progress function.
 * (Assumes that the production can be linearly extrapolated)
 * @param deltaT time in seconds since last update
 */
function gameUpdate(deltaT: number) {

  // update all resources
  resourceStore.gameUpdate(deltaT)
 
}


/**
 * Function to calculate the offline progress
 */
function calculateOfflineProgress() {

  // note how bones we had before
  const bonesBefore = resource[0].amount

  // calculate time in seconds since last saved
  const currentTime = Date.now()

  const offlineDeltaT = Math.max((currentTime - lastSaved) / 1000, 0)

  console.log(`Offline for ${offlineDeltaT} seconds`)

  // perform the game update for the total time
  gameUpdate(offlineDeltaT)

  // calculate total earned
  const bonesEarned = resource[0].amount - bonesBefore;

  //sendMessage(`You have earned ${formatWhole(bonesEarned)} bones while offline!`);
}
