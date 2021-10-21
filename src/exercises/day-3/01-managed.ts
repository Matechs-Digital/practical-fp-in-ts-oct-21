/**
 * Theory:
 *
 * Introduction to the Managed module, Managed is used to model managed resources, you can think of a managed resource like a pair of:
 *
 * 1) an effect to construct a resource
 * 2) an effect to cleanup the resource
 *
 * Managed can be used, for example, to represent things like database connections, when used Managed makes sure to always run finalisation
 * while keeping track of all errors while they happen.
 */

/**
 * Exercise:
 *
 * Import the module `import * as M from "@effect-ts/core/Effect/Managed"`
 *
 * The functions available in the module mirror closely the ones available in Effect, give a try to:
 *
 * 1) M.fromEffect
 * 2) M.makeExit
 * 3) M.map
 * 4) M.chain
 * 5) M.catchAll
 * 6) M.foldM
 * 7) M.access
 * 8) M.accessM
 * 9) M.provide
 * 10) M.gen (also supports running Effect directly)
 *
 * Note: to use a managed you will need pipe(managed, M.use((resource) => effect))
 */

import * as T from "@effect-ts/core/Effect"
import * as M from "@effect-ts/core/Effect/Managed"
import * as R from "@effect-ts/core/Effect/Random"
import { pipe } from "@effect-ts/core/Function"
import type { Has } from "@effect-ts/core/Has"

export const managedArray: M.Managed<Has<R.Random>, string, string[]> = pipe(
  R.nextIntBetween(0, 100),
  T.chain((n) => (n < 50 ? T.fail("error") : T.succeedWith((): string[] => []))),
  M.makeExit((resource) =>
    T.succeedWith(() => {
      console.log(resource.splice(0))
    })
  ),
  M.catchAll(() => managedArray)
)

export const programDependencies = pipe(
  M.do,
  M.bind("resourceA", () => managedArray),
  M.bind("resourceB", () => managedArray)
)

export const programUsingManagedArray = pipe(
  programDependencies,
  M.use(({ resourceA, resourceB }) =>
    T.tuple(
      T.succeedWith(() => {
        resourceA.push("message 1 for A")
        resourceB.push("message 1 for B")
      }),
      T.succeedWith(() => {
        resourceA.push("message 2 for A")
        resourceB.push("message 2 for B")
      })
    )
  )
)
