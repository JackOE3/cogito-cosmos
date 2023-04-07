import App from './App.svelte'
import { startGameLoop } from './gamelogic/gameloop'

console.log('main.ts')

const app = new App({
  target: document.body,
})

/**
 *  Start the game loop in the background
 * 	This also calculates the offline progress
 */
startGameLoop()

export default app
