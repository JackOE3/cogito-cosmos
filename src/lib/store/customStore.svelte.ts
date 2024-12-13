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

// works but referencing the variable is tedious: {name.state}
export function makeState<T>(initialState: T) {
    let value = $state(initialState)

    return {
        get value() {
            return value
        },
        set value(v: T) {
            value = v
        },
        reset() {
            value = initialState
        }
    }
}
/* const test = makeState({ a: 1, c: 2 })

console.log($state.snapshot(test.value.a))
test.value.a = 10
console.log($state.snapshot(test.value.a))
test.reset()
console.log($state.snapshot(test.value.a)) */

/* let test2 = makeState(0)
console.log($state.snapshot(test2.value))
test2.value++
console.log($state.snapshot(test2.value))
test2.reset()
console.log($state.snapshot(test2.value)) */

/**
 * Removes all references to an object or variable.
 * @param obj
 * @returns real copy of obj
 */
export function noRef<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T
}
