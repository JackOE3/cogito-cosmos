import { resourceStore } from "./Resources";
import { writable, get } from 'svelte/store';
import {noRef} from '../gamelogic/utils'

// global cooldown time
const GCD = 500


export enum ActionSet {
  BASE_ACTIONS,
  CAVE_CHAMBER,
  FOREST_VILLAGE
}
export interface Action {
  id: number,
  storyId?: number,
  locked: boolean,
  label: string,
  execute: Function,
  cooldown?: number
}

// HMMMMM......
class ActionProto {
  id: number;
  actionSet: ActionSet;
  locked: boolean;
  label: string;
  storyId: number;
  fn: Function;
  
  constructor(id: number, actionSet: ActionSet, locked: boolean, label: string, storyId?: number, fn?: Function) {
    this.id = id
    this.actionSet = actionSet
    this.locked = locked,
    this.label = label,
    this.storyId = storyId
    this.fn = fn
  }

  execute() {
    storyBookStore.add(this.storyId, this.actionSet)
    this.fn()
  }
}
const baseActions: Action[] = [
  {
    id: 0,
    locked: false,
    label: "switch to next core",
    execute: function() {
      
      //storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 0
  },
  {
    id: 1,
    locked: false,
    label: "reset current core",
    execute: function() {
      
      //storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 1
  },
  {
    id: 2,
    locked: false,
    label: "do other stuff",
    execute: function() {
      
      //storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 2
  },
]

// IF made into a store, could probably be a derived store from currentActionSet and LockedActions (for the methods)
export const actionTree = new Map<ActionSet, Action[]>([
  [ActionSet.BASE_ACTIONS, baseActions],
])

/**
 * Holds the key to the current set of actions which are displayed.
 * Usage: actionTree.get($currentActionSet)
 */
//self-invoking function!
export const currentActionSet = (
  function() {
    const initial = ActionSet.BASE_ACTIONS
    const store = writable(noRef(initial))
    const reset = () => store.set(noRef(initial))
    return {...store, reset}
  }()
)

/**
* Keeps track of which actions are locked and/or inactive for each Action Set.
*/
export const actionFlagStore = (
  function() {
    // for many action sets, you can maybe create the initial object in a loop (optimization)
    const initial = {
      [ActionSet.BASE_ACTIONS]: {
        locked: initLockedArray(ActionSet.BASE_ACTIONS),
        disabled: initDisabledArray(ActionSet.BASE_ACTIONS)
      },
    }

    const store = writable(noRef(initial))
    const reset = () => store.set(noRef(initial))

    const toggle = (flag: 'locked' | 'disabled', ...actions: Array<{id: number, set: boolean}>) => {
      store.update(s => {
        actions.forEach(action => {
          if(flag === 'locked') s[get(currentActionSet)].locked[action.id] = action.set
          if(flag === 'disabled') s[get(currentActionSet)].disabled[action.id] = action.set
        })
        return s
      })
    }

    return {...store, reset, toggle}
  }()
)


/**
 * Stores the progress of the current story (in form of storyIds), in chronological order of it being added.
 */
export const storyBookStore = (
  function() {
    const initial = {
      [ActionSet.BASE_ACTIONS]: [],
    }
    const store = writable(noRef(initial))
    const reset = () => store.set(noRef(initial))
    /**
     * Adds a the corresponding ID for a paragraph of the story to the story book for a specific location/set of actions.
     * If duplicate, does nothing.
     * 
     * @param actionSet specifies to which Array of storyBook the paragraph is added
     * @param storyPiece paragraph to be added
     */
    const add = (storyId: number, actionSet: ActionSet) => {
      if(get(store)[actionSet].every((id: number) => id !== storyId)) {
        store.update(storyBook => {
          storyBook[actionSet] = [...storyBook[actionSet], storyId]
          return storyBook
        })
      } else console.log("DUPLICATE DETECTED: paragraph already in the story book!")
    }
    return {...store, reset, add}
  }()
)


// --- UTILITY FUNCTIONS: ---

function initLockedArray(actionSet: ActionSet) {
  let lockedArr = []
  actionTree.get(actionSet).forEach(action => {
    // if the IDs arent in chronological order in the actionSet, shouldn't matter
    lockedArr[action.id] = action.locked
  })
  return lockedArr
}
function initDisabledArray(actionSet: ActionSet) {
  // just fill the whole thing with false values
  return new Array(actionTree.get(actionSet).length).fill(false)
}
