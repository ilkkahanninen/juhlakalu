import * as string from "fp-ts/string";
import * as F from "./forms";

// Atomic validators

export const strMinLength = (minLength: number, error: string) =>
  F.validator(
    (s: string) => s.length >= minLength,
    () => error
  );

export const equals = <T>(error: string) =>
  F.compareValidator(
    (a: T, b: T) => a === b,
    () => error
  );

export const trim = F.formatter(string.trim);

// Higher level validators

export const notEmpty = strMinLength(1, "Cannot be empty");

export const username = F.combine(
  trim,
  strMinLength(4, "User name is too short")
);

export const password = F.combine(
  trim,
  strMinLength(8, "Password is too short")
);

export const passwordsMatch = equals<string>("Passwords do not match");
