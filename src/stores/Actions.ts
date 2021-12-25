import { currentActions, lockedActionsStore, resourceStore } from "./mainStore";
import type { Resource } from "./Resources";

let lActions: object;
lockedActionsStore.subscribe(m => lActions = m);
let resource: Resource[];
resourceStore.subscribe(m => resource = m);

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
      // TODO:
      resource[0].amount++
      resourceStore.update(m => m)
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
      currentActions.set("secondaryActions")
    }
  },
  {
    id: 3,
    label: "look around",
    execute: function() {
      lActions['baseActions'][4] = false
      lActions['baseActions'][5] = false
      lActions['baseActions'][3] = true
      lockedActionsStore.update(m => m)
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
      currentActions.set("baseActions")
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