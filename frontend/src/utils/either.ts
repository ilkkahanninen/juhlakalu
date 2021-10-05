import * as E from "fp-ts/Either";

// Symmetric eithers
export const symMap = <T, S>(f: (t: T) => S) => E.bimap(f, f);
export const symFold = <T, S>(f: (t: T) => S) => E.fold(f, f);
export const symFlatten = <T>(e: E.Either<T, T>): T =>
  E.fold(
    (t: T) => t,
    (t: T) => t
  )(e);

export const tapEither =
  <E, A>(fn: (e: E.Either<E, A>) => void) =>
  (e: E.Either<E, A>) => {
    fn(e);
    return e;
  };
