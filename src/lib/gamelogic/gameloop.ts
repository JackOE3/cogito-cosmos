import { get } from 'svelte/store'
import { handleCheeseMonster } from './cheeseMonster'
import {
  lastSaved,
  resource,
  highestMilk,
  mcHalfLifeSeconds,
  thoughtsPerSec,
  totalTimePlayed,
  bacteriaPerSec,
} from '$lib/store'
import { saveSaveGame } from './saveload'

// natural log of 2
const LN2 = 0.69314718056

/**
 * how often to run the loop. 200ms = 5 times per second
 * 200ms or 100ms is usually fast enough to feel responsive without wasting too much CPU time
 */
const GAME_INTERVAL = 200
const fastFowardFactor = 1

/**
 * How often to auto save the game. 60_000 = 60 seconds.
 */
const autoSaveTime = 30_000

/**
 * A reference to the interval that can be used to stop it if we need to
 */
let interval: number

/**
 * This function will start the game loop running at the desired rate, and save a reference to the interval so it can be stopped later
 */
export function startGameLoop(): void {
  /* console.log('Repopulating transient values...')
  repopulateValues() */

  // calculateOfflineProgress()
  lastSaved.set(Date.now())

  console.log('Starting the game loop...')
  interval = setInterval(gameLoop, GAME_INTERVAL)
}
export function stopGameLoop(): void {
  clearInterval(interval)
}

// some datetime values we will be using to calculate how much time has passed
let lastRunTime = Date.now()

/**
 * the time difference in seconds since the last time the loop ran
 */
let deltaTimeSeconds = 0

/**
 * The game loop function that runs multiple times per second in the background.
 */
function gameLoop(): void {
  const currentTime = Date.now()

  // if lastSaved was more than 60 seconds ago we should save the game DEACTIVATED!!!!
  if (currentTime - get(lastSaved) > autoSaveTime) {
    lastSaved.set(currentTime)
    // saveSaveGame()
    // sendMessage('Game auto-saved')
  }

  // calculate deltaT based on the current time and the last run time
  // we are using Math.max and Math.min to make sure deltaT is between 0 and 1 seconds
  deltaTimeSeconds = Math.max(Math.min((currentTime - lastRunTime) / 1000, 1), 0)
  lastRunTime = currentTime

  // Now we know what deltaT is we can update the game
  gameUpdate(deltaTimeSeconds)
}

/**
 * Function to update all game data based on time.
 * This is where all idle calculations should start so they can be
 * used by the main loop and the offline progress function.
 * (Assumes that the production can be linearly extrapolated)
 * @param deltaTimeSeconds time in seconds since last update
 */
function gameUpdate(deltaTimeSeconds: number): void {
  deltaTimeSeconds *= fastFowardFactor

  resource.update($resource => {
    $resource.thoughts += get(thoughtsPerSec) * deltaTimeSeconds
    // moldy cheese decay (linear extrapolation)
    // moldyCheese.update(value => value * (1 - LN2/get(mcHalfLifeSeconds) * deltaTimeSeconds))
    // OR: moldy cheese decay (exact)
    // if statement so while offline for longer than 10s you dont lose moldy cheese (?)
    $resource.moldyCheese *= Math.exp((-LN2 * deltaTimeSeconds) / get(mcHalfLifeSeconds))

    handleCheeseMonster($resource, deltaTimeSeconds)

    if ($resource.milk > get(highestMilk)) highestMilk.set($resource.milk)
    $resource.bacteria += get(bacteriaPerSec) * deltaTimeSeconds

    return $resource
  })

  totalTimePlayed.update($value => $value + deltaTimeSeconds)
}

/**
 * Function to calculate the offline progress
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateOfflineProgress(): void {
  console.log('Calculating offline progess...')
  // calculate time in seconds since last saved
  const currentTime = Date.now()

  const offlineDeltaTimeSeconds = Math.max((currentTime - get(lastSaved)) / 1000, 0)

  console.log(`Offline for ${offlineDeltaTimeSeconds} seconds`)

  // perform the game update for the total time
  gameUpdate(offlineDeltaTimeSeconds)
}

/* function repopulateValues() {
  for (let id in upgrades) {
    upgrades[id].cost *= Math.pow(upgrades[id].costMultiplier, get(upgradesBought)[id])
  }
} */
