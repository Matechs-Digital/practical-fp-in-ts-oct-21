import * as S from "@app/solutions/day-2/schema"
import * as E from "@effect-ts/core/Either"

const Person_ = S.object[">>>"](
  S.record({
    createdAt: S.string[">>>"](S.dateIso),
    firstName: S.string,
    lastName: S.string,
    age: S.number,
    addresses: S.unknownArray[">>>"](S.array(S.string))
  })
)

export interface Person extends S.AOfSchema<typeof Person_> {}
export const Person = S.opaque<Person>()(Person_)

const parsePerson = S.parse(Person)
const isPerson = S.guard(Person)

describe("Person", () => {
  it("parses person", () => {
    expect(
      parsePerson({
        createdAt: "2021-04-28T19:22:18.818Z",
        firstName: "Michael",
        lastName: "Arnaldi",
        age: 30,
        addresses: []
      })
    ).toEqual(
      E.right({
        createdAt: new Date(Date.parse("2021-04-28T19:22:18.818Z")),
        firstName: "Michael",
        lastName: "Arnaldi",
        age: 30,
        addresses: []
      })
    )
    expect(
      isPerson({
        createdAt: new Date(Date.parse("2021-04-28T19:22:18.818Z")),
        firstName: "Michael",
        lastName: "Arnaldi",
        age: 30,
        addresses: []
      })
    ).equals(true)
  })
})
