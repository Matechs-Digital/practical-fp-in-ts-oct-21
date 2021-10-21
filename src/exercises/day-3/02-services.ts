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
import { pipe } from "@effect-ts/core/Function"
import { tag } from "@effect-ts/core/Has"

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
  return pipe(
    T.do,
    T.bind("x", () => div(100, n)),
    T.bind("y", () => add(100, n)),
    T.bind("z", () => sub(100, n)),
    T.bind("h", ({ x, y }) => sub(x, y)),
    T.bind("s", ({ h, z }) => mul(z, h)),
    T.map(({ h }) => h)
  )
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
