/**
 * Implement the Mars Rover Kata (Long, not too hard):
 *
 * Find the description at:
 * https://github.com/doubleloop-io/avanscoperta-applied-fp-workshop-scala/blob/master/marsroverkata/TODO.md
 *
 * In case we don't manage to finish it an implementation (slightly outdated) can be found at:
 * https://github.com/Matechs-Garage/mars-rover-kata
 */
import { Tagged } from "@effect-ts/core/Case"

export interface IntBrand {
  readonly Int: unique symbol
}

export type Int = number & IntBrand

export class GridSize extends Tagged("GridSize")<{
  readonly width: Int
  readonly hight: Int
}> {}

export class Planet extends Tagged("Planet")<{
  readonly gridSize: GridSize
}> {}
