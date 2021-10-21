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
// start recording
/**
 * Exercise:
 *
 * Import the module `import * as M from "@effect-ts/core/Effect/Managed"` and test M.makeExit,
 * to use a managed you will need pipe(managed, M.use((resource) => effect))
 */
/**
 * Exercise:
 *
 * The functions available in the module mirror closely the ones available in Effect, give a try to:
 *
 * 1) M.fromEffect
 * 2) M.makeExit
 * 2) M.map
 * 3) M.chain
 * 4) M.catchAll
 * 5) M.foldM
 * 6) M.access
 * 7) M.accessM
 * 8) M.provide
 * 9) M.gen (also supports running Effect directly)
 */

import * as T from "@effect-ts/core/Effect"
import * as M from "@effect-ts/core/Effect/Managed"
import { pipe } from "@effect-ts/core/Function"

export const managedArray = pipe(
  T.succeedWith((): string[] => []),
  M.makeExit((resource) =>
    T.succeedWith(() => {
      console.log(resource.splice(0))
    })
  )
)

export const programDependencies = pipe(
  managedArray,
  M.chain((resourceA) =>
    pipe(
      managedArray,
      M.map((resourceB) => ({ resourceA, resourceB }))
    )
  )
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
