import { writable, type Writable } from 'svelte/store'
import { noRef } from '../gamelogic/utils'

console.log('customStore.ts')

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

/* export function makeStore2(initialState: unknown) {
  // important to wrap it in noRef() !!
  const store = writable(noRef(initialState))
  const reset = (): void => {
    store.set(noRef(initialState))
  }
  const add = (resource: string, n: number): void => {
    store.update($store => {
      if (typeof $store[resource] === 'number') ($store[resource] as number) += n
    })
    return store
  }
  return { ...store, reset, add }
} */
