import * as E from "@effect-ts/core/Either"
import { identity } from "@effect-ts/system/Function"

export type Schema<I, A> =
  | SchemaString<I, A>
  | SchemaNumber<I, A>
  | SchemaRecord<I, A>
  | SchemaArray<I, A>
  | SchemaDateIso<I, A>
  | SchemaCompose<I, A>
  | SchemaUnknownArray<I, A>
  | SchemaObject<I, A>

abstract class Common<I, A> {
  readonly [">>>"] = <B>(that: Schema<A, B>): Schema<I, B> => {
    // @ts-expect-error
    return compose(that)(this)
  }
}

export class SchemaCompose<I, A> extends Common<I, A> {
  readonly _tag = "SchemaCompose"
  constructor(
    readonly use: <X>(f: <B>(self: Schema<I, B>, that: Schema<B, A>) => X) => X
  ) {
    super()
  }
}

export function compose<B, A>(that: Schema<B, A>) {
  return <I>(self: Schema<I, B>): Schema<I, A> =>
    new SchemaCompose((f) => f(self, that))
}

export class SchemaString<I, A> extends Common<I, A> {
  readonly _tag = "SchemaString"
  constructor(
    readonly use: <X>(f: (out: (s: string) => A, inp: (u: I) => unknown) => X) => X
  ) {
    super()
  }
}

export const string: Schema<unknown, string> = new SchemaString((f) =>
  f(identity, identity)
)

export class SchemaObject<I, A> extends Common<I, A> {
  readonly _tag = "SchemaObject"
  constructor(
    readonly use: <X>(f: (out: (s: {}) => A, inp: (u: I) => unknown) => X) => X
  ) {
    super()
  }
}

export const object: Schema<unknown, {}> = new SchemaObject((f) =>
  f(identity, identity)
)

export class SchemaUnknownArray<I, A> extends Common<I, A> {
  readonly _tag = "SchemaUnknownArray"
  constructor(
    readonly use: <X>(
      f: (out: (s: readonly unknown[]) => A, inp: (u: I) => unknown) => X
    ) => X
  ) {
    super()
  }
}

export const unknownArray: Schema<
  unknown,
  readonly unknown[]
> = new SchemaUnknownArray((f) => f(identity, identity))

export class SchemaNumber<I, A> extends Common<I, A> {
  readonly _tag = "SchemaNumber"
  constructor(
    readonly use: <X>(f: (out: (n: number) => A, inp: (u: I) => unknown) => X) => X
  ) {
    super()
  }
}

export const number: Schema<unknown, number> = new SchemaNumber((f) =>
  f(identity, identity)
)

export class SchemaDateIso<I, A> extends Common<I, A> {
  readonly _tag = "SchemaDateIso"
  constructor(
    readonly use: <X>(f: (out: (s: Date) => A, inp: (u: I) => string) => X) => X
  ) {
    super()
  }
}

export const dateIso: Schema<string, Date> = new SchemaDateIso((f) =>
  f(identity, identity)
)

export type SchemaRecordType<
  Props extends {
    [k in keyof Props]: Schema<unknown, any>
  }
> = {
  readonly [k in keyof Props]: [Props[k]] extends [Schema<unknown, infer A>] ? A : never
}

export class SchemaArray<I, A> extends Common<I, A> {
  readonly _tag = "SchemaArray"
  constructor(
    readonly use: <X>(
      f: <Input, Element>(
        out: (a: readonly Element[]) => A,
        inp: (a: I) => readonly Input[],
        element: Schema<Input, Element>
      ) => X
    ) => X
  ) {
    super()
  }
}

export function array<I, A>(element: Schema<I, A>): Schema<readonly I[], readonly A[]> {
  return new SchemaArray((f) => f(identity, identity, element))
}

export class SchemaRecord<I, A> extends Common<I, A> {
  readonly _tag = "SchemaRecord"
  constructor(
    readonly use: <X>(
      f: <Props extends { [k in keyof Props]: Schema<unknown, any> }>(
        out: (s: SchemaRecordType<Props>) => A,
        inp: (i: I) => {},
        props: Props
      ) => X
    ) => X
  ) {
    super()
  }
}

export function record<Props extends { [k in keyof Props]: Schema<unknown, any> }>(
  props: Props
): Schema<
  {},
  {
    readonly [k in keyof Props]: [Props[k]] extends [Schema<unknown, infer A>]
      ? A
      : never
  }
> {
  return new SchemaRecord((f) => f(identity, identity, props))
}

export type AOfSchema<A> = [A] extends [Schema<any, infer X>] ? X : never

export function guard<I, A>(self: Schema<I, A>): (u: unknown) => u is A {
  switch (self._tag) {
    case "SchemaCompose": {
      return self.use((_, t) => guard(t))
    }
    case "SchemaString":
      return (u): u is A => typeof u === "string"
    case "SchemaObject":
      return (u): u is A => typeof u === "object" && u != null
    case "SchemaNumber":
      return (u): u is A => typeof u === "number"
    case "SchemaDateIso":
      return (u): u is A => u instanceof Date
    case "SchemaUnknownArray":
      return (u): u is A => Array.isArray(u)
    case "SchemaArray":
      return self.use((_, __, element) => {
        const guardElement = guard(element)

        return (u): u is A => Array.isArray(u) && u.every(guardElement)
      })
    case "SchemaRecord":
      return self.use((_, __, props) => {
        type Props = typeof props
        const guards = {} as {
          [k in keyof Props]: (u: unknown) => u is AOfSchema<Props[k]>
        }
        for (const k of Object.keys(props)) {
          guards[k] = guard(props[k])
        }
        return (u): u is A => {
          if (typeof u !== "object" || u == null) {
            return false
          }
          for (const k of Object.keys(props)) {
            if (!(k in u)) {
              return false
            }
            if (!guards[k](u[k])) {
              return false
            }
          }
          return true
        }
      })
  }
}

export function parse<I, A>(self: Schema<I, A>): (i: I) => E.Either<string, A> {
  switch (self._tag) {
    case "SchemaCompose":
      return self.use((s, t) => {
        const parseS = parse(s)
        const parseT = parse(t)
        return (i) => E.chain_(parseS(i), (b) => parseT(b))
      })
    case "SchemaUnknownArray": {
      return self.use((o, i) => (_u) => {
        const u = i(_u)
        return Array.isArray(u) ? E.right(o(u)) : E.left("not an array")
      })
    }
    case "SchemaObject":
      return (u) =>
        typeof u === "object" && u != null
          ? E.right(self.use((out) => out(u)))
          : E.left("not an object")
    case "SchemaNumber":
      return (u) =>
        typeof u === "number"
          ? E.right(self.use((out) => out(u)))
          : E.left("not a number")
    case "SchemaString":
      return (u) =>
        typeof u === "string"
          ? E.right(self.use((out) => out(u)))
          : E.left(`not a string: ${JSON.stringify(u)}`)
    case "SchemaDateIso":
      return (u) =>
        self.use((out, inp) => {
          const ms = Date.parse(inp(u))
          if (Number.isNaN(ms)) {
            return E.left("not a valid date")
          }
          return E.right(out(new Date(ms)))
        })
    case "SchemaArray": {
      return self.use((out, inp, element) => {
        const parseElement = parse(element)

        return (_u) => {
          const u = inp(_u)
          const elements = [] as AOfSchema<typeof element>[]
          for (const ue of u) {
            const e = parseElement(ue)
            if (E.isLeft(e)) {
              return E.left(e.left)
            }
            elements.push(e.right)
          }
          return E.right(out(elements))
        }
      })
    }
    case "SchemaRecord": {
      return (_u) =>
        self.use((out, inp, props) => {
          const u = inp(_u)
          type Props = typeof props
          const res = {} as SchemaRecordType<Props>
          for (const k of Object.keys(props)) {
            if (!(k in u)) {
              return E.left(`key "${k}" missing in ${JSON.stringify(u)}`)
            }
            const parsed = parse(props[k])(u[k])
            if (E.isLeft(parsed)) {
              return E.left(parsed.left)
            }
            res[k] = parsed.right
          }
          return E.right(out(res))
        })
    }
  }
}

export function opaque<A>() {
  return <I>(self: Schema<I, A>): Schema<I, A> => self
}
