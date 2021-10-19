import * as ADT from "@app/exercises/day-1/02-adt"
import * as St from "@effect-ts/core/Structural"

describe("Dummy", () => {
  it("shouldBeTrue should be true", () => {
    expect(ADT.shouldBeTrue).toEqual(ADT.fromBoolean(true))
  })
  it("programs are equivalent", () => {
    expect(ADT.evaluate(ADT.program)).toEqual(2)
    expect(St.equals(ADT.program2, ADT.program)).toEqual(true)
  })
  it("render should be work", () => {
    expect(ADT.render(ADT.program)).toEqual("((0 + 1) * 2)")
  })
  it("pnl of portfolio", () => {
    expect(ADT.pnl(ADT.portfolio)).toEqual(0.29999999999999993)
  })
})
