import type { Equation } from './types'

/**
 * Multiply two 2-digit numbers with the same first digit
 * and last digits that sum to 10 (e.g. 23 × 27)
 */
export function generate(): Equation {
  const tens = Math.floor(Math.random() * 9) + 1   // 1–9 for first digit
  const u1 = Math.floor(Math.random() * 10)        // 0–9 for first units
  const u2 = 10 - u1                               // second units so sum is 10

  // If u1 is 10, set u1=0 (for 10–0) and u2=10-0=10, but 2-digit numbers need units in [0,9]
  if (u2 > 9) {
    // Avoid cases where units would be 10 (invalid)
    return generate()
  }

  const a = tens * 10 + u1
  const b = tens * 10 + u2

  return {
    question: `${a} × ${b} =`,
    answer: a * b,
  }
}

export const title = "Ones Same, Tens Sum 10"
export const description = "First digit is the same for both numbers, final digits sum to ten"
