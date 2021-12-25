import { gameModel, updateGameModel } from "../gamelogic/gamemodel";
import type { GameModel } from "../gamelogic/gamemodel";
import { writable } from "svelte/store";

let gm: GameModel;
gameModel.subscribe(m => gm = m);

export interface Action {
  id: number,
  label: string,
  execute: Function
  locked?: boolean
}
const baseActions: Action[] = [
  {
    id: 0,
    label: "collect bones",
    execute: function() {
      gm.saveData.resource[0].amount++
    }
  },
  {
    id: 1,
    label: "pick up stones",
    execute: function() {
      console.log("going right")
    }
  },
  {
    id: 2,
    label: "Go left",
    execute: function() {
      gm.saveData.currentActions = "secondaryActions"
    }
  },
  {
    id: 3,
    label: "look around",
    execute: function() {
      gm.saveData.lockedActions['baseActions'][4] = false
      gm.saveData.lockedActions['baseActions'][5] = false
      gm.saveData.lockedActions['baseActions'][3] = true
    }
  },
  {
    id: 4,
    label: "explore the path before you",
    execute: function() {
      console.log("going right")
    }
  },
  {
    id: 5,
    label: "explore the path behind you",
    execute: function() {
      console.log("going right")
    }
  }
]
const secondaryActions: Action[] = [
  {
    id: 0,
    label: "Look Up",
    execute: function() {
      console.log("oh.")
    }
  },
  {
    id: 1,
    label: "Climb up",
    execute: function() {
      console.log("how tho")
    }
  },
  {
    id: 2,
    label: "<= return",
    execute: function() {
      gm.saveData.currentActions = "baseActions"
    }
  }
]

// IF made into a store, could probably be a derived store from currentActions and LockedActions (for the methods)
export const actionTree = new Map<string, Action[]>([
  ["baseActions", baseActions],
  ["secondaryActions", secondaryActions]
])

//actionTree.set("baseActions", baseActions)
//actionTree.set("secondaryActions", secondaryActions)