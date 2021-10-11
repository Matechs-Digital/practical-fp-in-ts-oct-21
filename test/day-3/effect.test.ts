import * as App from "@app/exercises/day-3/01-effect"
import { pipe } from "@effect-ts/core"
import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import * as T from "@effect-ts/core/Effect"
import * as Cause from "@effect-ts/core/Effect/Cause"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as F from "@effect-ts/core/Effect/Fiber"
import * as M from "@effect-ts/core/Effect/Managed"
import * as E from "@effect-ts/core/Either"
import * as O from "@effect-ts/core/Option"

describe("Effect", () => {
  it("should succeed", async () => {
    const res = await T.runPromise(App.one)

    expect(res).toEqual(1)
  })

  it("fail", async () => {
    const res = await T.runPromiseExit(App.error)

    Ex.assertsFailure(res)

    expect(Ex.untraced(res)).toEqual(Ex.fail("error"))
  })

  it("die", async () => {
    const res = await T.runPromiseExit(App.die)

    Ex.assertsFailure(res)

    expect(Ex.untraced(res)).toEqual(Ex.die("error"))
  })

  it("should access", async () => {
    const env = pipe(App.read, T.provideAll({ input: "hey!" }))
    const res = await T.runPromise(env)
    expect(res).toEqual("hey!")
  })

  it("should succeedWith", async () => {
    const res = await T.runPromiseExit(T.succeedWith(() => 1))

    expect(res).toEqual(Ex.succeed(1))
  })

  it("should map", async () => {
    const res = await pipe(
      T.succeed(2),
      T.map((_) => _ * 2),
      T.runPromise
    )

    expect(res).toEqual(4)
  })

  it("chain", async () => {
    const res = await pipe(
      App.one,
      T.chain((n) => T.succeed(n + 1)),
      T.runPromise
    )
    expect(res).toEqual(2)
  })

  it("random program should succeed", async () => {
    const res = await pipe(
      App.randomGteHalf,
      T.provideService(App.RandGen)({ _tag: "RandGen", rand: T.succeed(0.7) }),
      T.runPromiseExit
    )

    expect(res).toEqual(Ex.succeed(0.7))
  })

  it("random program should fail", async () => {
    const res = await pipe(
      App.randomGteHalf,
      T.provideService(App.RandGen)({ _tag: "RandGen", rand: T.succeed(0.4) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail(new App.InvalidRandom({ number: 0.4 })))
  })

  it("randomGteHalf catchAll", async () => {
    const res = await pipe(
      App.randomGteHalfOr1,
      T.provideService(App.RandGen)({ _tag: "RandGen", rand: T.succeed(0.3) }),
      T.runPromise
    )

    expect(res).toEqual(0.8)
  })

  it("T.catchAllCause", async () => {
    const res = await pipe(
      T.die("error"),
      T.catchAllCause((_) =>
        pipe(
          _,
          Cause.find(
            O.partial((miss) => (x): string => {
              if (Cause.equals(x, Cause.die("error"))) {
                return "ok"
              }
              return miss()
            })
          ),
          O.fold(
            () => T.halt(_),
            (_) => T.succeed(_)
          )
        )
      ),
      T.runPromiseExit
    )

    expect(res).toEqual(Ex.succeed("ok"))
  })
  it("foldM success", async () => {
    const res = await pipe(
      T.succeed(1),
      T.foldM(
        (e) => T.fail(e),
        (v) => T.succeed(v)
      ),
      T.runPromise
    )

    expect(res).toEqual(1)
  })

  it("foldM failure", async () => {
    const res = await pipe(
      T.fail("error"),
      T.foldM(
        (e) => T.fail(e),
        (v) => T.succeed(v)
      ),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail("error"))
  })

  it("result", async () => {
    const res = await pipe(
      T.fail("error"),
      T.result,
      T.chain((_) => T.done(_)),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail("error"))
  })

  it("tapError", async () => {
    const f = jest.fn()
    const res = await pipe(
      App.randomGteHalf,
      T.tapError((e) =>
        T.succeedWith(() => {
          f(e)
        })
      ),
      T.provideService(App.RandGen)({ _tag: "RandGen", rand: T.succeed(0.4) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail(new App.InvalidRandom({ number: 0.4 })))
    expect(f).toHaveBeenCalledTimes(1)
  })

  it("tapBoth fail", async () => {
    const onFail = jest.fn()
    const onSuccess = jest.fn()
    const res = await pipe(
      App.randomGteHalf,
      T.tapBoth(
        (e) =>
          T.succeedWith(() => {
            onFail(e)
          }),
        (n) =>
          T.succeedWith(() => {
            onSuccess(n)
            return n
          })
      ),
      T.provideService(App.RandGen)({ _tag: "RandGen", rand: T.succeed(0.4) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail(new App.InvalidRandom({ number: 0.4 })))
    expect(onFail).toHaveBeenCalledTimes(1)
    expect(onSuccess).not.toBeCalled()
  })

  it("tapBoth succeed", async () => {
    const onFail = jest.fn()
    const onSuccess = jest.fn()
    const res = await pipe(
      App.randomGteHalf,
      T.provideService(App.RandGen)({ _tag: "RandGen", rand: T.succeed(0.6) }),
      T.tapBoth(
        (e) =>
          T.succeedWith(() => {
            onFail(e)
          }),
        (n) =>
          T.succeedWith(() => {
            onSuccess(n)
            return n
          })
      ),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.succeed(0.6))
    expect(onFail).not.toBeCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it("catchTag", async () => {
    class TooBig {
      readonly _tag = "TooBig"
    }

    const res = await pipe(
      App.randomGteHalf,
      T.tap((n) => (n === 1 ? T.fail(new TooBig()) : T.unit)),
      T.catch("_tag", "InvalidRandom", () => T.succeed(0.95)),
      T.provideService(App.RandGen)({ _tag: "RandGen", rand: T.succeed(0.1) }),
      T.either,
      T.runPromise
    )

    expect(res).toEqual(E.right(0.95))
  })

  it("bracket", async () => {
    const use = jest.fn()
    const rel = jest.fn()

    await pipe(
      T.succeed(0),
      T.bracket(
        (n) =>
          T.succeedWith(() => {
            use(n)
          }),
        (n) =>
          T.succeedWith(() => {
            rel(n)
          })
      ),
      T.runPromiseExit
    )

    expect(use).toHaveBeenCalledTimes(1)
    expect(rel).toHaveBeenCalledTimes(1)
  })

  it("bracket fail", async () => {
    const use = jest.fn()
    const rel = jest.fn()

    await pipe(
      T.succeed(0),
      T.bracket(
        (n) =>
          T.failWith(() => {
            use(n)
            return "error"
          }),
        (n) =>
          T.succeedWith(() => {
            rel(n)
          })
      ),
      T.runPromiseExit
    )

    expect(use).toHaveBeenCalledTimes(1)
    expect(rel).toHaveBeenCalledTimes(1)
  })

  it("random numbers", async () => {
    pipe(
      T.do,
      T.bind("x", () =>
        T.updateService_(App.randomGteHalf, App.RandGen, (old) => ({
          ...old,
          rand: T.succeed(0)
        }))
      ),
      T.bind("y", () => App.randomGteHalf),
      T.map(({ x, y }) => x + y)
    )
  })

  it("gen", async () => {
    T.gen(function* (_) {
      const { rand } = yield* _(App.RandGen)

      const x = yield* _(rand)
      const y = yield* _(rand)

      for (const __ of [0, 1, 2, 3]) {
        yield* _(App.randomGteHalf)
      }

      return x + y
    })
  })

  it("gen test", () =>
    T.gen(function* (_) {
      const { rand } = yield* _(App.RandGen)

      const x = yield* _(rand)
      const y = yield* _(rand)

      for (const __ of [0, 1, 2, 3]) {
        yield* _(App.randomGteHalf)
      }

      yield* _(T.either(App.randomGteHalf))

      expect(x + y).toEqual(1.2)

      return x + y
    })
      ["|>"](T.provideService(App.RandGen)({ _tag: "RandGen", rand: T.succeed(0.6) }))
      ["|>"](T.runPromise))

  it("T.promise", async () => {
    const res = await pipe(
      T.promise(() => Promise.resolve(1)),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.succeed(1))
  })

  it("T.promise fail", async () => {
    const res = await pipe(
      T.promise(() => Promise.reject("error")),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.die("error"))
  })

  it("T.tryPromise fail", async () => {
    const res = await pipe(
      T.tryCatchPromise(
        () => Promise.reject("error"),
        (reason) => reason as string
      ),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail("error"))
  })

  it("T.effectAsync", async () => {
    const res = await pipe(
      T.effectAsync<unknown, never, number>((cb) => {
        setTimeout(() => cb(T.succeed(1)), 100)
      }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.succeed(1))
  })

  it("T.effectAsyncInterrupt", async () => {
    const res = await pipe(
      T.effectAsyncInterrupt<unknown, never, number>((cb) => {
        const timer = setTimeout(() => cb(T.succeed(1)), 100)

        return T.succeedWith(() => {
          clearTimeout(timer)
        })
      }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.succeed(1))
  })

  it("T.effectAsyncInterrupt interruption", () =>
    T.gen(function* (_) {
      const f = jest.fn()

      const fiber = yield* _(
        T.fork(
          T.effectAsyncInterrupt<unknown, never, number>((cb) => {
            const timer = setTimeout(() => cb(T.succeed(1)), 100)

            return T.succeedWith(() => {
              f()
              clearTimeout(timer)
            })
          })
        )
      )

      yield* _(T.sleep(10))
      yield* _(F.interrupt(fiber))
    })["|>"](T.runPromise))

  it("T.forEach", async () => {
    const res = await pipe(
      [1, 2, 3],
      T.forEachParN(2, (n) => T.delay(100)(T.succeed(n + 1))),
      T.runPromiseExit
    )

    expect(Ex.map_(res, Chunk.toArray)).toEqual(Ex.succeed([2, 3, 4]))
  })

  it("M.makeExit", async () => {
    const acq = jest.fn()
    const cleanup = jest.fn()

    const resource = pipe(
      T.succeedWith(() => {
        acq()
        return {
          connection: "ok"
        }
      }),
      M.makeExit((_) =>
        T.succeedWith(() => {
          cleanup(_)
        })
      )
    )

    const effect = pipe(
      resource,
      M.use((_) => T.succeed(_.connection))
    )

    const res = await T.runPromiseExit(effect)

    expect(res).toEqual(Ex.succeed("ok"))
  })
})
