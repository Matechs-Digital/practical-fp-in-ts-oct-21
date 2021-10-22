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

export interface WidthBrand {
  readonly Width: unique symbol
}

export type Width = number & WidthBrand

export interface HightBrand {
  readonly Hight: unique symbol
}

export type Hight = number & HightBrand

export class GridSize extends Tagged("GridSize")<{
  readonly width: Width
  readonly hight: Hight
}> {}

export class Planet extends Tagged("Planet")<{
  readonly gridSize: GridSize
}> {}

export class North extends Tagged("North")<{}> {}
export class Est extends Tagged("Est")<{}> {}
export class West extends Tagged("West")<{}> {}
export class South extends Tagged("South")<{}> {}

export type Orientation = North | Est | West | South

export interface PositionXBrand {
  readonly PositionX: unique symbol
}

export type PositionX = number & PositionXBrand

export interface PositionYBrand {
  readonly PositionY: unique symbol
}

export type PositionY = number & PositionYBrand

export class Position extends Tagged("Position")<{
  readonly x: PositionX
  readonly y: PositionY
}> {}

export class Rover extends Tagged("Rover")<{
  readonly position: Position
  readonly orientation: Orientation
}> {}
