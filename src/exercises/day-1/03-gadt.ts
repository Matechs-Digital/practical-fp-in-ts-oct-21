/**
 * Theory:
 *
 * Intro to generalized algebraic data types and their place in functional programming in general.
 *
 * In this module we introduce a generalization to algebraic data types required to deal with generic patameters.
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
 * We would like to port over the previous module Expr<number> to a more general Expr<A> having the Math functions
 * restricted to Expr<number>
 */
export type Expr<A> =
  | NumericValue<A>
  | StringValue<A>
  | Add<A>
  | Sub<A>
  | Mul<A>
  | Div<A>
  | Concat<A>
  | Stringify<A>

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

export class Stringify<A> {
  readonly _tag = "Stringify"
  constructor(readonly op: Expr<number>, readonly _A: (a: string) => A) {}
}

export function concat(op2: Expr<string>) {
  return (op1: Expr<string>): Expr<string> => new Concat(op1, op2, identity)
}

export function stringify(op: Expr<number>): Expr<string> {
  return new Stringify(op, identity)
}

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
  return (left: Expr<number>): Expr<number> => new Mul(left, right, identity)
}

export function div(right: Expr<number>) {
  return (left: Expr<number>): Expr<number> => new Div(left, right, identity)
}

/**
 * Exercise:
 *
 * Extend the Expr GADT to support:
 *
 * 2) Concat (that concatenates 2 Expr<string>)
 * 3) Stringify (that converts Expr<number> into Expr<string>)
 * Updating the interpreter as you go through.
 */

/**
 * Exercise:
 *
 * Write a program that uses the new primitives and test its behaviour
 */

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
      Stringify: ({ _A, op }) => _A(`${evaluate(op)}`)
    })
  )
}

export const program: Expr<string> = pipe(
  numericValue(3),
  add(numericValue(9)),
  div(numericValue(4)),
  stringify,
  concat(stringValue("pizza"))
)

// START REC
