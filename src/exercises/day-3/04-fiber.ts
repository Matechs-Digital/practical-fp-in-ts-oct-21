/**
 * Theory:
 *
 * Introduction to the Fiber module: Fibers can be considered as lightweight threads, they are the backing system of the Effect data type.
 *
 * Fibers are the result of either running an effect or forking a child effect from a parent
 *
 * Once created Fibers can be joined, awaited and composed toghether with other fibers in multiple ways
 */

/**
 * Exercise:
 *
 * Write a program that forks two copies of the same sub-program.
 *
 * The sub-program should print to the console a progressive counter starting from 0 every second.
 *
 * Hint: use T.fork to launch the proccessed and F.join to wait
 */

/**
 * Exercise:
 *
 * Explore the Fiber module API.
 */
