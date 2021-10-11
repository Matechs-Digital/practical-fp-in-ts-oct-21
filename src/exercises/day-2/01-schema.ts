/**
 * Graduation:
 *
 * Putting together all the context so far we will build a minimal implementation of Schema.
 *
 * Schema is a module to describe data-types that enable derivation of Parser, Guard and potentially other utilities.
 */

import * as E from "@effect-ts/core/Either"
import type { Refinement } from "@effect-ts/core/Function"
import { flow, identity, pipe } from "@effect-ts/system/Function"
import { matchTag } from "@effect-ts/system/Utils"

/**
 * Write tests while implementing
 */

/**
 * Exercise:
 *
 * Let's start by implementing the following primitives that represent:
 *
 * 1) string values
 * 2) number values
 * 3) uknown values
 */
export type Schema<I, A> =
  | SchemaUnknown<I, A>
  | SchemaCompose<I, A>
  | SchemaNumberString<I, A>
  | SchemaRefinement<I, A>
  | StructSchema<I, A>

abstract class SchemaSyntax<I, A> {
  readonly [">>>"] = <B>(that: Schema<A, B>): Schema<I, B> =>
    // @ts-expect-error
    compose(that)(this)
}

export class SchemaUnknown<I, A> extends SchemaSyntax<I, A> {
  readonly _tag = "SchemaUnknown"
  constructor(readonly _A: (_: unknown) => A, readonly _I: (_: I) => unknown) {
    super()
  }
}

export const unknown: Schema<unknown, unknown> = new SchemaUnknown(identity, identity)

// Refinement
export function refine<I, A, B extends A>(
  self: Schema<I, A>,
  refinement: Refinement<A, B>
): Schema<I, B> {
  return new SchemaRefinement((go) => go(self, refinement, identity))
}

export class SchemaRefinement<I, A> extends SchemaSyntax<I, A> {
  readonly _tag = "SchemaRefinement"
  constructor(
    readonly use: <X>(
      go: <T0, T extends T0>(
        self: Schema<I, T0>,
        ref: Refinement<T0, T>,
        _A: (_: T) => A
      ) => X
    ) => X
  ) {
    super()
  }
}

export const string = refine(unknown, (u): u is string => typeof u === "string")

export const number = refine(unknown, (u): u is number => typeof u === "number")

export class SchemaCompose<I, A> extends SchemaSyntax<I, A> {
  readonly _tag = "SchemaCompose"
  constructor(
    readonly use: <X>(go: <T>(self: Schema<I, T>, that: Schema<T, A>) => X) => X
  ) {
    super()
  }
}

export function compose<A, B>(that: Schema<A, B>) {
  return <I>(self: Schema<I, A>): Schema<I, B> =>
    new SchemaCompose((go) => go(self, that))
}

export class SchemaNumberString<I, A> extends SchemaSyntax<I, A> {
  readonly _tag = "SchemaNumberString"
  constructor(readonly _A: (_: number) => A, readonly _I: (_: I) => string) {
    super()
  }
}

export const stringNumber: Schema<string, number> = new SchemaNumberString(
  identity,
  identity
)

export const unknownStringNumber = string[">>>"](stringNumber)

export interface IntBrand {
  readonly IntBrand: unique symbol
}

export interface Newtype<URI, T> {
  _URI: URI
  _T: T
}

export type Int = number & IntBrand

export const numberInt = refine(number, (n): n is Int => Number.isInteger(n))

/**
 * Exercise:
 *
 * implement the parse function that derive a Parser from a schema
 */
export interface Parser<I, A> {
  (u: I): E.Either<string, A>
}

export function parse<I, A>(self: Schema<I, A>): Parser<I, A> {
  switch (self._tag) {
    case "SchemaNumberString": {
      return (u: I) => {
        const i = self._I(u)
        const n = Number.parseFloat(i)
        if (Number.isNaN(n)) {
          return E.left(`was expecting a number encoded as a string got: ${i}`)
        }
        return E.right(self._A(n))
      }
    }
    case "SchemaUnknown": {
      return (u: I) => E.right(self._A(u))
    }
    case "SchemaCompose": {
      return self.use((self, that) => flow(parse(self), E.chain(parse(that))))
    }
    case "SchemaRefinement": {
      return self.use(
        // @ts-expect-error
        (self, ref, _A) => {
          const parseSelf = parse(self)

          return (u: I) =>
            E.chain_(parseSelf(u), (a) =>
              ref(a)
                ? E.right(_A(a))
                : E.left(
                    `the value ${JSON.stringify(a)} doesn't satisfy the refinement`
                  )
            )
        }
      )
    }
    case "StructSchema": {
      return self.use((props, _A, _I) => {
        const parsers = {} as {
          [k in keyof typeof props]: Parser<unknown, ExtractA<typeof props[k]>>
        }
        const keys = Object.keys(props).sort() as (keyof typeof props)[]
        for (const k of keys) {
          parsers[k] = parse(props[k])
        }
        return (i: I) => {
          const u = _I(i)
          if (typeof u !== "object") {
            return E.left(`expected object received: ${typeof u}`)
          }
          if (u == null) {
            return E.left(`expected object received: null`)
          }
          const parsed = {} as {
            [k in keyof typeof props]: ExtractA<typeof props[k]>
          }
          for (const k of keys) {
            if (k in u) {
              const v = parsers[k](u[k as keyof typeof u])
              if (E.isLeft(v)) {
                return v
              } else {
                parsed[k] = v.right
              }
            } else {
              return E.left(`missing field ${k} in ${JSON.stringify(u)}`)
            }
          }
          return E.right(_A(parsed))
        }
      })
    }
  }
}

/**
 * Exercise:
 *
 * implement the guard function that derive a Guard from a schema
 */
export interface Guard<A> {
  (u: unknown): u is A
}

export function guard<I, A>(self: Schema<I, A>): Guard<A> {
  return pipe(
    self,
    matchTag({
      SchemaNumberString: () => (_: unknown): _ is A =>
        typeof _ === "number" ? true : false,
      SchemaUnknown: () => (_: unknown): _ is A => true,
      SchemaCompose: ({ use }) => use((_, that) => guard(that)),
      SchemaRefinement: ({ use }) =>
        use(
          // @ts-expect-error
          (self, ref, _A) => {
            const guardSelf = guard(self)
            return (u: unknown): u is A => guardSelf(u) && (ref as any)(u)
          }
        ),
      StructSchema: ({ use }) =>
        use((props, _A, _I) => {
          const guards = {} as {
            [k in keyof typeof props]: Guard<ExtractA<typeof props[k]>>
          }
          const keys = Object.keys(props) as (keyof typeof props)[]
          for (const k of keys) {
            guards[k] = guard(props[k])
          }
          return (u: unknown) => {
            if (typeof u !== "object") {
              return false
            }
            if (u == null) {
              return false
            }
            for (const k of keys) {
              if (k in u) {
                if (!guards[k](u[k as keyof typeof u])) {
                  return false
                }
              } else {
                return false
              }
            }
            return true
          }
        })
    })
  )
}

/**
 * Exercise:
 *
 * We would like to compose parsers, namely we would like Schema<A> to become
 * Schema<I, A> where I represent the row input of the parser ad A represents
 * the parsed model.
 *
 * First extend Schema to become Schema<I, A> then create a new primitive
 * SchemaCompose<I, A> that composes Schema<I, T> with Schema<T, A> to represent the
 * activity of first parsing I to T then parsing T to A
 */

/**
 * Exercise:
 *
 * Add a new primitive SchemaStringNumber that represent a Number encoded as a string
 */

/**
 * Exercise:
 *
 * Use the new primitive with compose to create a Schema<unknonw, number> that
 * is encoded as a string
 */

/**
 * Exercise:
 *
 * Add new primitives SchemaArray and SchemaUnknownArray
 */

/**
 * Exercise:
 *
 * Add:
 *
 * 1) new primitives SchemaRecord and SchemaObject
 *
 * 2) a constructor fuction that takes a record of schemas
 *    { a: Schema<unknown, A>, b: Schema<unknown, B>, c: Schema<unknown, C> }
 *    and constructs Schema<{}, { a: A, b: B, c: C }>
 *
 * 3) a schema object Schema<unknown, {}>
 *
 * 4) a constructor that composes 2 & 3
 */

/**
 * Exercise:
 *
 * Add a method [">>>"] in schema to perform composition like: object[">>>"](struct({a: ...}))
 */

export type ExtractA<S extends Schema<unknown, any>> = [S] extends [
  Schema<unknown, infer A>
]
  ? A
  : never

export function struct<
  Props extends { readonly [k in keyof Props]: Schema<unknown, any> }
>(props: Props): Schema<unknown, { readonly [k in keyof Props]: ExtractA<Props[k]> }> {
  return new StructSchema((go) => go(props, identity, identity))
}

export class StructSchema<I, A> {
  readonly _tag = "StructSchema"
  constructor(
    readonly use: <X>(
      f: <Props extends { readonly [k in keyof Props]: Schema<unknown, any> }>(
        props: Props,
        _A: (a: { readonly [k in keyof Props]: ExtractA<Props[k]> }) => A,
        _I: (_: I) => unknown
      ) => X
    ) => X
  ) {}
}
