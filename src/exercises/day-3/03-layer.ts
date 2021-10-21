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
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"

import { ConsoleService } from "./02-services"

export const LiveConsole = L.fromEffect(ConsoleService)(
  T.succeedWith(() => ({
    log: (msg) =>
      T.succeedWith(() => {
        console.log(msg)
      })
  }))
)

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
