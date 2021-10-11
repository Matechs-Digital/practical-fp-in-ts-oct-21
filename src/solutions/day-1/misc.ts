import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/system/Function"

export namespace BooleanADT {
  export interface True {
    readonly _tag: "True"
  }

  export function makeTrue(): Boolean {
    return {
      _tag: "True"
    }
  }

  export interface False {
    readonly _tag: "False"
  }

  export function makeFalse(): Boolean {
    return {
      _tag: "False"
    }
  }

  export type Boolean = True | False

  export function invert(self: Boolean): Boolean {
    switch (self._tag) {
      case "True": {
        return makeFalse()
      }
      case "False": {
        return makeTrue()
      }
    }
  }

  export function renderToString(self: Boolean): string {
    switch (self._tag) {
      case "True": {
        return "Boolean is True"
      }
      case "False": {
        return "Boolean is False"
      }
    }
  }
}

export namespace Pipeable {
  export function add(n: number) {
    return (self: number): number => self + n
  }
  export function renderToString(n: number): string {
    return `result is ${n}`
  }
}

export namespace SimpleIO {
  export interface Succeed<A> {
    readonly _tag: "Succeed"
    readonly use: <X>(go: (_: A) => X) => X
  }

  export function succeed<A>(a: A): IO<A> {
    return {
      _tag: "Succeed",
      use: (go) => go(a)
    }
  }

  export interface Map<A> {
    readonly _tag: "Map"
    readonly use: <X>(go: <B>(fa: IO<B>, f: (a: B) => A) => X) => X
  }

  export function map<A, B>(f: (a: A) => B) {
    return (self: IO<A>): IO<B> => ({
      _tag: "Map",
      use: (go) => go(self, f)
    })
  }

  export interface Chain<A> {
    readonly _tag: "Chain"
    readonly use: <X>(go: <B>(fa: IO<B>, f: (a: B) => IO<A>) => X) => X
  }

  export function chain<A, B>(f: (a: A) => IO<B>) {
    return (self: IO<A>): IO<B> => ({
      _tag: "Chain",
      use: (go) => go(self, f)
    })
  }

  export interface Suspend<A> {
    readonly _tag: "Suspend"
    readonly use: <X>(go: (f: () => IO<A>) => X) => X
  }

  export function suspend<A>(f: () => IO<A>): IO<A> {
    return {
      _tag: "Suspend",
      use: (go) => go(f)
    }
  }

  export type IO<A> = Succeed<A> | Map<A> | Chain<A> | Suspend<A>

  export function run<A>(self: IO<A>): A {
    switch (self._tag) {
      case "Succeed": {
        return self.use((a) => a)
      }
      case "Map": {
        return self.use((fa, f) => f(run(fa)))
      }
      case "Chain": {
        return self.use((fa, f) => run(f(run(fa))))
      }
      case "Suspend": {
        return self.use((f) => run(f()))
      }
    }
  }

  interface ApplyFrame {
    readonly _tag: "ApplyFrame"
    readonly apply: (a: unknown) => IO<unknown>
  }

  function applyFrame(f: (a: unknown) => IO<unknown>): StackFrame {
    return {
      _tag: "ApplyFrame",
      apply: f
    }
  }

  type StackFrame = ApplyFrame

  export function runSafe<A>(self: IO<A>): A {
    // eslint-disable-next-line prefer-const
    let maybeCurrent: IO<unknown> | undefined = self
    let value: unknown | undefined = undefined
    const stack: Array<StackFrame> = []

    while (maybeCurrent) {
      const current = maybeCurrent

      switch (current._tag) {
        case "Succeed": {
          value = current.use((a) => a)
          maybeCurrent = undefined
          break
        }
        case "Map": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              applyFrame((a) =>
                // @ts-expect-error
                succeed(f(a))
              )
            )
          })
          break
        }
        case "Chain": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              // @ts-expect-error
              applyFrame(f)
            )
          })
          break
        }
        case "Suspend": {
          current.use((f) => {
            maybeCurrent = f()
          })
          break
        }
      }

      if (!maybeCurrent && stack.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const frame = stack.pop()!
        maybeCurrent = frame.apply(value)
      }
    }

    // @ts-expect-error
    return value
  }
}

export namespace EIO {
  export interface Succeed<A> {
    readonly _tag: "Succeed"
    readonly use: <X>(go: (_: A) => X) => X
  }

  export function succeed<A>(a: A): IO<never, A> {
    return {
      _tag: "Succeed",
      use: (go) => go(a)
    }
  }

  export interface Fail<E> {
    readonly _tag: "Fail"
    readonly use: <X>(go: (_: E) => X) => X
  }

  export function fail<E>(e: E): IO<E, never> {
    return {
      _tag: "Fail",
      use: (go) => go(e)
    }
  }

  export interface Map<E, A> {
    readonly _tag: "Map"
    readonly use: <X>(go: <B>(fa: IO<E, B>, f: (a: B) => A) => X) => X
  }

  export function map<A, B>(f: (a: A) => B) {
    return <E>(self: IO<E, A>): IO<E, B> => ({
      _tag: "Map",
      use: (go) => go(self, f)
    })
  }

  export interface Chain<E, A> {
    readonly _tag: "Chain"
    readonly use: <X>(go: <B>(fa: IO<E, B>, f: (a: B) => IO<E, A>) => X) => X
  }

  export function chain<A, E2, B>(f: (a: A) => IO<E2, B>) {
    return <E>(self: IO<E, A>): IO<E | E2, B> => ({
      _tag: "Chain",
      use: (go) => go(self, f)
    })
  }

  export interface CatchAll<E, A> {
    readonly _tag: "CatchAll"
    readonly use: <X>(go: <E1>(fa: IO<E1, A>, f: (a: E1) => IO<E, A>) => X) => X
  }

  export function catchAll<E, E2, B>(f: (a: E) => IO<E2, B>) {
    return <A>(self: IO<E, A>): IO<E2, A | B> => ({
      _tag: "CatchAll",
      use: (go) => go(self, f)
    })
  }

  export interface Suspend<E, A> {
    readonly _tag: "Suspend"
    readonly use: <X>(go: (f: () => IO<E, A>) => X) => X
  }

  export function suspend<E, A>(f: () => IO<E, A>): IO<E, A> {
    return {
      _tag: "Suspend",
      use: (go) => go(f)
    }
  }

  export type IO<E, A> =
    | Succeed<A>
    | Map<E, A>
    | Chain<E, A>
    | Suspend<E, A>
    | Fail<E>
    | CatchAll<E, A>

  export function run<E, A>(self: IO<E, A>): E.Either<E, A> {
    switch (self._tag) {
      case "Succeed": {
        return E.right(self.use((a) => a))
      }
      case "Map": {
        return self.use((fa, f) => {
          const res = run(fa)
          if (res._tag === "Right") {
            return E.right(f(res.right))
          } else {
            return E.left(res.left)
          }
        })
      }
      case "Chain": {
        return self.use((fa, f) => {
          const res = run(fa)
          if (res._tag === "Right") {
            return run(f(res.right))
          } else {
            return E.left(res.left)
          }
        })
      }
      case "Fail": {
        return self.use((e) => E.left(e))
      }
      case "Suspend": {
        return self.use((f) => run(f()))
      }
      case "CatchAll": {
        return self.use((fa, f) => {
          const res = run(fa)
          if (res._tag === "Left") {
            return run(f(res.left))
          } else {
            return E.right(res.right)
          }
        })
      }
    }
  }

  interface ApplyFrame {
    readonly _tag: "ApplyFrame"
    readonly apply: (a: unknown) => IO<unknown, unknown>
  }
  interface CatchFrame {
    readonly _tag: "CatchFrame"
    readonly apply: (a: unknown) => IO<unknown, unknown>
    readonly catchAll: (e: unknown) => IO<unknown, unknown>
  }

  function applyFrame(f: (a: unknown) => IO<unknown, unknown>): StackFrame {
    return {
      _tag: "ApplyFrame",
      apply: f
    }
  }
  function catchFrame(f: (e: unknown) => IO<unknown, unknown>): StackFrame {
    return {
      _tag: "CatchFrame",
      apply: succeed,
      catchAll: f
    }
  }

  type StackFrame = ApplyFrame | CatchFrame

  export function runSafe<E, A>(self: IO<E, A>): E.Either<E, A> {
    // eslint-disable-next-line prefer-const
    let maybeCurrent: IO<unknown, unknown> | undefined = self
    let value: unknown | undefined = undefined
    let errored = false
    const stack: Array<StackFrame> = []

    while (maybeCurrent) {
      const current = maybeCurrent

      switch (current._tag) {
        case "Succeed": {
          value = current.use((a) => a)
          maybeCurrent = undefined
          break
        }
        case "Map": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              applyFrame((a) =>
                // @ts-expect-error
                succeed(f(a))
              )
            )
          })
          break
        }
        case "Chain": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              // @ts-expect-error
              applyFrame(f)
            )
          })
          break
        }
        case "Suspend": {
          current.use((f) => {
            maybeCurrent = f()
          })
          break
        }
        case "Fail": {
          current.use((e) => {
            errored = true
            value = e
            maybeCurrent = undefined
          })
          while (stack.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const frame = stack.pop()!
            if (frame._tag === "CatchFrame") {
              maybeCurrent = frame.catchAll(value)
              errored = false
              break
            }
          }
          break
        }
        case "CatchAll": {
          current.use((fa, f) => {
            stack.push(
              // @ts-expect-error
              catchFrame(f)
            )
            maybeCurrent = fa
          })
          break
        }
      }

      if (!maybeCurrent && stack.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const frame = stack.pop()!
        maybeCurrent = frame.apply(value)
      }
    }

    // @ts-expect-error
    return errored ? E.left(value) : E.right(value)
  }
}

export namespace MiniEffect {
  export interface Succeed<A> {
    readonly _tag: "Succeed"
    readonly use: <X>(go: (_: A) => X) => X
  }

  export function succeed<A>(a: A): IO<unknown, never, A> {
    return {
      _tag: "Succeed",
      use: (go) => go(a)
    }
  }

  export interface Fail<E> {
    readonly _tag: "Fail"
    readonly use: <X>(go: (_: E) => X) => X
  }

  export function fail<E>(e: E): IO<unknown, E, never> {
    return {
      _tag: "Fail",
      use: (go) => go(e)
    }
  }

  export interface Map<R, E, A> {
    readonly _tag: "Map"
    readonly use: <X>(go: <B>(fa: IO<R, E, B>, f: (a: B) => A) => X) => X
  }

  export function map<A, B>(f: (a: A) => B) {
    return <R, E>(self: IO<R, E, A>): IO<R, E, B> => ({
      _tag: "Map",
      use: (go) => go(self, f)
    })
  }

  export interface Chain<R, E, A> {
    readonly _tag: "Chain"
    readonly use: <X>(go: <B>(fa: IO<R, E, B>, f: (a: B) => IO<R, E, A>) => X) => X
  }

  export function chain<A, R2, E2, B>(f: (a: A) => IO<R2, E2, B>) {
    return <R, E>(self: IO<R, E, A>): IO<R & R2, E | E2, B> => ({
      _tag: "Chain",
      use: (go) => go(self, f)
    })
  }

  export interface Fold<R, E, A> {
    readonly _tag: "Fold"
    readonly use: <X>(
      go: <E1, A1>(
        fa: IO<R, E1, A1>,
        onError: (a: E1) => IO<R, E, A>,
        onSuccess: (a: A1) => IO<R, E, A>
      ) => X
    ) => X
  }

  export function catchAll<E, R2, E2, B>(f: (a: E) => IO<R2, E2, B>) {
    return <R, A>(self: IO<R, E, A>): IO<R & R2, E2, A | B> => ({
      _tag: "Fold",
      use: (go) => go(self, f, succeed)
    })
  }

  export function fold<E, R2, E2, B, A, R3, E3, C>(
    onError: (a: E) => IO<R2, E2, B>,
    onSuccess: (a: A) => IO<R3, E3, C>
  ) {
    return <R>(self: IO<R, E, A>): IO<R & R2 & R3, E2 | E3, B | C> => ({
      _tag: "Fold",
      use: (go) => go(self, onError, onSuccess)
    })
  }

  export function bracket<R1, E1, A1, A, R2, E2, A2, E>(
    use: (a: A) => IO<R1, E1, A1>,
    release: (exit: E.Either<E | E1, A1>) => IO<R2, E2, A2>
  ) {
    return <R>(acquire: IO<R, E, A>): IO<R & R1 & R2, E | E1 | E2, A1> =>
      pipe(
        acquire,
        chain((a) =>
          pipe(
            use(a),
            catchAll((e1) =>
              pipe(
                release(E.left(e1)),
                chain(() => fail(e1))
              )
            ),
            chain((a1) =>
              pipe(
                release(E.right(a1)),
                map(() => a1)
              )
            )
          )
        )
      )
  }

  export interface Suspend<R, E, A> {
    readonly _tag: "Suspend"
    readonly use: <X>(go: (f: () => IO<R, E, A>) => X) => X
  }

  export function suspend<R, E, A>(f: () => IO<R, E, A>): IO<R, E, A> {
    return {
      _tag: "Suspend",
      use: (go) => go(f)
    }
  }

  export interface Access<R, E, A> {
    readonly _tag: "Access"
    readonly use: <X>(go: (f: (r: R) => IO<R, E, A>) => X) => X
  }

  export function access<R, R2, E, A>(f: (r: R) => IO<R2, E, A>): IO<R & R2, E, A> {
    return {
      _tag: "Access",
      use: (go) => go(f)
    }
  }

  export interface Provide<R, E, A> {
    readonly _tag: "Provide"
    readonly use: <X>(go: <K>(f: (r: R) => K, io: IO<K, E, A>) => X) => X
  }

  export function contramapEnv<R, K>(f: (r: R) => K) {
    return <E, A>(io: IO<K, E, A>): IO<R, E, A> => ({
      _tag: "Provide",
      use: (go) => go(f, io)
    })
  }

  export function provideAll<R>(r: R) {
    return <E, A>(io: IO<R, E, A>): IO<unknown, E, A> => contramapEnv(() => r)(io)
  }

  export function provideSome<R>(r: R) {
    return <K, E, A>(io: IO<K & R, E, A>): IO<K, E, A> =>
      contramapEnv((k: K) => ({ ...r, ...k }))(io)
  }

  export function effectTotal<A>(f: () => A) {
    return suspend(() => {
      return succeed(f())
    })
  }

  export type IO<R, E, A> =
    | Succeed<A>
    | Map<R, E, A>
    | Chain<R, E, A>
    | Suspend<R, E, A>
    | Fail<E>
    | Fold<R, E, A>
    | Access<R, E, A>
    | Provide<R, E, A>

  export function run<E, A>(self: IO<unknown, E, A>): E.Either<E, A> {
    return runInner(self, {})
  }

  function runInner<R, E, A>(self: IO<R, E, A>, r: R): E.Either<E, A> {
    switch (self._tag) {
      case "Succeed": {
        return E.right(self.use((a) => a))
      }
      case "Map": {
        return self.use((fa, f) => {
          const res = runInner(fa, r)
          if (res._tag === "Right") {
            return E.right(f(res.right))
          } else {
            return E.left(res.left)
          }
        })
      }
      case "Chain": {
        return self.use((fa, f) => {
          const res = runInner(fa, r)
          if (res._tag === "Right") {
            return runInner(f(res.right), r)
          } else {
            return E.left(res.left)
          }
        })
      }
      case "Fail": {
        return self.use((e) => E.left(e))
      }
      case "Suspend": {
        return self.use((f) => runInner(f(), r))
      }
      case "Fold": {
        return self.use((fa, onError, onSuccess) => {
          const res = runInner(fa, r)
          if (res._tag === "Left") {
            return runInner(onError(res.left), r)
          } else {
            return runInner(onSuccess(res.right), r)
          }
        })
      }
      case "Access": {
        return self.use((f) => runInner(f(r), r))
      }
      case "Provide": {
        return self.use((f, io) => runInner(io, f(r)))
      }
    }
  }

  interface ApplyFrame {
    readonly _tag: "ApplyFrame"
    readonly apply: (a: unknown) => IO<unknown, unknown, unknown>
  }

  interface CatchFrame {
    readonly _tag: "CatchFrame"
    readonly apply: (a: unknown) => IO<unknown, unknown, unknown>
    readonly catchAll: (e: unknown) => IO<unknown, unknown, unknown>
  }

  function applyFrame(f: (a: unknown) => IO<unknown, unknown, unknown>): StackFrame {
    return {
      _tag: "ApplyFrame",
      apply: f
    }
  }
  function catchFrame(
    onError: (e: unknown) => IO<unknown, unknown, unknown>,
    onSuccess: (e: unknown) => IO<unknown, unknown, unknown>
  ): StackFrame {
    return {
      _tag: "CatchFrame",
      apply: onSuccess,
      catchAll: onError
    }
  }

  type StackFrame = ApplyFrame | CatchFrame

  export function runSafe<E, A>(self: IO<unknown, E, A>): E.Either<E, A> {
    let maybeCurrent: IO<any, any, any> | undefined = self
    let value: unknown | undefined = undefined
    let errored = false
    const environments: Array<unknown> = [{}]
    const stack: Array<StackFrame> = []

    while (maybeCurrent) {
      const current = maybeCurrent

      switch (current._tag) {
        case "Succeed": {
          value = current.use((a) => a)
          maybeCurrent = undefined
          break
        }
        case "Map": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              applyFrame((a) =>
                // @ts-expect-error
                succeed(f(a))
              )
            )
          })
          break
        }
        case "Chain": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              // @ts-expect-error
              applyFrame(f)
            )
          })
          break
        }
        case "Suspend": {
          current.use((f) => {
            maybeCurrent = f()
          })
          break
        }
        case "Fail": {
          current.use((e) => {
            errored = true
            value = e
            maybeCurrent = undefined
          })
          while (stack.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const frame = stack.pop()!
            if (frame._tag === "CatchFrame") {
              maybeCurrent = frame.catchAll(value)
              errored = false
              break
            }
          }
          break
        }
        case "Fold": {
          current.use((fa, onError, onSuccess) => {
            stack.push(
              // @ts-expect-error
              catchFrame(onError, onSuccess)
            )
            maybeCurrent = fa
          })
          break
        }
        case "Access": {
          current.use((f) => {
            maybeCurrent = f(environments[environments.length - 1])
          })
          break
        }
        case "Provide": {
          current.use((f, io) => {
            maybeCurrent = pipe(
              effectTotal(() => {
                environments.push(f(environments[environments.length - 1]))
              }),
              bracket(
                () => io,
                () =>
                  effectTotal(() => {
                    environments.pop()
                  })
              )
            )
          })
          break
        }
      }

      if (!maybeCurrent && stack.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const frame = stack.pop()!
        maybeCurrent = frame.apply(value)
      }
    }

    // @ts-expect-error
    return errored ? E.left(value) : E.right(value)
  }

  export type XX =
    | IO<{ a: number }, { _tag: "A" }, "A">
    | IO<{ b: number }, { _tag: "B" }, "B">

  export type ROf = [XX] extends [IO<infer R, any, any>] ? R : never
  export type EOf = [XX] extends [IO<any, infer E, any>] ? E : never
}
