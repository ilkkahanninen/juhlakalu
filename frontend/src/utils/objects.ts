import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/lib/function";

export const keys = <O extends object>(obj: O): Array<keyof O> =>
  Object.keys(obj) as Array<keyof O>;

export const patchObjArray =
  <S extends object, K>(identify: (s: S) => K) =>
  (s: S) =>
  (sa: S[]): S[] =>
    pipe(
      sa,
      A.map((p) => (identify(s) === identify(p) ? s : p))
    );

export const patchObjArrayByProp = <S extends object>(prop: keyof S) =>
  patchObjArray((s: S) => s[prop]);

export const patchObjArrayById = <S extends { id: number }>(s: S) =>
  patchObjArrayByProp<S>("id")(s);
