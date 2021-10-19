import { pipe } from "@effect-ts/system/Function"

import * as MathExpr from "./01-MathExpr"

const x = pipe(
  MathExpr.fromNumber(0),
  MathExpr.add(MathExpr.fromNumber(0)),
  MathExpr.mul(MathExpr.fromNumber(0)),
  MathExpr.get
)
