import { Tagged } from "@effect-ts/core/Case"
import * as T from "@effect-ts/core/Effect"
import { pipe } from "@effect-ts/core/Function"
import type { Has } from "@effect-ts/core/Has"
import { tag } from "@effect-ts/core/Has"

/**
 * Theory:
 *
 * Introduction to Effect-TS and it's ecosystem in general and a more focused intro on Effect<R, E, A>
 */

/**
 * Running Effects:
 *
 * In order to run an effect one has to use one of the T.run* functions, we will begin using T.runPromiseExit that we will use in tests
 */

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const one = T.succeed(1)

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const error = T.fail("error" as const)

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const die = T.die("error")

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const read = T.access((_: { input: string }) => _.input)

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const oneLazy = T.succeedWith(() => 1)

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

/**
 * Exercise:
 *
 * Try and test the method T.chain
 */

/**
 * Exercise:
 *
 * Write a program that generates a random number between 0 and 1
 * using Math.random and that fail with an InvalidNumber error in
 * case the number is < 0.5 and succeeds with the number otherwise
 */
export const RandGenLive: RandGen = {
  _tag: "RandGen",
  rand: T.succeedWith(() => Math.random())
}

export interface RandGen {
  readonly _tag: "RandGen"
  readonly rand: T.UIO<number>
}

export const RandGen = tag<RandGen>()

export const { rand } = T.deriveLifted(RandGen)([], ["rand"], [])

export class InvalidRandom extends Tagged("InvalidRandom")<{
  readonly number: number
}> {}

export const randomGteHalf: T.Effect<Has<RandGen>, InvalidRandom, number> = pipe(
  rand,
  T.chain((n) => (n < 0.5 ? T.fail(new InvalidRandom({ number: n })) : T.succeed(n)))
)

export const randomGteHalfOr1 = pipe(
  randomGteHalf,
  T.catchAll(({ number }) => T.succeed(number + 0.5))
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
 * Write a program that generate 2 valid random numbers and returns the sum
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
