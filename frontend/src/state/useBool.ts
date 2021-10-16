import { useCallback, useMemo, useState } from "react";

export const useBool = (initial: boolean) => {
  const [state, setState] = useState(initial);
  const set = useCallback(() => setState(true), []);
  const unset = useCallback(() => setState(false), []);
  const toggle = useCallback(() => setState(!state), [state]);
  return useMemo(
    () => ({
      state,
      set,
      unset,
      toggle,
    }),
    [set, state, toggle, unset]
  );
};
