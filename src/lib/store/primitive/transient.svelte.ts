import { makeState } from '../customStore.svelte'

// these variables dont get saved (hence transient)
export const ADMIN_MODE = makeState(true)
export const LORCA_OVERRIDE = makeState(true)
export const devToolsEnabled = makeState(false)
export const fastFowardFactor = makeState(1)

export const devCheat = makeState(0)
