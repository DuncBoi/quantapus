import type { Equation } from './types'

/**
 * Two‑digit multiplication (10–99)
 */
export function generate(): Equation {
  const a = Math.floor(Math.random() * 90) + 10
  const b = Math.floor(Math.random() * 90) + 10
  return { question: `${a} × ${b} =`, answer: a * b }
}
