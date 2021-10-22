import * as MR from "@app/exercises/day-3/05-graduation"

describe("Mars Rover", () => {
  it("should go forward when pointing north", () => {
    expect(
      MR.move(
        new MR.Rover({
          orientation: new MR.North(),
          position: new MR.Position({
            x: 0 as MR.PositionX,
            y: 9 as MR.PositionY
          })
        }),
        new MR.Planet({
          gridSize: new MR.GridSize({
            width: 10 as MR.Width,
            hight: 10 as MR.Hight
          })
        }),
        new MR.GoForward()
      )
    ).toEqual(
      new MR.Rover({
        orientation: new MR.North(),
        position: new MR.Position({
          x: 0 as MR.PositionX,
          y: 0 as MR.PositionY
        })
      })
    )
  })
})
