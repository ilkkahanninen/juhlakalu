export const keys = <O extends object>(obj: O): Array<keyof O> =>
  Object.keys(obj) as Array<keyof O>;
