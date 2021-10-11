/**
 * Theory:
 *
 * Intro to algebraic data types & domain specific languages and their place in functional programming in general.
 *
 * In this module we introduce the basic concepts of domain specific languages and we look into practical ways of building DSLs for
 * your day-to-day problems.
 */

import { pipe } from "@effect-ts/core/Function"
import { matchTag } from "@effect-ts/core/Utils"

/**
 * Segment:
 *
 * ADTs
 */

/**
 * Exercise:
 *
 * Costruct the Boolean ADT and 3 functions: equals, invert, render
 */
export class True {
  readonly _tag = "True"
}

export class False {
  readonly _tag = "False"
}

export type BooleanADT = True | False

export const trueValue: BooleanADT = new True()

export const falseValue: BooleanADT = new False()

export function invert(self: BooleanADT): BooleanADT {
  return pipe(
    self,
    matchTag({
      False: () => trueValue,
      True: () => falseValue
    })
  )
}

export function equals(bool2: BooleanADT) {
  return (bool1: BooleanADT) => bool1._tag === bool2._tag
}

export function render(a: BooleanADT) {
  switch (a._tag) {
    case "False":
      return "False"
    case "True":
      return "True"
  }
}

/**
 * Exercise:
 *
 * Build an adt MathExpr with members:
 * - Value (contains a numeric value)
 * - Add (describe a sum operation of 2 expressions)
 * - Sub (describe a subtraction operation of 2 expressions)
 * - Mul (describe a multiplication operation of 2 expressions)
 * - Div (describe a division operation of 2 expressions)
 */
export class Value {
  readonly _tag = "Value"
  constructor(readonly value: number) {}
}

export class Add {
  readonly _tag = "Add"
  constructor(readonly op1: MathExpr, readonly op2: MathExpr) {}
}

export class Sub {
  readonly _tag = "Sub"
  constructor(readonly op1: MathExpr, readonly op2: MathExpr) {}
}

export class Mul {
  readonly _tag = "Mul"
  constructor(readonly op1: MathExpr, readonly op2: MathExpr) {}
}

export class Div {
  readonly _tag = "Div"
  constructor(readonly op1: MathExpr, readonly op2: MathExpr) {}
}

export function value(value: number): MathExpr {
  return new Value(value)
}

export function add(op2: MathExpr) {
  return (op1: MathExpr): MathExpr => new Add(op1, op2)
}

export function sub(op2: MathExpr) {
  return (op1: MathExpr): MathExpr => new Sub(op1, op2)
}

export function mul(op2: MathExpr) {
  return (op1: MathExpr): MathExpr => new Mul(op1, op2)
}

export function div(op2: MathExpr) {
  return (op1: MathExpr): MathExpr => new Div(op1, op2)
}

export type MathExpr = Value | Add | Sub | Mul | Div

/**
 * Exercise:
 *
 * Create constructors for all the members in MathExpr (pipeable)
 */

/**
 * Exercise:
 *
 * Create a small program using the MathExpr constructors
 */
export const program: MathExpr = pipe(
  value(2),
  add(value(3)),
  sub(value(4)),
  mul(value(2)),
  div(value(5))
)

/**
 * Exercise:
 *
 * Implement the function evaluate
 */
export function evaluate(expr: MathExpr): number {
  return pipe(
    expr,
    matchTag({
      Add: ({ op1, op2 }) => evaluate(op1) + evaluate(op2),
      Sub: ({ op1, op2 }) => evaluate(op1) - evaluate(op2),
      Div: ({ op1, op2 }) => evaluate(op1) / evaluate(op2),
      Mul: ({ op1, op2 }) => evaluate(op1) * evaluate(op2),
      Value: (v) => v.value
    })
  )
}

/**
 * Exercise:
 *
 * Write tests that assert correct behaviour of the evaluate function
 */
