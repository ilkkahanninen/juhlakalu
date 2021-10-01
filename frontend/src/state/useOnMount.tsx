import { EffectCallback, useEffect } from "react";

export const useOnMount = (effect: EffectCallback) => {
  useEffect(effect, []); // eslint-disable-line react-hooks/exhaustive-deps
};
