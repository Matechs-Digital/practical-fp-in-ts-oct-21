import * as S from "@app/exercises/day-2/01-schema"
import * as E from "@effect-ts/core/Either"

const Person = S.struct({
  firstName: S.string,
  lastName: S.string
})

const parsePerson = S.parse(Person)
const guardPerson = S.guard(Person)

describe("Schema", () => {
  it("parse number", () => {
    expect(S.parse(S.number)("")).toEqual(
      E.left('the value "" doesn\'t satisfy the refinement')
    )
    expect(S.parse(S.number)(1)).toEqual(E.right(1))
  })
  it("parse number from string", () => {
    expect(S.parse(S.unknownStringNumber)(1)).toEqual(
      E.left("the value 1 doesn't satisfy the refinement")
    )
    expect(S.parse(S.unknownStringNumber)("a")).toEqual(
      E.left("was expecting a number encoded as a string got: a")
    )
    expect(S.parse(S.unknownStringNumber)("1")).toEqual(E.right(1))
  })
  it.todo("parse string")
  it.todo("parse unknown")

  it.todo("guards number")
  it("guards string", () => {
    expect(S.guard(S.string)("test")).toBe(true)
    expect(S.guard(S.string)(1)).toBe(false)
  })
  it.todo("guards unknown")

  it("parsePerson should parse a person", () => {
    expect(parsePerson(0)).toEqual(E.left("expected object received: number"))
    expect(parsePerson(null)).toEqual(E.left("expected object received: null"))
    expect(parsePerson({})).toEqual(E.left("missing field firstName in {}"))
    expect(parsePerson({ firstName: 0 })).toEqual(
      E.left("the value 0 doesn't satisfy the refinement")
    )
    expect(parsePerson({ firstName: "Mike", lastName: "Arnaldi" })).toEqual(
      E.right({ firstName: "Mike", lastName: "Arnaldi" })
    )
    expect(parsePerson({ firstName: "Mike", lastName: "Arnaldi" })).toEqual(
      E.right({ firstName: "Mike", lastName: "Arnaldi" })
    )
  })
  it("guardPerson", () => {
    expect(guardPerson({ firstName: "Mike", lastName: "Arnaldi" })).toEqual(true)
    expect(guardPerson({ lastName: "Arnaldi" })).toEqual(false)
  })
})
