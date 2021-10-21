import * as T from "@effect-ts/core/Effect"
import * as Sh from "@effect-ts/core/Effect/Schedule"
import * as S from "@effect-ts/core/Effect/Stream"
import { pipe } from "@effect-ts/system/Function"

pipe(
  S.fromSchedule(Sh.exponential(200)),
  S.take(5),
  S.mapM((element) =>
    T.succeedWith(() => {
      console.log(`got element: ${element}`)
    })
  ),
  S.runDrain,
  T.runPromise
)
