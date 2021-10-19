export interface IO<A> {
  (): A
}

export function fromSync<A>(io: () => A): IO<A> {
  return io
}

export function map<A, B>(f: (a: A) => B): (self: IO<A>) => IO<B> {
  return (self) => () => f(self())
}

export function flatMap<A, B>(f: (a: A) => IO<B>): (self: IO<A>) => IO<B> {
  return (self) => () => f(self())()
}

export function unsafeRun<A>(io: IO<A>): A {
  return io()
}
