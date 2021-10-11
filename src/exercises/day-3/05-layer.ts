/**
 * Exercise:
 *
 * Import the module `import * as L from "@effect-ts/core/Effect/Layer"` and test M.fromEffect,
 *
 * note: you provide a layer to an effect using T.provideSomeLayer (where T is the Effect module)
 */

/**
 * Exercise:
 *
 * Inspect the module functions and operators testing behaviour 1-by-1
 */
import { Tagged } from "@effect-ts/core/Case"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as M from "@effect-ts/core/Effect/Managed"
import * as Schedule from "@effect-ts/core/Effect/Schedule"
import { pipe } from "@effect-ts/core/Function"
import { tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/core/Utils"
import * as R from "@effect-ts/node/Runtime"

export const makeConfigLive = M.succeedWith(() => {
  return {
    _tag: "Config",
    prefix: "prefix: "
  } as const
})

export interface Config extends _A<typeof makeConfigLive> {}

export const Config = tag<Config>()

export const ConfigLive = L.fromManaged(Config)(makeConfigLive)

export const makeLoggerLive = M.gen(function* (_) {
  const { prefix } = yield* _(Config)
  return {
    _tag: "Logger",
    log: (message: string) =>
      T.succeedWith(() => {
        console.log(`${prefix}${message}`)
      })
  } as const
})

export interface Logger extends _A<typeof makeLoggerLive> {}

export const Logger = tag<Logger>()

export const LoggerLive = L.fromManaged(Logger)(makeLoggerLive)

export const makeRandGenLive = T.succeedWith(() => {
  return {
    _tag: "RandGen",
    rand: T.succeedWith(() => Math.random())
  } as const
})

export interface RandGen extends _A<typeof makeRandGenLive> {}

export const RandGen = tag<RandGen>()

export const { rand } = T.deriveLifted(RandGen)([], ["rand"], [])

export const RandGenLive = L.fromEffect(RandGen)(makeRandGenLive)

export class InvalidRandom extends Tagged("InvalidRandom")<{
  readonly number: number
}> {}

export const randomGteHalf = T.gen(function* (_) {
  const { log } = yield* _(Logger)
  const n = yield* _(rand)

  if (n < 0.5) {
    return yield* _(T.fail(new InvalidRandom({ number: n })))
  }

  yield* _(log(`got: ${n}`))
})

const LiveEnv = RandGenLive["+++"](ConfigLive[">+>"](LoggerLive))

export const main = pipe(
  randomGteHalf,
  T.retry(Schedule.recurs(10)["&&"](Schedule.exponential(100))),
  T.provideSomeLayer(LiveEnv)
)

R.runMain(main)
