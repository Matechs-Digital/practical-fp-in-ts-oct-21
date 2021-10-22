import * as T from "@effect-ts/core/Effect"
import * as Ref from "@effect-ts/core/Effect/Ref"

describe("Mars Rover", () => {
  it("should go forward when pointing north", () =>
    T.runPromise(
      T.gen(function* (_) {
        const myRef = yield* _(Ref.makeRef(0))

        expect(yield* _(Ref.get(myRef))).toEqual(1)
      })
    ))

  //it("should go forward when pointing north", async () => {
  //  const myRef = await T.runPromise(Ref.makeRef(0))
  //const result = await T.runPromiseExit(
  //  MR.move(
  //    new MR.RoverState({
  //      orientation: new MR.North(),
  //      position: new MR.Position({
  //        x: 0 as MR.PositionX,
  //        y: 9 as MR.PositionY
  //      })
  //    }),
  //    new MR.Planet({
  //      gridSize: new MR.GridSize({
  //        width: 10 as MR.Width,
  //        hight: 10 as MR.Hight
  //      }),
  //      obstacles: pipe(
  //        HS.make<MR.Position>(),
  //        HS.add(
  //          new MR.Position({
  //            x: 0 as MR.PositionX,
  //            y: 0 as MR.PositionY
  //          })
  //        )
  //      )
  //    }),
  //    new MR.GoForward()
  //  )
  //)
  //
  //expect(Ex.untraced(result)).toEqual(
  //  Ex.fail(
  //    new MR.CollisionDetected({
  //      obstaclePosition: new MR.Position({
  //        x: 0 as MR.PositionX,
  //        y: 0 as MR.PositionY
  //      }),
  //      roverPosition: new MR.Position({
  //        x: 0 as MR.PositionX,
  //        y: 9 as MR.PositionY
  //      })
  //    })
  //  )
  //)
  //})
})
