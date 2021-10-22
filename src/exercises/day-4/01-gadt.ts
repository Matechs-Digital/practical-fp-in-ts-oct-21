/**
 * Theory:
 *
 * Intro to generalized algebraic data types and their place in functional programming in general.
 *
 * In this module we introduce a generalization to algebraic data types required to deal with generic patameters.
 */

/**
 * Segment:
 *
 * GADTs
 */

/**
 * Exercise:
 *
 * In the ADT module we have seen how to construct data representations for the syntax of a simple
 * MathExpr module represented as a union type of primitives.
 *
 * We now would like to generalize the MathExpr to a generic Expr<A> with the primitives of MathExpr
 * restricted to Expr<number>
 */

export type Expr<A> = never

/**
 * Exercise:
 *
 * Implement the evaluate function
 */

export declare function evaluate<A>(expr: Expr<A>): A

/**
 * Exercise:
 *
 * Add new primitives to support:
 * - string based values
 * - stringification of a numeric expressions
 * - concatenation of string expression
 */

/**
 * Exercise:
 *
 * Write a program that uses the new primitives and test its behaviour
 */

export declare const program: Expr<string>
