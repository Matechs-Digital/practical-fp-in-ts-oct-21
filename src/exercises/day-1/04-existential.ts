/**
 * Theory:
 *
 * Intro to existential types and their place in functional programming in general.
 *
 * In this module we introduce existential types as types that exists within a bounded context.
 */

import { identity, pipe } from "@effect-ts/core/Function"
import { matchTag } from "@effect-ts/core/Utils"

/**
 * Segment:
 *
 * GADTs
 */

/**
 * Exercise:
 *
 * Let's try to implement a Chain primitive that given Expr<A> and a function f : <A, B>(a: A) => Expr<B> returns
 * an Expr<B> that describe the idea of taking the result of an expression and dynamically transform it to another expression.
 */
export type Expr<A> =
  | NumericValue<A>
  | StringValue<A>
  | Add<A>
  | Sub<A>
  | Mul<A>
  | Div<A>
  | Concat<A>
  | Chain<A>

export class ChainOps<A, B> {
  constructor(readonly self: Expr<A>, readonly f: (a: A) => Expr<B>) {}
}

export class Chain<A> {
  readonly _tag = "Chain"
  constructor(readonly use: <X>(f: <T>(_: ChainOps<T, A>) => X) => X) {}
}

export class StringValue<A> {
  readonly _tag = "StringValue"
  constructor(readonly value: string, readonly _A: (a: string) => A) {}
}

export class NumericValue<A> {
  readonly _tag = "NumericValue"
  constructor(readonly value: number, readonly _A: (a: number) => A) {}
}

export class Add<A> {
  readonly _tag = "Add"
  constructor(
    readonly op1: Expr<number>,
    readonly op2: Expr<number>,
    readonly _A: (a: number) => A
  ) {}
}

export class Sub<A> {
  readonly _tag = "Sub"
  constructor(
    readonly op1: Expr<number>,
    readonly op2: Expr<number>,
    readonly _A: (a: number) => A
  ) {}
}

export class Mul<A> {
  readonly _tag = "Mul"
  constructor(
    readonly op1: Expr<number>,
    readonly op2: Expr<number>,
    readonly _A: (a: number) => A
  ) {}
}

export class Div<A> {
  readonly _tag = "Div"
  constructor(
    readonly op1: Expr<number>,
    readonly op2: Expr<number>,
    readonly _A: (a: number) => A
  ) {}
}

export class Concat<A> {
  readonly _tag = "Concat"
  constructor(
    readonly op1: Expr<string>,
    readonly op2: Expr<string>,
    readonly _A: (a: string) => A
  ) {}
}

export const concat = (op2: Expr<string>) => (op1: Expr<string>): Expr<string> =>
  new Concat(op1, op2, identity)

export function numericValue(value: number): Expr<number> {
  return new NumericValue(value, identity)
}

export function stringValue(value: string): Expr<string> {
  return new StringValue(value, identity)
}

export function add(right: Expr<number>) {
  return (left: Expr<number>): Expr<number> => new Add(left, right, identity)
}

export function sub(right: Expr<number>) {
  return (left: Expr<number>): Expr<number> => new Sub(left, right, identity)
}

export function mul(right: Expr<number>) {
  return (left: Expr<number>): Expr<number> =>
    pipe(
      left,
      chain((l) =>
        pipe(
          right,
          chain((r) => numericValue(l * r))
        )
      )
    )
}

export function div(right: Expr<number>) {
  return (left: Expr<number>): Expr<number> => new Div(left, right, identity)
}

export function chain<A, B>(f: (a: A) => Expr<B>): (self: Expr<A>) => Expr<B> {
  return (self) => new Chain((g) => g(new ChainOps(self, f)))
}

/**
 * Exercise:
 *
 * Implement the evaluate function
 */
export function evaluate<A>(expr: Expr<A>): A {
  return pipe(
    expr,
    matchTag({
      Add: ({ _A, op1, op2 }) => _A(evaluate(op1) + evaluate(op2)),
      Sub: ({ _A, op1, op2 }) => _A(evaluate(op1) - evaluate(op2)),
      Mul: ({ _A, op1, op2 }) => _A(evaluate(op1) * evaluate(op2)),
      Div: ({ _A, op1, op2 }) => _A(evaluate(op1) / evaluate(op2)),
      NumericValue: ({ _A, value }) => _A(value),
      StringValue: ({ _A, value }) => _A(value),
      Concat: ({ _A, op1, op2 }) => _A(evaluate(op1) + evaluate(op2)),
      Chain: ({ use }) => use((dk) => evaluate(dk.f(evaluate(dk.self))))
    })
  )
}

/**
 * Exercise:
 *
 * Write a program that uses the new chain primitive and test it
 */
export const program = pipe(
  numericValue(3),
  add(numericValue(9)),
  div(numericValue(4)),
  chain((n) => stringValue(`${n}`)),
  chain((s) => stringValue(`${s}pizza`))
)
