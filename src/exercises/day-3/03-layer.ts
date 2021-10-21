/**
 * Exercise:
 *
 * Import the module `import * as L from "@effect-ts/core/Effect/Layer"`,
 *
 * note: you provide a layer to an effect using T.provideSomeLayer (where T is the Effect module)
 */
/**
 * Exercise:
 *
 * Test the following functions:
 *
 * L.fromEffect
 * L.fromManaged
 * +++ operator
 * >+> operator
 * <+< operator
 */
import { Tagged } from "@effect-ts/core/Case"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import { pipe } from "@effect-ts/core/Function"
import { tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/system/Utils"

export const makeLiveConsole = T.succeedWith(() => ({
  log: (msg: string) =>
    T.succeedWith(() => {
      console.log(msg)
    })
}))

export interface ConsoleService extends _A<typeof makeLiveConsole> {}

export const ConsoleService = tag<ConsoleService>()

export const LiveConsole = L.fromEffect(ConsoleService)(makeLiveConsole)

export const { log } = T.deriveLifted(ConsoleService)(["log"], [], [])

export interface LoggerService {
  info(msg: string): T.Effect<unknown, never, void>
}

export const LoggerService = tag<LoggerService>()
export const { info } = T.deriveLifted(LoggerService)(["info"], [], [])

export interface RandomGeneratorService {
  random: T.Effect<unknown, never, number>
}

export const RandomGeneratorService = tag<RandomGeneratorService>()
export const { random } = T.deriveLifted(RandomGeneratorService)([], ["random"], [])

export class InvalidRandom extends Tagged("InvalidRandom")<{
  readonly invalidRandom: number
}> {}

export const program = T.gen(function* (_) {
  const x = yield* _(random)

  yield* _(
    T.if_(
      x >= 0.5,
      () => info(`got number: ${x}`),
      () => T.fail(new InvalidRandom({ invalidRandom: x }))
    )
  )

  return x
})

export const LiveRandom = L.fromEffect(RandomGeneratorService)(
  T.succeedWith(() => ({
    random: T.succeedWith(() => Math.random())
  }))
)

export const LiveLogger = L.fromEffect(LoggerService)(
  T.gen(function* (_) {
    const { log } = yield* _(ConsoleService)

    return {
      info: (msg) => log(`[info]: ${msg}`)
    }
  })
)

export const ConsoleBasedLogger = LiveConsole[">>>"](LiveLogger)

export const AppDependencies = LiveRandom["+++"](ConsoleBasedLogger)

export const main = pipe(program, T.provideSomeLayer(AppDependencies), T.runPromise)

/**
 * Exercise:
 *
 * Model the dependency tree of the program built in the previous model using layers
 */

/**
 * Extension:
 *
 * Implement a logger that writes all messages into a file
 *
 * Note: a file is a resource that should be opened before your program runs and closed after
 */
