// src/lib/generators/index.ts
import type { Equation } from './types'

/**
 * Shape for generator metadata & loader
 */
export type GeneratorMeta = {
  id: string
  title: string
  description: string
  generate: () => Equation
}

/**
 * Dynamically import generator modules by ID, grabbing
 * metadata and creating a closure that calls generate() with digits.
 * Returns an array of metadata+function objects.
 */
export async function loadGeneratorsWithMeta(
  ids: string[],
  digitOptions: Record<string, number[]>
): Promise<GeneratorMeta[]> {
  const loaders = ids.map(async id => {
    const mod = await import(`./${id}`)
    if (typeof mod.generate !== 'function') {
      throw new Error(`"${id}" has no generate() export`)
    }
    return {
      id,
      title: mod.title ?? id,
      description: mod.description ?? '',
      generate: () => mod.generate(digitOptions[id]),
    }
  })
  return Promise.all(loaders)
}

/**
 * If you only want generator functions, use this helper.
 */
export async function loadGenerators(
  ids: string[],
  digitOptions: Record<string, number[]>
): Promise<Array<() => Equation>> {
  const metas = await loadGeneratorsWithMeta(ids, digitOptions)
  return metas.map(m => m.generate)
}

/**
 * Pick a random element from an array.
 * Throws if array is empty.
 */
export function pickRandom<T>(arr: T[]): T {
  if (!arr.length) throw new Error('Cannot pick random element from empty array')
  const idx = Math.floor(Math.random() * arr.length)
  return arr[idx]
}
