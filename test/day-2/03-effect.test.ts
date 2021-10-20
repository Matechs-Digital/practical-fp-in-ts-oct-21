import * as Eff from "@app/exercises/day-2/01-effect"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as F from "@effect-ts/core/Effect/Fiber"
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
  it("should test randomOutput2", async () => {
    const res = await pipe(
      Eff.randomOutput2,
      T.provideAll({ random: T.succeedWith(() => 0) }),
      T.runPromise
    )

    expect(res).toContain("I've got a failure")
  })
  it("should test result", async () => {
    const res = await pipe(
      Eff.randomGteHalf,
      T.result,
      T.provideAll({ random: T.succeedWith(() => 1) }),
      T.runPromise
    )

    expect(res).toEqual(Ex.succeed(1))
  })
  it("should test bracket", async () => {
    const res = await pipe(
      T.succeedWith(() => [] as string[]),
      T.bracket(
        (_) =>
          T.succeedWith(() => {
            _.push("a", "b", "c")
          }),
        (_) =>
          T.succeedWith(() => {
            throw new Error("ok")
          })
      ),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.die(new Error("ok")))
  })

  it("should test fetchRequest3", async () => {
    const fiber = pipe(Eff.fetchRequest3, T.runFiber)

    await T.runPromise(F.interrupt(fiber))

    const res = await T.runPromiseExit(F.join(fiber))

    expect(Ex.interrupted(res)).toEqual(true)
  })

  it("should test _fetch", async () => {
    const res = await pipe(
      Eff._fetchJson("https://jsonplaceholder.typicode.com/todos/1"),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(
      Ex.succeed({ completed: false, id: 1, title: "delectus aut autem", userId: 1 })
    )
  })
})
