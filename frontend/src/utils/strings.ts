export const joinClassNames = (...names: Array<string | undefined>) =>
  names.filter((n) => n).join(" ");

export const emptyAsNull = (str: string): string | null => str || null;
