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

class MathExpr {
  static fromNumber(n: number): MathExpr {
    return new MathExpr(n)
  }

  constructor(readonly n: number) {}

  add(this: MathExpr, that: MathExpr) {
    return new MathExpr(this.n + that.n)
  }

  mul(this: MathExpr, that: MathExpr) {
    return new MathExpr(this.n * that.n)
  }

  div(this: MathExpr, that: MathExpr) {
    return new MathExpr(this.n / that.n)
  }

  get(this: MathExpr): number {
    return this.n
  }
}

MathExpr.fromNumber(0).add(MathExpr.fromNumber(0)).get()
