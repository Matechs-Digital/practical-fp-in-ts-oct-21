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
class Id<A> {
  constructor(readonly a: A) {}

  map<A, B>(this: Id<A>, f: (a: A) => B): Id<B> {
    return new Id(f(this.a))
  }
}

/**
 * Exercise:
 *
 * Build a module Math with 4 behaviour fuctions `add`, `mul`, `sub`, `div` that acts on numbers both in pipeable and fluent variants
 */
