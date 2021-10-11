import * as IO from "@app/solutions/day-2/io"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/system/Function"

describe("IO", () => {
  it("simpleProgram should fail on positive input", () => {
    expect(pipe(IO.simpleProgram, IO.run({ n: 1 }))).equals(E.left("positive"))
    expect(pipe(IO.simpleProgram, IO.runSafe({ n: 1 }))).equals(E.left("positive"))
  })
  it("simpleProgram should succees on negative input", () => {
    expect(pipe(IO.simpleProgram, IO.run({ n: -1 }))).equals(E.right("got -1"))
    expect(pipe(IO.simpleProgram, IO.runSafe({ n: -1 }))).equals(E.right("got -1"))
  })
  it("simpleProgram should catch errors", () => {
    expect(
      pipe(
        IO.simpleProgram,
        IO.catchAll((_) => IO.succeed(_)),
        IO.run({ n: 1 })
      )
    ).equals(E.right("positive"))
    expect(
      pipe(
        IO.simpleProgram,
        IO.catchAll((_) => IO.succeed(_)),
        IO.runSafe({ n: 1 })
      )
    ).equals(E.right("positive"))
  })
  it("simpleProgram should succees on negative input, providing locally", () => {
    const cleanup = jest.fn()
    expect(
      pipe(
        IO.simpleProgram,
        IO.provideSome(() => ({ n: -1 })),
        IO.run({})
      )
    ).equals(E.right("got -1"))
    expect(
      pipe(
        IO.simpleProgram,
        IO.provideSome(() => ({ n: -1 })),
        IO.bracket(
          (a) => IO.succeed(a),
          () =>
            IO.succeedWith(() => {
              cleanup()
            })
        ),
        IO.runSafe({})
      )
    ).equals(E.right("got -1"))
    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})
