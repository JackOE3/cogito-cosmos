import { resourceStore } from "./Resources";
import { writable, get } from 'svelte/store';
import { ResourceType, type Resource } from "./Resources";
import {noRef} from '../gamelogic/utils'

// global cooldown time
const GCD = 500

let resource: Resource[];
resourceStore.subscribe(m => resource = m);

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
  /*new ActionProto(
    15,
    ActionSet.BASE_ACTIONS,
    false,
    "\"Whut!?\"",
    "A good story man wooo!",
    () => {
      console.log("fn called")
    }
  ),*/
  {
    id: 11,
    locked: false,
    label: "open your eyes",
    execute: function() {
      actionFlagStore.toggle('locked', {id: 0, set: false})
      actionFlagStore.toggle('disabled', {id: 11, set: true})
      storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 8
  },
  {
    id: 0,
    locked: true,
    label: "\"Where am I?\"",
    execute: function() {
      actionFlagStore.toggle('locked', {id: 1, set: false}, {id: 2, set: false})
      actionFlagStore.toggle('disabled', {id: 0, set: true})
      storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 0
  },
  {
    id: 1,
    locked: true,
    label: "punch the wall",
    execute: function() {
      storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 1
  },
  {
    id: 2,
    locked: true,
    label: "look around",
    execute: function() {
      actionFlagStore.toggle('locked', {id: 3, set: false}, {id: 6, set: false})
      actionFlagStore.toggle('disabled', {id: 2, set: true})
      storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 2
  },
  {
    id: 3,
    locked: true,
    label: "look down",
    execute: function() {
      actionFlagStore.toggle('locked', {id: 4, set: false}, {id: 5, set: false})
      actionFlagStore.toggle('disabled', {id: 3, set: true})
      storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 3
  },
  {
    id: 4,
    locked: true,
    label: "collect bones",
    execute: function() {
      resourceStore.addResource(ResourceType.BONES, 1)
      storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 4,
    cooldown: GCD
  },
  {
    id: 5,
    locked: true,
    label: "pick up stones",
    execute: function() {
      resourceStore.addResource(ResourceType.STONES, 1)
      storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 5,
    cooldown: GCD
  },
  {
    id: 6,
    locked: true,
    label: "go forwards",
    execute: function() {
      actionFlagStore.toggle('locked', {id: 7, set: false}, {id: 8, set: false}, {id: 9, set: false})
      actionFlagStore.toggle('disabled', {id: 6, set: true})
      storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 6
  },
  
  {
    id: 7,
    locked: true,
    label: "follow the left corridor",
    execute: function() {
      currentActionSet.set(ActionSet.CAVE_CHAMBER)
      storyBookStore.add(this.storyId, ActionSet.CAVE_CHAMBER)
    },
    storyId: 0
  },
  {
    id: 8,
    locked: true,
    label: "follow the right corridor",
    execute: function() {
      currentActionSet.set(ActionSet.FOREST_VILLAGE)
      storyBookStore.add(this.storyId, ActionSet.FOREST_VILLAGE)
    },
    storyId: 0
  },
  {
    id: 9,
    locked: true,
    label: "flip an imaginary coin",
    execute: function() {
      console.log("heads!")
      storyBookStore.add(this.storyId, ActionSet.BASE_ACTIONS)
    },
    storyId: 7
  },
  {
    id: 10,
    locked: true,
    label: "open your inventory",
    execute: function() {
      console.log("opened")
    }
  }
]

const caveChamber: Action[] = [
  {
    id: 0,
    locked: false,
    label: "go back",
    execute: function() {
      currentActionSet.set(ActionSet.BASE_ACTIONS)
    }, 
  },
  {
    id: 1,
    locked: false,
    label: "examine your surroundings",
    execute: function() {
      actionFlagStore.toggle('locked', {id: 2, set: false}, {id: 3, set: false})
      actionFlagStore.toggle('disabled', {id: 1, set: true})
      storyBookStore.add(this.storyId, ActionSet.CAVE_CHAMBER)
    },
    storyId: 1
  },
  {
    id: 2,
    locked: true,
    label: "open the gate",
    execute: function() {
      storyBookStore.add(this.storyId, ActionSet.CAVE_CHAMBER)
    },
    storyId: 2
  },
  {
    id: 3,
    locked: true,
    label: "knock on the gate",
    execute: function() {
      storyBookStore.add(this.storyId, ActionSet.CAVE_CHAMBER)
    },
    storyId: 3
  }
  
]
const forestVillage: Action[] = [
  {
    id: 0,
    locked: false,
    label: "return to the cave",
    execute: function() {
      currentActionSet.set(ActionSet.BASE_ACTIONS)
    },
  },
  {
    id: 1,
    locked: false,
    label: "\"Is this heaven?\"",
    execute: function() {
      storyBookStore.add(this.storyId, ActionSet.FOREST_VILLAGE)
      actionFlagStore.toggle('locked', {id: 2, set: false}, {id: 3, set: false}, {id: 4, set: false})
      actionFlagStore.toggle('disabled', {id: 1, set: true})
    },
    storyId: 1
  },
  {
    id: 2,
    locked: true,
    label: "examine yourself",
    execute: function() {
      storyBookStore.add(this.storyId, ActionSet.FOREST_VILLAGE)
      actionFlagStore.toggle('disabled', {id: 2, set: true})
    },
    storyId: 2
  },
  {
    id: 3,
    locked: true,
    label: "\"How do I play this… ehm I mean survive in this world?\"",
    execute: function() {
      storyBookStore.add(this.storyId, ActionSet.FOREST_VILLAGE)
      actionFlagStore.toggle('locked', {id: 5, set: false})
      actionFlagStore.toggle('disabled', {id: 3, set: true})
    },
    storyId: 3
  },
  {
    id: 4,
    locked: true,
    label: "gather wood",
    execute: function() {
      resourceStore.addResource(ResourceType.WOOD, 1)
      storyBookStore.add(this.storyId, ActionSet.FOREST_VILLAGE)
    },
    storyId: 4,
    cooldown: GCD
  },
  {
    id: 5,
    locked: true,
    label: "use some bones",
    execute: function() {
      // TODO: if essence < 10, send message/log that not enough essence!
      
      if (get(resourceStore)[0].amount < 5) {
        //TODO: send message that not enough bones!
        return
      }
      storyBookStore.add(this.storyId, ActionSet.FOREST_VILLAGE)
      actionFlagStore.toggle('locked', {id: 6, set: false})
      resourceStore.addResource(ResourceType.ESSENCE, 1)
      resourceStore.addResource(ResourceType.BONES, -5)
    },
    storyId: 5,
    cooldown: GCD
  },
  {
    id: 6,
    locked: true,
    label: "summon an undead",
    execute: function() {
      storyBookStore.add(this.storyId, ActionSet.FOREST_VILLAGE)
    },
    storyId: 6,
    cooldown: GCD
  },
  {
    id: 7,
    locked: true,
    label: "build a home for your skeletons",
    execute: function() {
      storyBookStore.add(this.storyId, ActionSet.FOREST_VILLAGE)
    },
    storyId: 7
  },
]


// IF made into a store, could probably be a derived store from currentActionSet and LockedActions (for the methods)
export const actionTree = new Map<ActionSet, Action[]>([
  [ActionSet.BASE_ACTIONS, baseActions],
  [ActionSet.CAVE_CHAMBER, caveChamber],
  [ActionSet.FOREST_VILLAGE, forestVillage],
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
      [ActionSet.CAVE_CHAMBER]: {
        locked: initLockedArray(ActionSet.CAVE_CHAMBER),
        disabled: initDisabledArray(ActionSet.CAVE_CHAMBER)
      },
      [ActionSet.FOREST_VILLAGE]: {
        locked: initLockedArray(ActionSet.FOREST_VILLAGE),
        disabled: initDisabledArray(ActionSet.FOREST_VILLAGE)
      }
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
      [ActionSet.CAVE_CHAMBER]: [],
      [ActionSet.FOREST_VILLAGE]: [],
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
