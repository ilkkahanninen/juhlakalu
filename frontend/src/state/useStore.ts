import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { useCallback, useEffect, useMemo, useState } from "react";

export type StateMapFn<T> = (s: T) => T;
export type StateDispatchFn<T> = (f: StateMapFn<T>) => void;
export type StateDispatchTaskFn<T> = (
  task: T.Task<T>,
  map: (a: T) => StateMapFn<T>
) => Promise<void>;
export type StateDispatchTaskEitherFn<T> = <E, A>(
  task: TE.TaskEither<E, A>,
  mapLeft: (e: E) => StateMapFn<T>,
  mapRight: (a: A) => StateMapFn<T>
) => Promise<void>;

export type StoreHook<T> = {
  state: T;
  dispatch: StateDispatchFn<T>;
  dispatchTask: StateDispatchTaskFn<T>;
  dispatchTaskEither: StateDispatchTaskEitherFn<T>;
};

export const useStore = <T>(initialState: T): StoreHook<T> => {
  const [mounted, setMounted] = useState(true);
  useEffect(() => () => setMounted(false), []);

  const [state, setState] = useState(initialState);

  const dispatch: StateDispatchFn<T> = useCallback(
    (state) => {
      mounted && setState(state);
    },
    [mounted]
  );

  const dispatchTask: StateDispatchTaskFn<T> = useCallback(
    async (task, map) => pipe(await task(), map, dispatch),
    [dispatch]
  );

  const dispatchTaskEither: StateDispatchTaskEitherFn<T> = useCallback(
    async (task, mapLeft, mapRight) =>
      pipe(await task(), E.match(mapLeft, mapRight), dispatch),
    [dispatch]
  );

  return useMemo(
    () => ({ state, dispatch, dispatchTask, dispatchTaskEither }),
    [dispatch, dispatchTask, dispatchTaskEither, state]
  );
};

export const ignoreDispatch =
  <A>() =>
  (a: A) =>
    a;
