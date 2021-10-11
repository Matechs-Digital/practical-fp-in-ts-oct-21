import * as App from "@app/exercises/day-3/01-effect"
import * as T from "@effect-ts/core/Effect"
import { pretty } from "@effect-ts/core/Effect/Cause"
import * as Ex from "@effect-ts/core/Effect/Exit"
import { assertsFailure } from "@effect-ts/core/Effect/Exit"

describe("Effect", () => {
  it("test fail", async () => {
    const res = await T.runPromiseExit(App.error)

    assertsFailure(res)

    console.log(pretty(res.cause))

    expect(Ex.untraced(res)).toEqual(Ex.fail("error"))
  })
})
