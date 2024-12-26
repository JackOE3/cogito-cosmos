//import { handleCheeseMonster } from './cheeseMonster'
import { lastSaved, resource, totalTimePlayed, derivedState, addResource, Resource, fastFowardFactor, health } from '$lib/store'
//import { saveSaveGame } from './saveload'

// natural log of 2
const LN2 = 0.69314718056

/**
 * how often to run the loop. 200ms = 5 times per second
 * 200ms or 100ms is usually fast enough to feel responsive without wasting too much CPU time
 */
const GAME_INTERVAL = 100

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
    lastSaved.value = Date.now()

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
    if (currentTime - lastSaved.value > autoSaveTime) {
        lastSaved.value = currentTime
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
    deltaTimeSeconds *= fastFowardFactor.value

    addResource(Resource.THOUGHTS, derivedState.thoughtsPerSec * deltaTimeSeconds)
    addResource(Resource.KNOWLEDGE, derivedState.knowledgePerSec * deltaTimeSeconds)
    addResource(Resource.INSIGHT, derivedState.insightPerSec * deltaTimeSeconds)

    addResource(Resource.WISDOM, derivedState.wisdomPerSec * deltaTimeSeconds)

    if (health.value >= 0 && health.value <= 1) {
        health.value += derivedState.healthChangePerSec * deltaTimeSeconds
    } else if (health.value > 1) health.value = 1
    else if (health.value < 0) health.value = 0

    // moldy cheese decay (linear extrapolation)
    // moldyCheese.update(value => value * (1 - LN2/mcHalfLifeSeconds) * deltaTimeSeconds))
    // OR: moldy cheese decay (exact)
    // if statement so while offline for longer than 10s you dont lose moldy cheese (?)
    resource.value.moldyCheese *= Math.exp((-LN2 * deltaTimeSeconds) / derivedState.mcHalfLifeSeconds)

    //handleCheeseMonster(resource.value, deltaTimeSeconds)

    //if (resource.value.milk > highestMilk.value) highestMilk.value = resource.value.milk

    totalTimePlayed.value += deltaTimeSeconds
}

/**
 * Function to calculate the offline progress
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateOfflineProgress(): void {
    console.log('Calculating offline progess...')
    // calculate time in seconds since last saved
    const currentTime = Date.now()

    const offlineDeltaTimeSeconds = Math.max((currentTime - lastSaved.value) / 1000, 0)

    console.log(`Offline for ${offlineDeltaTimeSeconds} seconds`)

    // perform the game update for the total time
    gameUpdate(offlineDeltaTimeSeconds)
}

/* function repopulateValues() {
  for (let id in upgrades) {
    upgrades[id].cost *= Math.pow(upgrades[id].costMultiplier, upgradesBought)[id])
  }
} */
