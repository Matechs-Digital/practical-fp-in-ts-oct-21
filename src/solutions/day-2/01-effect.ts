/**
 * Exercise:
 *
 * Test the following functions:
 *
 * 1) T.forEach
 * 2) T.forEachPar
 * 3) T.forEachParN
 */
import * as T from "@effect-ts/core/Effect"
import * as Cause from "@effect-ts/core/Effect/Cause"
import { pretty } from "@effect-ts/core/Effect/Cause"
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

interface RandomGeneratorService {
  random: T.UIO<number>
}

const random = T.accessM((r: RandomGeneratorService) => r.random)

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
export const randomOrOne = pipe(
  randomGteHalf,
  T.catchTag("InvalidNumber", (_) => T.succeedWith(() => 1))
)

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

export const randomOrOne2 = pipe(
  randomGteHalf,
  T.orDie,
  T.catchAllCause((_) =>
    Cause.defects(_).findIndex((x) => x instanceof InvalidNumber) >= 0
      ? T.succeedWith(() => 1)
      : T.halt(_)
  )
)

export const randomOutput = pipe(
  randomGteHalf,
  T.foldM(
    (_) => T.succeedWith(() => `I've got an invalid number: ${_.invalidNumber}`),
    (_) => T.succeedWith(() => `I've got: ${_}`)
  )
)

export const randomOutput2 = pipe(
  randomGteHalf,
  T.foldCauseM(
    (_) => T.succeedWith(() => `I've got a failure: ${pretty(_)}`),
    (_) => T.succeedWith(() => `I've got: ${_}`)
  )
)

/**
 * Exercise:
 *
 * Write a program that generates 2 valid random numbers and returns the sum
 */
export const randomSum = pipe(
  randomGteHalf,
  T.chain((x) =>
    pipe(
      randomGteHalf,
      T.map((y) => x + y)
    )
  )
)

/**
 * Exercise:
 *
 * Rewrite the same program using pipe(T.do, T.bind("a", () => ...), T.bind("b", () => ...), T.map)
 */

export const randomSum2 = pipe(
  T.do,
  T.bind("x", () => randomGteHalf),
  T.bind("y", () => randomGteHalf),
  T.bind("z", () => randomGteHalf),
  T.bind("r", ({ x, y, z }) => T.succeedWith(() => x + y + z)),
  T.map((_) => _.r)
)

export const res = T.gen(function* (_) {
  const x = yield* _(randomGteHalf)
  const y = yield* _(randomGteHalf)
  const z = yield* _(randomGteHalf)
  const r = yield* _(T.succeedWith(() => x + y + z))
  while ((yield* _(randomGteHalf)) > 0) {
    yield* _(
      T.succeedWith(() => {
        console.log("ok")
      })
    )
  }
  return r
})

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
export class FetchException extends Tagged("FetchException")<{
  readonly error: unknown
}> {}

export class MalformedJsonResponse extends Tagged("MalformedJsonResponse")<{
  readonly error: unknown
}> {}

export const fetchRequest = T.tryCatchPromise(
  () => fetch("https://jsonplaceholder.typicode.com/todos/1"),
  (error) => new FetchException({ error })
)

export const fetchRequest2 = T.effectAsync<unknown, FetchException, Response>(
  (resume) => {
    fetch("https://jsonplaceholder.typicode.com/todos/1").then(
      (res) => {
        resume(T.succeed(res))
      },
      (error) => {
        resume(T.fail(new FetchException({ error })))
      }
    )
  }
)

export const fetchRequest3 = T.effectAsyncInterrupt<unknown, never, void>((resume) => {
  console.log("STARTED")
  const timer = setTimeout(() => {
    resume(T.unit)
    console.log("HERE")
  }, 100)

  return T.succeedWith(() => {
    clearTimeout(timer)
    console.log("INTERRUPTED")
  })
})

/**
 * Exercise:
 *
 * Build a `fetch` wrapper that returns an effect. Use AbortController to handle the interruption.
 */

export function _fetch(input: RequestInfo, init?: RequestInit) {
  return T.effectAsyncInterrupt<unknown, FetchException, Response>((resume) => {
    const abort = new AbortController()
    fetch(input, { ...init, signal: abort.signal }).then(
      (res) => {
        resume(T.succeed(res))
      },
      (err) => {
        resume(T.fail(new FetchException(err)))
      }
    )
    return T.succeedWith(() => {
      abort.abort()
    })
  })
}

export function _fetchJson(
  input: RequestInfo,
  init?: RequestInit
): T.Effect<unknown, FetchException | MalformedJsonResponse, unknown> {
  return pipe(
    _fetch(input, init),
    T.chain((res) =>
      T.tryCatchPromise(
        (): Promise<unknown> => res.json(),
        (error) => new MalformedJsonResponse({ error })
      )
    )
  )
}
