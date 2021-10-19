import * as Eff from "@app/exercises/day-1/03-effect"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import { pipe } from "@effect-ts/system/Function"

describe("Effect", () => {
  it("should succeed", async () => {
    const res = await T.runPromise(Eff.one)
    expect(res).toEqual(1)
  })
  it("should fail", async () => {
    const res = await T.runPromiseExit(T.untraced(Eff.error))

    expect(res).toEqual(Ex.fail("error"))
  })
  it("should die", async () => {
    const res = await T.runPromiseExit(T.untraced(Eff.die))

    expect(res).toEqual(Ex.die("error"))
  })
  it("should read", async () => {
    const res = await pipe(
      Eff.read,
      T.provideAll({ input: "ok" }),
      T.untraced,
      T.runPromiseExit
    )

    expect(res).toEqual(Ex.succeed("ok"))
  })
})
