import * as Eff from "@app/exercises/day-2/01-effect"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as Sc from "@effect-ts/core/Effect/Schedule"
import { pipe } from "@effect-ts/core/Function"

describe("Effect day-2", () => {
  it("should test succeed throw case", async () => {
    const res = await T.runPromiseExit(T.untraced(Eff.oneLazy))
    expect(res).toEqual(Ex.die(new Error("here")))
  })
  it("should test map", async () => {
    const res = await T.runPromiseExit(Eff.useMap)
    expect(res).toEqual(Ex.succeed("got: 2"))
  })
  it("should test chain", async () => {
    const messages: string[] = []
    const res = await pipe(
      Eff.useChain,
      T.repeatN(2),
      T.provideAll({
        log: (message) =>
          T.succeedWith(() => {
            messages.push(message)
          })
      }),
      T.runPromiseExit
    )
    expect(res).toEqual(Ex.unit)
    expect(messages).toEqual(["logging: 1", "logging: 1", "logging: 1"])
  })
  it("should test random", async () => {
    const myPolicy = pipe(
      Sc.exponential(200),
      Sc.whileInput((n: Eff.InvalidNumber) => n.invalidNumber < 0.3)
    )["&&"](Sc.recurs(2))

    const res = await pipe(
      Eff.randomGteHalf,
      T.provideAll({ random: T.succeedWith(() => 0) }),
      T.retry(myPolicy),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(
      Ex.fail(new Eff.InvalidNumber({ invalidNumber: 0 }))
    )

    const res2 = await pipe(
      Eff.randomGteHalf,
      T.provideAll({ random: T.succeedWith(() => 1) }),
      T.retry(myPolicy),
      T.runPromiseExit
    )

    expect(Ex.untraced(res2)).toEqual(Ex.succeed(1))
  })
  it("should test randomOrOne2", async () => {
    const res = await pipe(
      Eff.randomOrOne2,
      T.provideAll({ random: T.succeedWith(() => 0) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.succeed(1))
  })
})
