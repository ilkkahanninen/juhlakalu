import { useEffect, useRef } from "react";
import { areEqual } from "../utils/arrays";

export const useOnChange = <A extends any[]>(
  fn: (...args: A) => void,
  values: A
) => {
  const ref = useRef(values);
  useEffect(() => {
    if (!areEqual(ref.current, values)) {
      ref.current = values;
      fn(...values);
    }
  }, [fn, values]);
};
