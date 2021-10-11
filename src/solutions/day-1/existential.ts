/**
 * Theory:
 *
 * Intro to existential types and their place in functional programming in general.
 *
 * In this module we introduce existential types as types that exists within a bounded context.
 */

import { pipe } from "@effect-ts/core/Function"
import { identity } from "@effect-ts/system/Function"

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
  | Chain<A>

export class Chain<A> {
  readonly _tag = "Chain"
  constructor(
    readonly use: <X>(
      go: <T>(_: { readonly self: Expr<T>; readonly f: (_: T) => Expr<A> }) => X
    ) => X
  ) {}
}

export class NumericValue<A> {
  readonly _tag = "NumericValue"
  constructor(readonly value: number, readonly _A: (_: number) => A) {}
}

export class Add<A> {
  readonly _tag = "Add"
  constructor(
    readonly x: Expr<number>,
    readonly y: Expr<number>,
    readonly _A: (_: number) => A
  ) {}
}

export class Sub<A> {
  readonly _tag = "Sub"
  constructor(
    readonly x: Expr<number>,
    readonly y: Expr<number>,
    readonly _A: (_: number) => A
  ) {}
}

export class Mul<A> {
  readonly _tag = "Mul"
  constructor(
    readonly x: Expr<number>,
    readonly y: Expr<number>,
    readonly _A: (_: number) => A
  ) {}
}

export class Div<A> {
  readonly _tag = "Div"
  constructor(
    readonly x: Expr<number>,
    readonly y: Expr<number>,
    readonly _A: (_: number) => A
  ) {}
}

export class StringValue<A> {
  readonly _tag = "StringValue"
  constructor(readonly value: string, readonly _A: (_: string) => A) {}
}

export function number(value: number): Expr<number> {
  return new NumericValue(value, identity)
}

export function string(value: string): Expr<string> {
  return new StringValue(value, identity)
}

export function add(y: Expr<number>): (x: Expr<number>) => Expr<number> {
  return (x) => new Add(x, y, identity)
}

export function sub(y: Expr<number>): (x: Expr<number>) => Expr<number> {
  return (x) => new Sub(x, y, identity)
}

export function mul(y: Expr<number>): (x: Expr<number>) => Expr<number> {
  return (x) => new Mul(x, y, identity)
}

export function div(y: Expr<number>): (x: Expr<number>) => Expr<number> {
  return (x) => new Div(x, y, identity)
}

export function chain<A, B>(f: (a: A) => Expr<B>): (self: Expr<A>) => Expr<B> {
  return (self) => new Chain((go) => go({ f, self }))
}

/**
 * Exercise:
 *
 * Implement the evaluate function
 */
export declare function evaluate<A>(params: Expr<A>): A

/**
 * Exercise:
 *
 * Write a program that uses the new chain primitive and test it
 */
export const program = pipe(
  number(0),
  add(pipe(number(1), mul(number(10)))),
  add(number(2)),
  mul(number(3)),
  chain((n) => string(`(${n})`))
)
