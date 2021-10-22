/**
 * Graduation:
 *
 * Putting together all the context so far we will build a minimal implementation of Schema.
 *
 * Schema is a module to describe data-types that enable derivation of Parser, Guard and potentially other utilities.
 */

/**
 * Write tests while implementing
 */

/**
 * Exercise:
 *
 * Let's start by implementing the following primitives that represent:
 *
 * 1) string values
 * 2) number values
 * 3) uknown values
 */

/**
 * Exercise:
 *
 * implement the parse function that derive a Parser from a schema
 */

/**
 * Exercise:
 *
 * We would like to compose parsers and schemas in general, namely we would like Schema<A> to become
 * Schema<I, A> where I represent the row input of the parser ad A represents
 * the parsed model.
 *
 * First extend Schema to become Schema<I, A> then create a new primitive
 * SchemaCompose<I, A> that composes Schema<I, T> with Schema<T, A> to represent the
 * activity of first parsing I to T then parsing T to A
 */

/**
 * Exercise:
 *
 * Add a new primitive SchemaStringNumber that represent a Number encoded as a string
 */

/**
 * Exercise:
 *
 * Use the new primitive with compose to create a Schema<unknonw, number> that
 * is encoded as a string
 */

/**
 * Exercise:
 *
 * Add new primitives SchemaArray and SchemaUnknownArray
 */

/**
 * Exercise:
 *
 * Add:
 *
 * 1) new primitives SchemaRecord and SchemaObject
 *
 * 2) a constructor fuction that takes a record of schemas
 *    { a: Schema<unknown, A>, b: Schema<unknown, B>, c: Schema<unknown, C> }
 *    and constructs Schema<{}, { a: A, b: B, c: C }>
 *
 * 3) a schema object Schema<unknown, {}>
 *
 * 4) a constructor that composes 2 & 3
 */

/**
 * Exercise:
 *
 * Add a method [">>>"] in schema to perform composition like: object[">>>"](struct({a: ...}))
 */

/**
 * Exercise:
 *
 * implement the guard function that derive a Guard from a schema
 */
