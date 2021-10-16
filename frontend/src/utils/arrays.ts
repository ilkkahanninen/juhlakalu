import * as A from "fp-ts/Array";
import * as Eq from "fp-ts/Eq";

const strictArrEq = A.getEq(Eq.eqStrict);

export const areEqual = strictArrEq.equals;
