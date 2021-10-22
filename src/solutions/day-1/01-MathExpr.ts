/**
 * Theory:
 *
 * Intro to pure functions and functional programming in general.
 *
 * In this module we introduce the basic concepts of functional programming and we take a look at the style of APIs that we will encounter later on.
 */
/**
 * Segment:
 *
 * Fluent vs Pipeable
 */
//
// example code with simple identity
//
/**
 * Exercise:
 *
 * Build a module Math with 4 behaviour fuctions `add`, `mul`, `sub`, `div` that acts on numbers both in pipeable and fluent variants
 */

export interface MathExpr {
  readonly n: number
}

export function fromNumber(n: number): MathExpr {
  return { n }
}

export function add(that: MathExpr) {
  return (self: MathExpr): MathExpr => ({ n: self.n + that.n })
}

export function mul(that: MathExpr) {
  return (self: MathExpr): MathExpr => ({ n: self.n * that.n })
}

export function sub(that: MathExpr) {
  return (self: MathExpr): MathExpr => ({ n: self.n - that.n })
}

export function div(that: MathExpr) {
  return (self: MathExpr): MathExpr => ({ n: self.n / that.n })
}

export function get(self: MathExpr): number {
  return self.n
}
