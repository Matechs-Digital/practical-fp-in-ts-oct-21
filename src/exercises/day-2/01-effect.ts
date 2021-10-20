import * as T from "@effect-ts/core/Effect"
import { Tagged } from "@effect-ts/system/Case"
import { pipe } from "@effect-ts/system/Function"

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const oneLazy = T.succeedWith(() => {
  throw new Error("here")
  return 1
})

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const errorLazy = T.failWith(() => "error")

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const dieLazy = T.dieWith(() => "error")

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const unit = T.unit

/**
 * Exercise:
 *
 * Try and test the method T.map
 */
export const useMap = pipe(
  T.succeed(1 as const),
  T.map((n) => `got: ${n + 1}` as const)
)

/**
 * Exercise:
 *
 * Try and test the method T.chain
 */
export const useChain = pipe(
  T.succeed(1 as const),
  T.chain((n) =>
    T.accessM((_: { log: (_: string) => T.UIO<void> }) => _.log(`logging: ${n}`))
  )
)

/**
 * Exercise:
 *
 * Write a program that generates a random number between 0 and 1
 * using Math.random and that fail with an InvalidNumber error in
 * case the number is < 0.5 and succeeds with the number otherwise
 */
export class InvalidNumber extends Tagged("InvalidNumber")<{
  readonly invalidNumber: number
}> {}

const random = T.accessM((r: { random: T.UIO<number> }) => r.random)

export const randomGteHalf = pipe(
  random,
  T.tap((n) =>
    T.when(() => n < 0.5)(T.failWith(() => new InvalidNumber({ invalidNumber: n })))
  )
)

/**
 * Exercise:
 *
 * Try and test the method T.tap, improve the program above to use T.tap
 */

/**
 * Exercise:
 *
 * Test the randomGteHalf program, you will need to move the dependency on
 * Math.random to be a requirement (R) using T.accessM and provide the
 * dependency (mocked) in the test
 */

/**
 * Exercise:
 *
 * Handle the InvalidRandom failure using T.catchAll returning 1 as success
 * in case of failures
 */

/**
 * Exercise:
 *
 * Test the following functions:
 * 1) T.catchAllCause
 * 2) T.foldM
 * 3) T.foldCauseM
 * 4) T.result
 * 5) T.tapError
 * 6) T.tapBoth
 * 7) T.tapCause
 * 8) T.catch
 * 9) T.catchTag
 * 10) T.bracket
 */

/**
 * Exercise:
 *
 * Write a program that generates 2 valid random numbers and returns the sum
 */

/**
 * Exercise:
 *
 * Rewrite the same program using pipe(T.do, T.bind("a", () => ...), T.bind("b", () => ...), T.map)
 */

/**
 * Exercise:
 *
 * Rewrite the same program using T.gen
 */

/**
 * Exercise:
 *
 * Test the following constructors:
 *
 * 1) T.promise
 * 2) T.tryPromise
 * 3) T.tryCatchPromise
 * 4) T.tryCatch
 * 5) T.effectAsync
 * 6) T.effectAsyncInterrupt
 * 7) T.delay
 * 8) T.sleep
 */

/**
 * Exercise:
 *
 * Build a `fetch` wrapper that returns an effect. Use AbortController to handle the interruption.
 */

/**
 * Exercise:
 *
 * Test a live call to https://jsonplaceholder.typicode.com/todos/1
 */

/**
 * Exercise:
 *
 * Test the following functions:
 *
 * 1) T.tuple
 * 2) T.tuplePar
 * 3) T.tupleParN
 * 4) T.struct
 * 5) T.structPar
 * 6) T.structParN
 */

/**
 * Exercise:
 *
 * Test the following functions:
 *
 * 1) T.forEach
 * 2) T.forEachPar
 * 3) T.forEachParN
 */
