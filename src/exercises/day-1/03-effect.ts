import * as T from "@effect-ts/core/Effect"

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
 * Test the output of the following program,
 * you will need to use T.provideAll to provide the required environment
 */
export const read = T.access((_: { input: string }) => _.input)
