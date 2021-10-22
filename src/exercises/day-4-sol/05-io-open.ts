import * as E from "@effect-ts/core/Either"
import { hole } from "@effect-ts/core/Function"
import { Stack } from "@effect-ts/system/Stack"

//
// Open encoding of GADTs:
//
// - we don't need identities
// - we lose the concrete types in the interpreter
// - we protect from unsafe extension (someone doing new IO() or extends IO)
//   by using non-exported unique symbols
// - only api is exported
//

const privateSym: unique symbol = Symbol()
const privateSymR: unique symbol = Symbol()
const privateSymE: unique symbol = Symbol()
const privateSymA: unique symbol = Symbol()

//
// This is the type that will be exported, it internally defines only the variance
// of R, E and A.
//

export class IO<R, E, A> {
  readonly [privateSymR]!: (_: R) => void;
  readonly [privateSymE]!: () => E;
  readonly [privateSymA]!: () => A;

  readonly [privateSym]: typeof privateSym

  constructor(_: typeof privateSym) {
    this[privateSym] = _
  }
}

//
// Primitives, each extending IO
//

class Succeed<A> extends IO<unknown, never, A> {
  readonly _tag = "Succeed"
  constructor(readonly value: A) {
    super(privateSym)
  }
}

class Fail<E> extends IO<unknown, E, never> {
  readonly _tag = "Fail"
  constructor(readonly error: E) {
    super(privateSym)
  }
}

class Access<R, A> extends IO<R, never, A> {
  readonly _tag = "Access"
  constructor(readonly access: (r: R) => A) {
    super(privateSym)
  }
}

class Chain<R, E, A, R1, E1, A1> extends IO<R & R1, E | E1, A1> {
  readonly _tag = "Chain"
  constructor(readonly self: IO<R, E, A>, readonly f: (a: A) => IO<R1, E1, A1>) {
    super(privateSym)
  }
}

class ProvideSome<R, E, A, R1> extends IO<R1, E, A> {
  readonly _tag = "ProvideSome"
  constructor(readonly self: IO<R, E, A>, readonly f: (a: R1) => R) {
    super(privateSym)
  }
}

class Fold<R, E, A, R1, E1, A1, R2, E2, A2> extends IO<R & R1 & R2, E1 | E2, A1 | A2> {
  readonly _tag = "Fold"
  constructor(
    readonly self: IO<R, E, A>,
    readonly onSuccess: (a: A) => IO<R1, E1, A1>,
    readonly onError: (e: E) => IO<R2, E2, A2>
  ) {
    super(privateSym)
  }
}

//
// Erased type, represent an IO<unknown, unknown, unknown> as a tagged union
//

type Erased =
  | Succeed<unknown>
  | Fail<unknown>
  | Access<unknown, unknown>
  | Chain<unknown, unknown, unknown, unknown, unknown, unknown>
  | Fold<
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown
    >
  | ProvideSome<unknown, unknown, unknown, unknown>

//
// Continuations
//

class ChainCont {
  readonly _tag = "ChainCont"
  constructor(readonly f: (a: unknown) => IO<unknown, unknown, unknown>) {}
}

class FoldCont {
  readonly _tag = "FoldCont"
  constructor(
    readonly onSuccess: (a: unknown) => IO<unknown, unknown, unknown>,
    readonly onError: (a: unknown) => IO<unknown, unknown, unknown>
  ) {}
}

type Cont = Stack<ChainCont | FoldCont> | undefined

//
// Public API
//

export function succeed<A>(a: A): IO<unknown, never, A> {
  return new Succeed(a)
}

export function fail<E>(e: E): IO<unknown, E, never> {
  return new Fail(e)
}

export function access<R, A>(f: (_: R) => A): IO<R, never, A> {
  return new Access(f)
}

export function chain<A, R1, E1, A1>(
  f: (a: A) => IO<R1, E1, A1>
): <R, E>(self: IO<R, E, A>) => IO<R & R1, E | E1, A1> {
  return (self) => {
    return new Chain(self, f)
  }
}

export function foldM<E, A, R1, E1, A1, R2, E2, A2>(
  f: (a: A) => IO<R1, E1, A1>,
  g: (e: E) => IO<R2, E2, A2>
): <R>(self: IO<R, E, A>) => IO<R & R1 & R2, E1 | E2, A1 | A2> {
  return (self) => {
    return new Fold(self, f, g)
  }
}

export function provideSome<R1, R>(
  f: (a: R1) => R
): <E, A>(self: IO<R, E, A>) => IO<R1, E, A> {
  return (self) => {
    return new ProvideSome(self, f)
  }
}

export function run<E, A>(self: IO<unknown, E, A>): E.Either<E, A> {
  let cont: Cont
  let current = self as Erased
  let env = undefined as unknown
  let result
  let isError

  // eslint-disable-next-line no-constant-condition
  recursing: while (1) {
    // eslint-disable-next-line no-constant-condition
    pushing: while (1) {
      switch (current._tag) {
        case "Succeed": {
          result = current.value
          isError = false
          break pushing
        }
        case "Fail": {
          result = current.error
          isError = true
          break pushing
        }
        case "Access": {
          result = current.access(env)
          isError = false
          break pushing
        }
        case "Chain": {
          cont = new Stack(new ChainCont(current.f), cont)
          current = current.self as Erased
          continue pushing
        }
        case "Fold": {
          cont = new Stack(new FoldCont(current.onSuccess, current.onError), cont)
          current = current.self as Erased
          continue pushing
        }
        case "ProvideSome": {
          const old = env
          env = current.f(old)
          cont = new Stack(
            new FoldCont(
              (a) => {
                env = old
                return succeed(a)
              },
              (e) => {
                env = old
                return fail(e)
              }
            ),
            cont
          )
          current = current.self as Erased
          continue pushing
        }
      }
    }
    // eslint-disable-next-line no-constant-condition
    popping: while (1) {
      if (!cont) {
        return (isError ? E.left(result) : E.right(result)) as E.Either<E, A>
      }
      const frame = cont.value
      cont = cont.previous
      switch (frame._tag) {
        case "ChainCont": {
          if (isError) {
            continue popping
          } else {
            current = frame.f(result) as Erased
            continue recursing
          }
        }
        case "FoldCont": {
          if (isError) {
            current = frame.onError(result) as Erased
            isError = false
            continue recursing
          } else {
            current = frame.onSuccess(result) as Erased
            continue recursing
          }
        }
      }
    }
  }

  return hole()
}
