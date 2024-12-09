import { currentNotation, type Notation } from '$lib/store/primitive/misc'

// prettier-ignore
const suffixesDefault = [
  'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od',
  'Nd','V', 'Uv', 'Dv','Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tt'
]
// prettier-ignore
const suffixesLetters = [
  'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'al', 'am', 'an', 'ao', 'ap',
  'aq', 'ar', 'as', 'at', 'au', 'av', 'aw', 'ax', 'ay', 'az', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'bg', 'bh', 'bi'
]
// prettier-ignore
const suffixesEngineering = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R', 'Q']

let currNotation: Notation
currentNotation.subscribe($currentNotation => {
  currNotation = $currentNotation
})
/**
 * Function to format a number for display on screen.
 * @param input Number to format
 * @param decimals How many decimals do you want
 */
export function formatNumber(input: number, decimals: number, notation = currNotation): string {
  if (typeof input !== 'number') input = 0
  if (input === 0) return input.toFixed(decimals)
  if (input < 0) return '-' + formatNumber(-1 * input, decimals)

  if (notation === 'scientific' && input >= 10) {
    return input.toExponential(decimals).replace('+', '')
  }

  const base = Math.floor(baseLog(1e3, input))
  if (notation === 'default' && base > 0) {
    if (base > suffixesDefault.length) return input.toExponential(decimals).replace('+', '')
    return (input / Math.pow(1e3, base)).toFixed(decimals) + (base > 0 ? suffixesDefault[base - 1] : '')
  }
  if (notation === 'letters' && base > 0) {
    if (base > suffixesLetters.length) return input.toExponential(decimals).replace('+', '')
    return (input / Math.pow(1e3, base)).toFixed(decimals) + (base > 0 ? suffixesLetters[base - 1] : '')
  }

  return input.toFixed(decimals)
}

/**
 * Function to format a number for display on screen.
 * Will only show decimal places when the number is abbreviated.
 * @param input Number to format
 */
export function formatWhole(input: number, notation = currNotation): string {
  if (typeof input !== 'number') input = 0
  if (input < 0) return '-' + formatWhole(-1 * input)
  if (input < 1e3) return formatNumber(input, 0, notation)
  return formatNumber(input, 2, notation)
}

export function formatResourceName(name: string): string {
  if (name === 'moldyCheese') return 'moldy cheese'
  if (name === 'cheeseBrains') return 'cheese brains'
  return name
}

export function formatTime(sec: number, digits = 2): string {
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor(sec / 60 - 60 * hours)
  const seconds = Math.floor(sec % 60)
  if (sec >= 3600) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  if (sec >= 60) return `${minutes}:${seconds.toString().padStart(2, '0')}`
  if (sec >= 1e-1) return `${formatNumber(sec, digits)}s`
  if (sec >= 1e-4) return `${formatNumber(sec * 1000, digits)}ms`
  return `${formatNumber(sec * 1000, digits)}µs`
}

export const baseLog = (base: number, x: number): number => {
  return Math.log(x) / Math.log(base)
}

export function checkBoolForNum(bool: boolean, num: number, or = 1): number {
  return bool ? num : or
}

export function getOffset(el: HTMLElement): { left: number; top: number } {
  const rect = el.getBoundingClientRect()
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  }
}

export const costColor = (canAfford: boolean): string => (canAfford ? 'rgb(102, 255, 102)' : 'rgb(255, 102, 102)')

export function nameof<T extends object>(
  obj: T,
  expression: (x: { [Property in keyof T]: () => string }) => () => string
): string {
  const res: { [Property in keyof T]: () => string } = {} as { [Property in keyof T]: () => string }

  Object.keys(obj).map(k => (res[k as keyof T] = () => k))

  return expression(res)()
}
