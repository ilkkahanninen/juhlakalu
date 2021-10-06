import { createContext, useContext, useState } from "react";
import { StoreHook, useStore } from "./useStore";

export type StoreProviderProps = {
  children: React.ReactNode;
};

export const createStoreContext = <T,>(initialState: T) => {
  const StoreContext = createContext<StoreHook<T>>({
    state: initialState,
    dispatch: (_f) => {},
    dispatchTask: async (_t, _l) => {},
    dispatchTaskEither: async (_te, _l, _r) => {},
  });

  const Provider = (props: StoreProviderProps) => {
    const value = useStore(initialState);
    return <StoreContext.Provider {...props} value={value} />;
  };

  const useStoredState = () => useContext(StoreContext);

  return {
    Provider,
    useStoredState,
  };
};
