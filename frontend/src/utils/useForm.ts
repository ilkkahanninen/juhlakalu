import * as E from "fp-ts/Either";
import { constant, pipe } from "fp-ts/lib/function";
import { useCallback, useMemo, useState } from "react";
import { symFlatten, symMap } from "./either";
import {
  AsForm,
  FormValidation,
  fromDataObject,
  toDataObject,
  validateAll,
  ValidatedForm,
  validateTouched,
} from "./forms";

export type FormHook<T extends object> = {
  state: AsForm<T>;
  hasErrors: boolean;
  initState: FormInitStateFn<T>;
  setState: FormSetStateFn<T>;
  validate: () => void;
  asData: FormAsDataFn<T>;
};

export type FormInitStateFn<T extends object> = (t: T) => void;

export type FormSetStateFn<T extends object> = (
  modify: (f: AsForm<T>) => AsForm<T>
) => void;

export type FormAsDataFn<T> = () => T;

export type FormHookAccessor<T extends object> = [
  AsForm<T>,
  (setter: (f: AsForm<T>) => AsForm<T>) => void
];

type InternalState<T extends object> = [AsForm<T>, boolean];

const toInternalState = <T extends object>(
  input: ValidatedForm<AsForm<T>>
): InternalState<T> =>
  pipe(
    input,
    E.fold(
      (left) => [left, true] as InternalState<T>,
      (right) => [right, false] as InternalState<T>
    )
  );

const validatePartially =
  <T extends object>(validation: FormValidation<AsForm<T>>) =>
  (input: AsForm<T>) => {
    return pipe(
      validation(validateAll)(input),
      symMap(() => validation(validateTouched)(input)),
      symMap(symFlatten),
      toInternalState
    );
  };

export const useForm = <T extends object>(
  initialData: T,
  validation: FormValidation<AsForm<T>>
): FormHook<T> => {
  const initialState = useMemo(
    () => pipe(initialData, fromDataObject, validatePartially(validation)),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [[form, hasErrors], setState] =
    useState<InternalState<T>>(initialState);

  const setFormState = useCallback(
    (modify: (f: AsForm<T>) => AsForm<T>) =>
      pipe(modify(form), validatePartially(validation), setState),
    [form, validation]
  );

  const initFormState: FormInitStateFn<T> = useCallback(
    (data) => pipe(data, fromDataObject, constant, setFormState),
    [setFormState]
  );

  const validateForm = useCallback(
    () => pipe(form, validation(validateAll), toInternalState, setState),
    [form, validation]
  );

  const asData = useCallback(() => toDataObject(form), [form]);

  const response = useMemo<FormHook<T>>(
    () => ({
      state: form,
      hasErrors,
      initState: initFormState,
      setState: setFormState,
      validate: validateForm,
      asData,
    }),
    [asData, form, hasErrors, initFormState, setFormState, validateForm]
  );

  return response;
};
