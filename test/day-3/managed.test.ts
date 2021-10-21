import * as App from "@app/exercises/day-3/01-managed"
import * as T from "@effect-ts/core/Effect"

describe("Managed", () => {
  it("uses simple managedwith no finalization", async () => {
    const out = await T.runPromise(App.programUsingManagedArray)
    expect(out).toEqual(["message1", "message2"])
  })
})
