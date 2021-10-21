import * as App from "@app/exercises/day-3/01-managed"
import * as T from "@effect-ts/core/Effect"
import { pretty } from "@effect-ts/system/Cause"

describe("Managed", () => {
  it("uses simple managedwith no finalization", async () => {
    const out = await T.runPromiseExit(App.programUsingManagedArray)
    if (out._tag === "Failure") {
      console.log(pretty(out.cause))
    }
    expect(out._tag).toEqual("Success")
  })
})
