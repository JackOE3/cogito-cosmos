import { currentNotation } from '$lib/store'

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

/**
 * Function to format a number for display on screen.
 * @param input Number to format
 * @param decimals How many decimals do you want
 */
export function formatNumber(input: number, decimals: number, notation = currentNotation.value): string {
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
export function formatWhole(input: number, notation = currentNotation.value): string {
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

export function randInt(max: number): number {
    return Math.floor(Math.random() * (max + 1))
}

export function formatFactor(factor: number): string {
    if (factor <= 2) return `${formatWhole(factor * 100)}%`
    else return `${formatNumber(factor, 2)}x`
}

export function getOffset(el: HTMLElement): { left: number; top: number } {
    const rect = el.getBoundingClientRect()
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    }
}

export function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}

export function randomChoice<T>(array: T[]): T {
    if (array.length === 0) {
        throw new Error('Array cannot be empty')
    }
    const randomIndex = Math.floor(Math.random() * array.length)
    return array[randomIndex]
}

/**
 *  Type guard to inform TypeScript that the result will no longer include undefined
 */
export const isDefined = <T>(value: T | undefined): value is T => typeof value !== 'undefined'

/**
 * Create a UUID.
 */
export function uuidv4(): string {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16))
}

export const square = {
    red: '<span style="color:#D32F2F">&#9670;</span>',
    green: '<span style="color:#388E3C">&#9670;</span>',
    blue: '<span style="color:#0288D1">&#9670;</span>'
} as const

export const costColor = (canAfford: boolean): string => (canAfford ? 'rgb(102, 255, 102)' : 'rgb(255, 102, 102)')

export const colors = (alpha: number) => ({
    red: `rgba(255, 0, 0, ${alpha})`,
    green: `rgba(0, 255, 0, ${alpha})`,
    blue: `rgba(0, 0, 255, ${alpha})`
})

export function nameof<T extends object>(obj: T, expression: (x: { [Property in keyof T]: () => string }) => () => string): string {
    const res: { [Property in keyof T]: () => string } = {} as { [Property in keyof T]: () => string }

    Object.keys(obj).map(k => (res[k as keyof T] = () => k))

    return expression(res)()
}

type RGBA = [number, number, number, number]
type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return [0, 0, 0]
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

function relative_luminance(color: RGB): number {
    // https://www.w3.org/TR/WCAG20/#relativeluminancedef
    let R, G, B
    const R_sRGB = color[0] / 255
    const G_sRGB = color[1] / 255
    const B_sRGB = color[2] / 255

    if (R_sRGB <= 0.03928) R = R_sRGB / 12.92
    else R = Math.pow((R_sRGB + 0.055) / 1.055, 2.4)
    if (G_sRGB <= 0.03928) G = G_sRGB / 12.92
    else G = Math.pow((G_sRGB + 0.055) / 1.055, 2.4)
    if (B_sRGB <= 0.03928) B = B_sRGB / 12.92
    else B = Math.pow((B_sRGB + 0.055) / 1.055, 2.4)

    return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function color_from_overlay(background: RGB, overlay: RGBA): RGB {
    const R = overlay[0] * overlay[3] + background[0] * (1 - overlay[3])
    const G = overlay[1] * overlay[3] + background[1] * (1 - overlay[3])
    const B = overlay[2] * overlay[3] + background[2] * (1 - overlay[3])
    return [R, G, B]
}

function contrast_ratio(L1: number, L2: number): number {
    // https://m2.material.io/design/color/dark-theme.html#properties
    return (L1 + 0.05) / (L2 + 0.05)
}
// highest overlay: 24dp = rgba(255,255,255,0.16)

/* const yellow200: RGB = hexToRgb('#FFF59D')
const defaultBGColor: RGB = hexToRgb('#121212')
console.log(color_from_overlay(defaultBGColor, [...yellow200, 0.08]))
const primary700: RGB = hexToRgb('#7B1FA2')
console.log('contrast primary600 to white:', contrast_ratio(1, relative_luminance(primary700)))

const primaryColor_8percent: RGBA = [206, 147, 216, 0.08]
const themedBackgroundColor: RGB = [51, 41, 64] // [51, 41, 64 ] vs [31, 26, 36]
// 18 18 18 = #121212 is default bg color
const themedBackgroundColorComputed = color_from_overlay([18, 18, 18], primaryColor_8percent)
console.log(themedBackgroundColor, themedBackgroundColorComputed)

console.log('white:', relative_luminance([255, 255, 255]))
console.log('black:', relative_luminance([0, 0, 0]))
console.log('#1f1a24 = rgb(31 26 36)', relative_luminance([31, 26, 36]))
console.log('#1f1a24 to white contrast ratio:', contrast_ratio(1, relative_luminance([31, 26, 36])))

const overlay_24dp: RGBA = [255, 255, 255, 0.16]
const elevated_color_24dp = color_from_overlay(themedBackgroundColor, overlay_24dp)
console.log('contast ratio to themedBGColor elevated:', contrast_ratio(1, relative_luminance(elevated_color_24dp))) */
