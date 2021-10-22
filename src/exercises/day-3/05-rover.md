# Enhanced Mars Rover Kata

You’re part of the team that explores Mars by sending remotely controlled vehicles to the surface of the planet.
Implement an application that simulates the movement of a rover on a planet with data provided by user.

For a full kata explanation see: https://kata-log.rocks/mars-rover-kata

## V1 - Focus on the center (pure domain logic)

Develop an API (types and functions) that executes single command:

- The planet is divided into a grid with x (width) and y (height) size.
- The rover has a position expressed as x, y co-ordinates and an orientation (North, Est, West, South).
- The rover can handle four commands: turn left or right, move forward or backward.
- Implement wrapping from one edge of the grid to another (pacman effect).

## V2 - More domain logic (effect in domain logic)

Extend the API to handle many commands and obstacle:

- Commands are sent in batch (like an array) and executed sequentially. Report only the final position.
- There are many obstacles on the planet. An obstacle has a position expressed as x, y co-ordinates.
- If a given sequence of commands encounters an obstacle, the rover moves up to the last possible point and aborts the
  sequence.

## V3 - Focus on boundaries (from primitive types to domain types and viceversa)

Our domain is declared with rich types but inputs/outputs are primitives

- Write a parser for the planet (grid) size: "5x4"
- Write a parser for a list of obstacles: "1,2 0,0 3,4"
- Write a parser for rover initial state: "1,3:W"
- Render result as string:
  - normal: "positionX:positionY:direction"
  - when hit obstacle "O:positionX:positionY:direction"

## V4 - Focus on infrastructure (compose I/O operations)

Extend the "pure" way of work also to the infrastructural layer

- Lift strings (initial state) into IO monads and execute commands
- Read planet.txt from file into IO (size and obstacles)
- Read rover.txt from file into IO (position and direction)
- Read commands from console into IO (ask to the user)
- Simulate handled/unhandled errors

## V5 - Application service (encapsulate use-case)

Write a use case runner that encapsulate wiring and execution: domain, infrastructure and error handling

- Define a function that accepts file paths and produce an application:
  - run the whole app lifted in the IO monad
  - Print final rover output to the console if everything is ok
  - Handle, safely, any unhandled exception and print them

## V6 - Obtain interactivity and testability (Elm Architecture aka Programs As Values)

Use values to obtain a strong separation between domain and infrastructure logic

- implement init, update and test them without infrastructure and mocks
- implement infrastructure and test it with integration tests

## V7 - Obtain interactivity and testability (Dependency Inversion Principle via Typeclasses)

Use custom Higher-Kinded Typeclasses as ports towards the infrastructure

- Define Console[F[_]], Logger[F[_]] and MissionSource[F[_]] traits with basic and derived combinators
- Implements traits instances
- Use implicit parameters in application service function
- Test with mock instances
