import { Lens } from "monocle-ts";
import { Compo } from "../rust-types/Compo";
import { CompoState } from "../rust-types/CompoState";
import { User } from "../rust-types/User";
import { createStoreContext } from "./storeContext";
import { useOnMount } from "./useOnMount";

// State structure and initial values

export type AppState = {
  user?: User;
  compos: Compo[];
  compoStates: CompoState[];
};

export const initialState: AppState = {
  user: undefined,
  compos: [],
  compoStates: [],
};

// Lenses

const rootProp = Lens.fromProp<AppState>();

export const userL = rootProp("user");
export const composL = rootProp("compos");
export const compoStatesL = rootProp("compoStates");

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
