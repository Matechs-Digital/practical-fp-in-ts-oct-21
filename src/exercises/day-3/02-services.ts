/**
 * Theory:
 *
 * Introduction to the environmental effect pattern that uses R to abstract modules
 */

/**
 * Previously we used T.accessM and T.provideAll to access and provide environment,
 * that works but has a series of issues:
 *
 * 1) we need to pay attention to never have collisions between our services
 * 2) it is annoying to always have to type explicitely the requirements
 * 3) building up accessors helps usability but it is verbose
 */

/**
 * Introduction to the Tag & Has module.
 */

/**
 * Exercise:
 *
 * Write an interface to describe a MathService with 4 functions:
 *
 * 1) add (takes 2 numbers and return T.UIO<number> of the sum)
 * 2) mul (takes 2 numbers and return T.UIO<number> of the multiplication)
 * 3) sub (takes 2 numbers and return T.UIO<number> of the difference)
 * 4) div (takes 2 numbers and return T.IO<DivisionByZero, number> of the division)
 */
import { Tagged } from "@effect-ts/core/Case"
import * as T from "@effect-ts/core/Effect"
import { flow, pipe } from "@effect-ts/core/Function"
import type { Has } from "@effect-ts/core/Has"
import { tag } from "@effect-ts/core/Has"

import { InvalidNumber } from "../day-2/01-effect"

export class DivisionByZero extends Tagged("DivisionByZero")<{}> {}

export interface MathService {
  n: number
  add(x: number, y: number): T.Effect<unknown, never, number>
  mul(x: number, y: number): T.Effect<unknown, never, number>
  sub(x: number, y: number): T.Effect<unknown, never, number>
  div(x: number, y: number): T.Effect<unknown, DivisionByZero, number>
}

export const MathService = tag<MathService>()

/**
 * Exercise:
 *
 * Create a tag for the MathService named MathService using `tag<MathService>()` from @effect-ts/core/Has
 */

export const { add, div, mul, sub } = T.deriveLifted(MathService)(
  ["add", "div", "mul", "sub"],
  [],
  []
)

export function calculate(n: number) {
  return T.gen(function* (_) {
    const math = yield* _(MathService)

    const x = yield* _(math.div(100, n))
    const y = yield* _(math.add(100, n))
    const z = yield* _(math.sub(100, n))
    const h = yield* _(math.sub(x, y))
    const s = yield* _(math.mul(h, z))

    return s
  })
}

/**
 * Exercise:
 *
 * Test the following functions:
 *
 * 1) T.accessService
 * 2) T.accessServiceM
 * 3) T.provideService
 * 4) T.provideServiceM
 * 5) T.deriveLifted
 */

/**
 * Exercise:
 *
 * Write a small program that uses all the functions from MathService
 */

/**
 * Exercise:
 *
 * Tag can be used directly with the generator syntax, try to `yield* _(MathService)` in a T.gen
 */

/**
 * Graduation:
 *
 * We want to create a small program that firstly generates a random integer using RandomGeneratorService
 * then if the number is greater then 0.5 continues by logging it using the LoggerService (that depends on ConsoleService)
 * if it is less than 0.5 it returns a failure of InvalidRandom.
 *
 * While writing the program test all the possible outcomes.
 */
