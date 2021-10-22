/**
 * Theory:
 *
 * Introduction to the Fiber module: Fibers can be considered as lightweight threads, they are the backing system of the Effect data type.
 *
 * Fibers are the result of either running an effect or forking a child effect from a parent
 *
 * Once created Fibers can be joined, awaited and composed toghether with other fibers in multiple ways
 */

/**
 * Exercise:
 *
 * Write a program that forks two copies of the same sub-program.
 *
 * The sub-program should print to the console a progressive counter starting from 0 every second.
 *
 * Hint: use T.fork to launch the proccessed and F.join to wait
 */

/**
 * Exercise:
 *
 * Explore the Fiber module API.
 */
import "@effect-ts/core/Tracing/Enable"
import "isomorphic-fetch"
import "abortcontroller-polyfill/dist/polyfill-patch-fetch"

import * as T from "@effect-ts/core/Effect"
import * as F from "@effect-ts/core/Effect/Fiber"
import * as R from "@effect-ts/node/Runtime"
import { pipe } from "@effect-ts/system/Function"

import { _fetchJson } from "../day-2/01-effect"

const program = T.gen(function* (_) {
  const fetch0 = yield* _(
    T.fork(_fetchJson(`https://jsonplaceholder.typicode.com/todos/1`))
  )
  const fetch1 = yield* _(
    T.fork(_fetchJson(`https://jsonplaceholder.typicode.com/todos/2`))
  )

  return [yield* _(F.join(fetch0)), yield* _(F.join(fetch1))] as const
})

export const main = pipe(
  program,
  T.chain((out) =>
    T.succeedWith(() => {
      console.log(out)
    })
  )
)

R.runMain(main)
