import type { Equation } from './types'

/**
 * Multiply a random n-digit number (where n is picked from allowedDigits) by 11,
 * with 11 sometimes first, sometimes second.
 * @param allowedDigits Array of allowed digit counts (e.g., [2, 3])
 */
export function generate(allowedDigits: number[] = [2]): Equation {
  if (!allowedDigits.length) throw new Error('No allowed digits provided')

  // Pick a random digit count from the allowed options
  const digits = allowedDigits[Math.floor(Math.random() * allowedDigits.length)]
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1

  const other = Math.floor(Math.random() * (max - min + 1)) + min
  const firstIs11 = Math.random() < 0.5
  const a = firstIs11 ? 11 : other
  const b = firstIs11 ? other : 11

  return { question: `${a} × ${b} =`, answer: a * b }
}

export const title = "Multiply by 11"
export const description = "Generates random numbers where one of them is always 11"
