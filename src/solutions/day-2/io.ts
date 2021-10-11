import * as E from "@effect-ts/core/Either"
import { Stack } from "@effect-ts/system/Fiber"
import { identity, pipe } from "@effect-ts/system/Function"

/**
 * Problem definition:
 *
 * we want to build a Domain Specific Language to build generic programs,
 * generic programs have 3 main components that we need to consider:
 *
 * 1) A program can succeed in execution and provide a result
 * 2) A program may fail in execution raising a specific error
 * 3) A program may need dependencies to run
 */

/**
 * Exercise:
 *
 * Define a GADT named IO that covers the base cases for 1, 2, 3.
 *
 * The GADT will initially have primitives:
 * - Succeed => represents success
 * - Fail => represents failure
 * - Access => represents evironment access
 */
export type IO<R, E, A> =
  | Succeed<R, E, A>
  | Fail<R, E, A>
  | Access<R, E, A>
  | Fold<R, E, A>
  | Provide<R, E, A>

/**
 * Exercise:
 *
 * - Never fail (E => never)
 * - Doesn't require env (R => unknown)
 */
export class Succeed<R, E, A> {
  readonly _tag = "Succeed"
  constructor(
    readonly use: <X>(
      f: (_: {
        readonly _R: (_: R) => unknown
        readonly _E: (_: never) => E

        readonly value: A
      }) => X
    ) => X
  ) {}
}

/**
 * Exercise:
 *
 * An effect that always succeeds with a value A
 */
export function succeed<A>(value: A): IO<unknown, never, A> {
  return new Succeed((f) =>
    f({
      _E: identity,
      _R: identity,
      value
    })
  )
}

/**
 * Exercise:
 *
 * - Never succeed (A => never)
 * - Doesn't require env (R => unknown)
 */
export class Fail<R, E, A> {
  readonly _tag = "Fail"

  constructor(
    readonly use: <X>(
      f: (_: {
        readonly _R: (_: R) => unknown
        readonly _A: (_: never) => A

        readonly error: E
      }) => X
    ) => X
  ) {}
}

/**
 * Exercise:
 *
 * An effect that always fail with an error E
 */
export function fail<E>(error: E): IO<unknown, E, never> {
  return new Fail((f) =>
    f({
      _A: identity,
      _R: identity,
      error
    })
  )
}

/**
 * Exercise:
 *
 * - Never fail (E => never)
 * - Requires R to produce A
 */
export class Access<R, E, A> {
  readonly _tag = "Access"

  constructor(
    readonly use: <X>(
      f: (_: {
        readonly _E: (_: never) => E

        readonly accessFn: (r: R) => A
      }) => X
    ) => X
  ) {}
}

/**
 * Exercise:
 *
 * An effect that uses f to access the environment in order to produce a value A
 */
export function access<R, A>(accessFn: (r: R) => A): IO<R, never, A> {
  return new Access((f) =>
    f({
      _E: identity,
      accessFn
    })
  )
}

/**
 * Check the variance of R and E
 */
export type XX =
  | IO<{ a: number }, { _tag: "A" }, "A">
  | IO<{ b: number }, { _tag: "B" }, "B">

export type ROf = [XX] extends [IO<infer R, any, any>] ? R : never // should be { a: number } & { b: number }
export type EOf = [XX] extends [IO<any, infer E, any>] ? E : never // should be { _tag: "A" } | { _tag: "B"}

/**
 * Exercise:
 *
 * We want to be able to catch errors in operations, and recover
 */
export class Fold<R, E, A> {
  readonly _tag = "Fold"

  constructor(
    readonly use: <X>(
      f: <TE, TS>(_: {
        readonly fx: IO<R, TE, TS>
        readonly onError: (e: TE) => IO<R, E, A>
        readonly onSuccess: (a: TS) => IO<R, E, A>
      }) => X
    ) => X
  ) {}
}

/**
 * Exercise:
 *
 * Folds both success and failures
 */
export function foldM<E, A, R1, E1, A1, R2, E2, A2>(
  onError: (e: E) => IO<R2, E2, A2>,
  onSuccess: (a: A) => IO<R1, E1, A1>
): <R>(self: IO<R, E, A>) => IO<R & R1 & R2, E1 | E2, A1 | A2> {
  return (self) =>
    new Fold((f) =>
      f({
        fx: self,
        onError,
        onSuccess
      })
    )
}

/**
 * Exercise:
 *
 * - Never fail (E => never)
 * - Requires R to produce A
 */
export class Provide<R, E, A> {
  readonly _tag = "Provide"

  constructor(
    readonly use: <X>(
      f: <R0>(_: { readonly fa: IO<R0, E, A>; readonly provideFn: (r: R) => R0 }) => X
    ) => X
  ) {}
}

export function provideSome<R, R0>(provideFn: (r: R) => R0) {
  return <E, A>(self: IO<R0, E, A>): IO<R, E, A> =>
    new Provide((f) => f({ provideFn, fa: self }))
}

/**
 * Exercise:
 *
 * Produces an effect that describe the operation of running `self`, taking it's result and
 * feed it into `chainFn` to produce a new operation
 */
export function chain<A, R1, E1, A1>(
  chainFn: (a: A) => IO<R1, E1, A1>
): <R, E>(self: IO<R, E, A>) => IO<R & R1, E | E1, A1> {
  return (self) =>
    new Fold((f) =>
      f({
        fx: self,
        onSuccess: chainFn,
        onError: fail
      })
    )
}

/**
 * Implement the map function in terms of chain & succeed
 */
export declare function map<A, A1>(
  chainFn: (a: A) => A1
): <R, E>(self: IO<R, E, A>) => IO<R, E, A1>

/**
 * Implement the costant `unit`
 */
export const unit: IO<unknown, never, void> = succeed(void 0)

/**
 * Implement the constructor `succeedWith`
 */
export function succeedWith<A>(f: () => A): IO<unknown, never, A> {
  return pipe(
    unit,
    chain(() => succeed(f()))
  )
}

/**
 * Implement the constructor `failWith`
 */
export function failWith<E>(f: () => E): IO<unknown, E, never> {
  return pipe(
    unit,
    chain(() => fail(f()))
  )
}

/**
 * Exercise:
 *
 * Produces an effect that describe the operation of running `self`, taking it's error in case
 * of failures and feed it into `recoverFn` to produce a new operation
 */
export function catchAll<E, R1, E1, A1>(
  recoverFn: (e: E) => IO<R1, E1, A1>
): <R, A>(self: IO<R, E, A>) => IO<R & R1, E1, A | A1> {
  return (self) =>
    new Fold((f) =>
      f({
        fx: self,
        onError: recoverFn,
        onSuccess: succeed
      })
    )
}

/**
 * Exercise
 *
 * Runs `acquire`, then runs `use`, and feeds the result (both error or success)
 * into `finalize` returning the original result.
 */
export function bracket<A, RU, EU, AU, RF, EF, AF>(
  use: (a: A) => IO<RU, EU, AU>,
  finalize: (a: A, exit: E.Either<EU, AU>) => IO<RF, EF, AF>
): <R, E>(self: IO<R, E, A>) => IO<R & RU & RF, E | EU | EF, AU> {
  return (self) =>
    pipe(
      self,
      chain((a) =>
        pipe(
          use(a),
          foldM(
            (eu) =>
              pipe(
                finalize(a, E.left(eu)),
                chain(() => fail(eu))
              ),
            (au) =>
              pipe(
                finalize(a, E.right(au)),
                chain(() => succeed(au))
              )
          )
        )
      )
    )
}

/**
 * Write a recursive interpreter for IO
 */
export function run<R>(r: R): <E, A>(self: IO<R, E, A>) => E.Either<E, A> {
  return (self) => {
    switch (self._tag) {
      case "Succeed": {
        return self.use(({ value }) => E.right(value))
      }
      case "Fail": {
        return self.use(({ error }) => E.left(error))
      }
      case "Access": {
        return self.use(({ accessFn }) => E.right(accessFn(r)))
      }
      case "Provide": {
        return self.use(({ fa, provideFn }) => run(provideFn(r))(fa))
      }
      case "Fold": {
        return self.use(({ fx, onError, onSuccess }) => {
          const resA = run(r)(fx)
          if (resA._tag === "Left") {
            return run(r)(onError(resA.left))
          }
          return run(r)(onSuccess(resA.right))
        })
      }
    }
  }
}

/**
 * Write tests to assert that everythig up to now works as expected
 */

class FrameFold {
  readonly _tag = "FrameFold"
  constructor(
    readonly onError: (e: any) => IO<any, any, any>,
    readonly onSuccess: (a: any) => IO<any, any, any>
  ) {}
}

type RunSafeStack = Stack<FrameFold> | undefined

/**
 * Example
 *
 * Stack safe interpreter
 */
export function runSafe<R>(r: R): <E, A>(self: IO<R, E, A>) => E.Either<E, A> {
  return (self) => {
    let stack = undefined as RunSafeStack

    let result = undefined
    let isError = false

    // eslint-disable-next-line no-constant-condition
    recursing: while (1) {
      // eslint-disable-next-line no-constant-condition
      pushing: while (1) {
        switch (self._tag) {
          case "Succeed": {
            result = self.use(({ value }) => value)
            isError = false
            break pushing
          }
          case "Fail": {
            result = self.use(({ error }) => error)
            isError = true
            break pushing
          }
          case "Access": {
            result = self.use(({ accessFn }) => accessFn(r))
            isError = false
            break pushing
          }
          case "Provide": {
            self.use(({ fa, provideFn }) => {
              const prevR = r
              // @ts-expect-error
              self = pipe(
                succeedWith(() => {
                  // @ts-expect-error
                  r = provideFn(r)
                }),
                bracket(
                  () => fa,
                  () =>
                    succeedWith(() => {
                      r = prevR
                    })
                )
              )
            })
            continue pushing
          }
          case "Fold": {
            self.use(({ fx, onError, onSuccess }) => {
              stack = new Stack(new FrameFold(onError, onSuccess), stack)
              // @ts-expect-error
              self = fx
            })
            continue pushing
          }
        }
      }
      // eslint-disable-next-line no-constant-condition
      while (1) {
        if (stack) {
          const frame = stack.value
          stack = stack.previous
          switch (frame._tag) {
            case "FrameFold": {
              if (isError) {
                self = frame.onError(result)
                isError = false
                continue recursing
              } else {
                self = frame.onSuccess(result)
                continue recursing
              }
            }
          }
        }
        break recursing
      }
    }

    return isError ? E.left(result as any) : E.right(result as any)
  }
}

/**
 * First small program, should be typed as:
 *
 * IO<{
 *     n: number;
 * }, "positive", `got ${number}`>
 */
export const simpleProgram = pipe(
  access(({ n }: { n: number }) => n),
  chain((n) => (n > 0 ? fail("positive" as const) : succeed(`got ${n}` as const)))
)
