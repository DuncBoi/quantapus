import type { Equation } from './types'

export function generate(): Equation {
  const a = Math.floor(Math.random() * 900) + 100
  const b = Math.floor(Math.random() * 900) + 100
  return { question: `${a} + ${b} =`, answer: a + b }
}