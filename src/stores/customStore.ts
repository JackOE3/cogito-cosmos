import { writable } from 'svelte/store'
import { noRef } from '../gamelogic/utils'

export function makeStore<T>(initialState: T) {
  // important to wrap it in noRef() !!
  const store = writable<T>(noRef(initialState))
  const refresh = () => store.update(($store) => $store)
  const reset = () => {
    store.set(noRef(initialState))
  }
  return { ...store, reset, refresh }
}

export function makeStore2<T>(initialState: T) {
  // important to wrap it in noRef() !!
  const store = writable(noRef(initialState))
  const reset = () => {
    store.set(noRef(initialState))
  }
  const add = (what: string, n: number) => {
    store.update(($store) => {
      $store[what] += n
    })
    return store
  }
  return { ...store, reset, add }
}
