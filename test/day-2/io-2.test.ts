import * as IO from "@app/exercises/day-2/02-io"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/system/Function"

describe("IO", () => {
  it("succeed", () => {
    const res = pipe(
      IO.succeedWith(() => 1),
      IO.run({})
    )
    expect(res).toEqual(E.right(1))
  })
  it("chain operations", () => {
    const res = pipe(
      IO.access(({ x }: { x: number }) => x),
      IO.chain((n) =>
        pipe(
          IO.access(({ y }: { y: string }) => y),
          IO.chain((s) => IO.failWith(() => `${s}${n}`))
        )
      ),
      IO.run({
        x: 1,
        y: "error: "
      })
    )
    expect(res).toEqual(E.left("error: 1"))
  })
  it("map", () => {
    const res = pipe(
      IO.access(({ fs }: { fs: () => string }) => fs()),
      IO.map((str) => `${str} :)`),
      IO.map((str) => str + "!"),
      IO.run({ fs: () => "test" })
    )
    expect(res).toEqual(E.right("test :)!"))
  })
  it("should recover", () => {
    const res = pipe(
      IO.access(({ fs }: { fs: () => string }) => fs()),
      IO.chain((_) => IO.fail(`ERROR!`)),
      IO.catchAll((_) => IO.succeed(`error: ${_}`)),
      IO.run({ fs: () => "test" })
    )
    expect(res).toEqual(E.right("error: ERROR!"))
  })
})
