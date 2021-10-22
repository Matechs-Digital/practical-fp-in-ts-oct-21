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
import * as M from "@effect-ts/core/Effect/Managed"
import { pipe } from "@effect-ts/core/Function"
import { tag } from "@effect-ts/core/Has"
import * as R from "@effect-ts/node/Runtime"
import type { _A } from "@effect-ts/system/Utils"
import * as fs from "fs"

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

export const makeLiveConsole = T.succeedWith(() => ({
  log: (msg: string) =>
    T.succeedWith(() => {
      console.log(msg)
    })
}))

export interface ConsoleService extends _A<typeof makeLiveConsole> {}

export const ConsoleService = tag<ConsoleService>()

export const LiveConsole = pipe(makeLiveConsole, T.toLayer(ConsoleService))

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

  if (x >= 0.5) {
    yield* _(info(`got number: ${x}`))
  } else {
    yield* _(T.fail(new InvalidRandom({ invalidRandom: x })))
  }

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

export const LiveLoggerToFile = L.fromManaged(LoggerService)(
  M.gen(function* (_) {
    const stream = yield* _(
      pipe(
        T.succeedWith(() => fs.createWriteStream("output.log", { flags: "a" })),
        M.makeExit((stream) =>
          T.effectAsync((resume) => {
            stream.on("finish", () => {
              resume(T.unit)
            })
            stream.end()
          })
        )
      )
    )

    return {
      info: (msg) =>
        T.succeedWith(() => stream.write(Buffer.from(`[info]: ${msg}\n`, "utf-8")))
    }
  })
)

export const ConsoleBasedLogger = LiveConsole[">>>"](LiveLogger)

export const AppDependencies = LiveRandom["+++"](LiveLoggerToFile)

export const main = pipe(program, T.provideSomeLayer(AppDependencies))

// unsafe
R.runMain(main)
