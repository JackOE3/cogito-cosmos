const suffixes = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'Dc']
const suffixesB = ['K', 'M', 'G', 'T', 'P', 'E']
const OOMs = [1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30, 1e33]

/**
 * Function to format a number for display on screen.
 * @param input Number to format
 * @param decimals How many decimals do you want
 */
export function formatNumber(input: number, decimals: number): string {
  if (typeof input !== 'number') input = 0
  if (input < 0) return '-' + formatNumber(-1 * input, decimals)
  if (input >= OOMs[suffixes.length]) return input.toExponential(decimals).replace('+', '')

  for (let i = suffixes.length - 1; i >= 0; i--) {
    if (input >= OOMs[i]) return (input / OOMs[i]).toFixed(decimals) + suffixes[i]
  }

  return input.toFixed(decimals)
}
export function formatNumber2(input: number, decimals: number): string {
  if (typeof input !== 'number') input = 0
  if (input < 0) return '-' + formatNumber(-1 * input, decimals)
  if (input >= OOMs[suffixesB.length]) return input.toExponential(decimals).replace('+', '')

  for (let i = suffixesB.length - 1; i >= 0; i--) {
    if (input >= OOMs[i]) return (input / OOMs[i]).toFixed(decimals) + suffixesB[i]
  }

  return input.toFixed(decimals)
}

/**
 * Function to format a number for display on screen.
 * Will only show decimal places when the number is abbreviated.
 * @param input Number to format
 */
export function formatWhole(input: number): string {
  if (typeof input !== 'number') input = 0
  if (input < 0) return '-' + formatWhole(-1 * input)
  if (input < 1e3) return formatNumber(input, 0)
  return formatNumber(input, 2)
}

export function formatResourceName(name: string): string {
  if (name === 'moldyCheese') return 'moldy cheese'
  if (name === 'cheeseBrains') return 'cheese brains'
  return name
}

export function formatTime(sec: number): string {
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor(sec / 60 - 60 * hours)
  const seconds = Math.floor(sec % 60)
  if (sec >= 3600) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  if (sec >= 60) return `${minutes}:${seconds.toString().padStart(2, '0')}`
  if (sec >= 1e-1) return `${formatNumber(sec, 2)}s`
  if (sec >= 1e-4) return `${formatNumber(sec * 1000, 2)}ms`
  return `${formatNumber(sec * 1000, 2)}µs`
}

/**
 * Removes all references to an object or variable.
 * @param obj
 * @returns real copy of obj
 */
export function noRef<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

export const baseLog = (base: number, x: number): number => {
  return Math.log(x) / Math.log(base)
}

export function checkBoolForNum(bool: boolean, num: number, or = 1): number {
  return bool ? num : or
}

export function easeInQuad(x: number): number {
  if (x >= 1) return 1
  return x * x
}
export function easeInOutQuad(x: number): number {
  if (x >= 1) return 1
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}
export function easeInOutSine(x: number): number {
  if (x >= 1) return 1
  return -(Math.cos(Math.PI * x) - 1) / 2
}
