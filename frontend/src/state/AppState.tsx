import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { Lens } from "monocle-ts";
import React, { useContext, useMemo, useState } from "react";
import { ErrorMessage } from "../rust-types/ErrorMessage";
import { User } from "../rust-types/User";

// State structure and initial values

export type AppState = {
  user?: User;
  error?: ErrorMessage;
  loginView: {
    error?: ErrorMessage;
  };
};

export const initialState: AppState = {
  user: undefined,
  error: undefined,
  loginView: {
    error: undefined,
  },
};

// Lenses

const rootProp = Lens.fromProp<AppState>();
const rootPath = Lens.fromPath<AppState>();

export const userL = rootProp("user");
export const errorL = rootProp("error");

export const loginErrorL = rootPath(["loginView", "error"]);

// React context

export type AppStateMapFn = (s: AppState) => AppState;
export type AppStateDispatchFn = (f: AppStateMapFn) => void;
export type AppStateDispatchTaskFn = <A>(
  task: T.Task<A>,
  map: (a: A) => AppStateMapFn
) => Promise<void>;
export type AppStateDispatchTaskEitherFn = <E, A>(
  task: TE.TaskEither<E, A>,
  mapLeft: (e: E) => AppStateMapFn,
  mapRight: (a: A) => AppStateMapFn
) => Promise<void>;
export type AppStateContextValue = {
  state: AppState;
  dispatch: AppStateDispatchFn;
  dispatchTask: AppStateDispatchTaskFn;
  dispatchTaskEither: AppStateDispatchTaskEitherFn;
};

const AppStateContext = React.createContext<AppStateContextValue>({
  state: initialState,
  dispatch: (_f) => {},
  dispatchTask: async (_t, _l) => {},
  dispatchTaskEither: async (_te, _l, _r) => {},
});

export type AppStateProviderProps = {
  children: React.ReactNode;
};

export const AppStateProvider = (props: AppStateProviderProps) => {
  const [state, setState] = useState(initialState);

  const dispatch: AppStateDispatchFn = setState;

  const dispatchTask: AppStateDispatchTaskFn = async (task, map) =>
    pipe(await task(), map, dispatch);

  const dispatchTaskEither: AppStateDispatchTaskEitherFn = async (
    task,
    mapLeft,
    mapRight
  ) => pipe(await task(), E.match(mapLeft, mapRight), dispatch);

  const value = useMemo(
    () => ({ state, dispatch, dispatchTask, dispatchTaskEither }),
    [state]
  );

  return (
    <AppStateContext.Provider value={value}>
      {props.children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
