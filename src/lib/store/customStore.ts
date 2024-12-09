import { writable, type Writable } from 'svelte/store'

export interface baseStore<T> extends Writable<T> {
  refresh: () => void
  reset: () => void
}

export function makeStore<T>(initialState: T): baseStore<T> {
  // important to wrap it in noRef() !!
  const store = writable<T>(noRef(initialState))
  const refresh = (): void => {
    store.update($store => $store)
  }
  const reset = (): void => {
    store.set(noRef(initialState))
  }
  return { ...store, reset, refresh }
}

/**
 * Removes all references to an object or variable.
 * @param obj
 * @returns real copy of obj
 */
export function noRef<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}
