// src/lib/generators/index.ts
import type { Equation } from './types'

/**
 * Given an array of generator “ids” (which correspond
 * exactly to filenames in this folder), dynamically
 * import each one and grab its `generate()` function.
 */
export async function loadGenerators(
  ids: string[]
): Promise<Array<() => Equation>> {
  const loaders = ids.map(id =>
    import(`./${id}`)
      .then(mod => {
        if (typeof mod.generate !== 'function') {
          throw new Error(`"${id}" has no generate() export`)
        }
        return mod.generate as () => Equation
      })
  )
  return Promise.all(loaders)
}

/** Pick one of the loaded generators at random and run it */
export function pickRandom(
  gens: Array<() => Equation>
): Equation {
  const idx = Math.floor(Math.random() * gens.length)
  return gens[idx]()
}
