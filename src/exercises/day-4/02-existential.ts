/**
 * Theory:
 *
 * Intro to existential types and their place in functional programming in general.
 *
 * In this module we introduce existential types as types that exists within a bounded context.
 */

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
export type Expr<A> = {}

/**
 * Exercise:
 *
 * Implement the evaluate function
 */
export declare function evaluate<A>(expr: Expr<A>): A

/**
 * Exercise:
 *
 * Write a program that uses the new chain primitive and test it
 */
export declare const program: Expr<string>
