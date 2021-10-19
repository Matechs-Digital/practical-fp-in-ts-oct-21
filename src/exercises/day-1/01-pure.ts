import { pipe } from "@effect-ts/system/Function"

import * as MathExpr from "./01-MathExpr"

export const x = pipe(
  MathExpr.fromNumber(0),
  MathExpr.add(MathExpr.fromNumber(1)),
  MathExpr.mul(MathExpr.fromNumber(2)),
  MathExpr.get
)
