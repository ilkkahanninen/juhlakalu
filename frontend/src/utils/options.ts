import * as O from "fp-ts/Option";

export const renderOption = (e: O.Option<JSX.Element>) =>
  O.fold(
    () => null,
    (element) => element
  )(e);
