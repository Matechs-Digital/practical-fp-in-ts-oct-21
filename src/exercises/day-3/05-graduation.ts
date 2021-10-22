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
import * as HS from "@effect-ts/core/Collections/Immutable/HashSet"
import * as T from "@effect-ts/core/Effect"
import * as Ref from "@effect-ts/core/Effect/Ref"
import { hole } from "@effect-ts/system/Function"

export interface IntBrand {
  readonly Int: unique symbol
}

export type Int = number & IntBrand

export interface WidthBrand {
  readonly Width: unique symbol
}

export type Width = Int & WidthBrand

export interface HightBrand {
  readonly Hight: unique symbol
}

export type Hight = Int & HightBrand

export class GridSize extends Tagged("GridSize")<{
  readonly width: Width
  readonly hight: Hight
}> {}

export class Planet extends Tagged("Planet")<{
  readonly gridSize: GridSize
  readonly obstacles: HS.HashSet<Position>
}> {}

export class North extends Tagged("North")<{}> {}
export class Est extends Tagged("Est")<{}> {}
export class West extends Tagged("West")<{}> {}
export class South extends Tagged("South")<{}> {}

export type Orientation = North | Est | West | South

export interface PositionXBrand {
  readonly PositionX: unique symbol
}

export type PositionX = Int & PositionXBrand

export interface PositionYBrand {
  readonly PositionY: unique symbol
}

export type PositionY = Int & PositionYBrand

export class Position extends Tagged("Position")<{
  readonly x: PositionX
  readonly y: PositionY
}> {}

export class RoverState extends Tagged("Rover")<{
  readonly position: Position
  readonly orientation: Orientation
}> {}

export class TurnLeft extends Tagged("TurnLeft")<{}> {}
export class TurnRight extends Tagged("TurnRight")<{}> {}
export class GoForward extends Tagged("GoForward")<{}> {}
export class GoBackward extends Tagged("GoBackward")<{}> {}

export type Command = TurnLeft | TurnRight | GoForward | GoBackward

export function mod(x: Int, y: Int): Int {
  return Math.abs(x % y) as Int
}
export function add(x: Int, y: Int): Int {
  return (x + y) as Int
}
export function sub(x: Int, y: Int): Int {
  return (x - y) as Int
}
export const one = 1 as Int

export class CollisionDetected extends Tagged("CollisionDetected")<{
  readonly obstaclePosition: Position
  readonly roverPosition: Position
}> {}

export function processBatch(
  planet: Planet,
  commands: readonly Command[],
  currentRoverStateRef: Ref.Ref<RoverState>
): T.IO<CollisionDetected, void> {
  return T.forEach_(commands, (command) => move(planet, command, currentRoverStateRef))
}

export function move(
  planet: Planet,
  command: Command,
  currentRoverStateRef: Ref.Ref<RoverState>
): T.IO<CollisionDetected, void> {
  return T.gen(function* (_) {
    const rover = yield* _(Ref.get(currentRoverStateRef))

    const next = nextPosition(rover, planet, command)

    if (HS.has_(planet.obstacles, next.position)) {
      return T.fail(
        new CollisionDetected({
          obstaclePosition: next.position,
          roverPosition: rover.position
        })
      )
    }

    yield* _(Ref.set_(currentRoverStateRef, next))
  })
}

export function nextPosition(
  rover: RoverState,
  planet: Planet,
  command: Command
): RoverState {
  switch (command._tag) {
    case "GoForward": {
      switch (rover.orientation._tag) {
        case "North": {
          return rover.copy({
            position: rover.position.copy({
              y: mod(add(rover.position.y, one), planet.gridSize.hight) as PositionY
            })
          })
        }
        case "Est": {
          return hole()
        }
        case "South": {
          return hole()
        }
        case "West": {
          return hole()
        }
      }
    }
    case "GoBackward": {
      return hole()
    }
    case "TurnLeft": {
      return hole()
    }
    case "TurnRight": {
      return hole()
    }
  }
}
