/**
 * Theory:
 *
 * Intro to algebraic data types & domain specific languages and their place in functional programming in general.
 *
 * In this module we introduce the basic concepts of domain specific languages and we look into practical ways of building DSLs for
 * your day-to-day problems.
 */

import { pipe } from "@effect-ts/system/Function"

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

export declare const trueValue: BooleanADT

export declare const falseValue: BooleanADT

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
export type MathExpr = Value | Add | Sub | Mul | Div

export class Value {
  readonly _tag = "Value"
  constructor(readonly value: number) {}
}

export class Add {
  readonly _tag = "Add"
  constructor(readonly x: MathExpr, readonly y: MathExpr) {}
}

export class Sub {
  readonly _tag = "Sub"
  constructor(readonly x: MathExpr, readonly y: MathExpr) {}
}

export class Mul {
  readonly _tag = "Mul"
  constructor(readonly x: MathExpr, readonly y: MathExpr) {}
}

export class Div {
  readonly _tag = "Div"
  constructor(readonly x: MathExpr, readonly y: MathExpr) {}
}

/**
 * Exercise:
 *
 * Create constructors for all the members in MathExpr (pipeable)
 */
export function value(value: number): MathExpr {
  return new Value(value)
}

export function add(y: MathExpr): (x: MathExpr) => MathExpr {
  return (x) => new Add(x, y)
}

export function sub(y: MathExpr): (x: MathExpr) => MathExpr {
  return (x) => new Sub(x, y)
}

export function mul(y: MathExpr): (x: MathExpr) => MathExpr {
  return (x) => new Mul(x, y)
}

export function div(y: MathExpr): (x: MathExpr) => MathExpr {
  return (x) => new Div(x, y)
}

/**
 * Exercise:
 *
 * Create a small program using the MathExpr constructors
 */
export const program = pipe(
  value(0),
  add(pipe(value(1), mul(value(10)))),
  add(value(2)),
  mul(value(3))
)

/**
 * Exercise:
 *
 * Implement the function evaluate
 */
export function evaluate(expr: MathExpr): number {
  switch (expr._tag) {
    case "Value": {
      return expr.value
    }
    case "Add": {
      return evaluate(expr.x) + evaluate(expr.y)
    }
    case "Mul": {
      return evaluate(expr.x) * evaluate(expr.y)
    }
    case "Sub": {
      return evaluate(expr.x) - evaluate(expr.y)
    }
    case "Div": {
      return evaluate(expr.x) / evaluate(expr.y)
    }
  }
}

/**
 * Exercise:
 *
 * Write tests that assert correct behaviour of the evaluate function
 */
