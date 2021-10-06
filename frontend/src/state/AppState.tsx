import { Lens } from "monocle-ts";
import { ErrorMessage } from "../rust-types/ErrorMessage";
import { User } from "../rust-types/User";
import { AsyncState, initialAsyncState } from "./asyncState";
import { createStoreContext } from "./storeContext";
import { useOnMount } from "./useOnMount";

// State structure and initial values

export type AppState = {
  user?: User;
  error?: ErrorMessage;
  loginView: AsyncState;
  signupView: AsyncState;
};

export const initialState: AppState = {
  user: undefined,
  error: undefined,
  loginView: initialAsyncState,
  signupView: initialAsyncState,
};

// Lenses

const rootProp = Lens.fromProp<AppState>();
const rootPath = Lens.fromPath<AppState>();

export const userL = rootProp("user");
export const errorL = rootProp("error");

export const loginViewL = rootProp("loginView");
export const loginErrorL = rootPath(["loginView", "error"]);
export const loginIsLoadingL = rootPath(["loginView", "isLoading"]);

export const signupViewL = rootProp("signupView");
export const signupErrorL = rootPath(["signupView", "error"]);
export const signupIsLoadingL = rootPath(["signupView", "isLoading"]);

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
