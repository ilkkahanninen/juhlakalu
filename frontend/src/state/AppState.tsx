import { Lens } from "monocle-ts";
import { User } from "../rust-types/User";
import { createStoreContext } from "./storeContext";
import { useOnMount } from "./useOnMount";

// State structure and initial values

export type AppState = {
  user?: User;
};

export const initialState: AppState = {
  user: undefined,
};

// Lenses

const rootProp = Lens.fromProp<AppState>();

export const userL = rootProp("user");

// React context

const AppState = createStoreContext(initialState);

export const AppStateProvider = AppState.Provider;
export const useAppState = AppState.useStoredState;

export const useResetState = <T,>(lens: Lens<AppState, T>, initialState: T) => {
  const { dispatch } = useAppState();
  useOnMount(() => {
    dispatch(lens.set(initialState));
  });
};
