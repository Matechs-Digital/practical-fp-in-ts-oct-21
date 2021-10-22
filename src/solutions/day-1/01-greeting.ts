import { pipe } from "@effect-ts/system/Function"

import * as IO from "./01-io"

function greeting(name: string): IO.IO<void> {
  return IO.fromSync(() => {
    console.log(`Hello: ${name}`)
  })
}
const x = pipe(
  IO.fromSync(() => 0),
  IO.map((n) => n + 1),
  IO.map((n) => `Hi: ${n}`),
  IO.flatMap(greeting)
)
IO.unsafeRun(x)
