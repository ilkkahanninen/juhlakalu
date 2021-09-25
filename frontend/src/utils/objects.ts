export const setter =
  <T extends object>() =>
  <K extends keyof T>(key: K) =>
  (value: T[K]) =>
  (obj: T) => ({ ...obj, [key]: value });
