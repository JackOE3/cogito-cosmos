import { makeStore } from '../customStore'

export const ADMIN_MODE = makeStore(true)
export const LORCA_OVERRIDE = makeStore(true)
export const devToolsEnabled = makeStore(false)
