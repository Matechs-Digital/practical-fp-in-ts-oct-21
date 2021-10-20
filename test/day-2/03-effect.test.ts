import * as Eff from "@app/exercises/day-2/01-effect"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"

describe("Effect day-2", () => {
  it("should test succeed throw case", async () => {
    const res = await T.runPromiseExit(T.untraced(Eff.oneLazy))
    expect(res).toEqual(Ex.die(new Error("here")))
  })
})
