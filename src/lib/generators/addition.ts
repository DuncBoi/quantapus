import type { Equation } from './types'

/**
 * Add two random n-digit numbers (where n is picked independently for each operand from allowedDigits).
 * @param allowedDigits Array of allowed digit counts (e.g., [2, 3])
 */
export function generate(allowedDigits: number[] = [2]): Equation {
  if (!allowedDigits.length) throw new Error('No allowed digits provided')

  // Pick random digit counts for each operand
  const digitsA = allowedDigits[Math.floor(Math.random() * allowedDigits.length)]
  const digitsB = allowedDigits[Math.floor(Math.random() * allowedDigits.length)]

  const minA = Math.pow(10, digitsA - 1)
  const maxA = Math.pow(10, digitsA) - 1
  const minB = Math.pow(10, digitsB - 1)
  const maxB = Math.pow(10, digitsB) - 1

  const a = Math.floor(Math.random() * (maxA - minA + 1)) + minA
  const b = Math.floor(Math.random() * (maxB - minB + 1)) + minB

  return { question: `${a} + ${b} =`, answer: a + b }
}

export const title = "Random Addition"
export const description = "Generates random addition problems using numbers of allowed digit lengths."
