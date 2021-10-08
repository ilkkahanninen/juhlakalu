import TextField, { TextFieldProps } from "@mui/material/TextField";
import * as A from "fp-ts/Array";
import { flow, pipe } from "fp-ts/lib/function";
import { Lens } from "monocle-ts";
import React, { useCallback, useMemo } from "react";
import {
  AsForm,
  fieldErrorsL,
  FieldNullableString,
  FieldString,
  fieldTouchedL,
  fieldValueL,
} from "../../utils/forms";
import { emptyAsNull } from "../../utils/strings";
import { FormHook } from "../../utils/useForm";

export type TextInputType = "text" | "password" | "email" | "tel";

type BaseFormTextInputProps<S extends object> = {
  id?: string;
  form: FormHook<S>;
  label?: string;
  disabled?: boolean;
  type?: TextInputType;
};

export type FormTextInputProps<S extends object> = BaseFormTextInputProps<S> & {
  lens: Lens<AsForm<S>, FieldString>;
};

export const FormTextInput = <S extends object>({
  lens,
  form,
  ...props
}: FormTextInputProps<S>) => {
  const L = useMemo(
    () => ({
      value: lens.compose(fieldValueL()),
      errors: lens.compose(fieldErrorsL),
      touched: lens.compose(fieldTouchedL),
    }),
    [lens]
  );

  const error: Partial<TextFieldProps> = useMemo(() => {
    const errors = L.errors.get(form.state);
    return A.isEmpty(errors)
      ? {}
      : {
          error: true,
          helperText: errors.join(", "),
        };
  }, [L.errors, form.state]);

  const onChange = useMemo(
    () => flow(getEventValue, L.value.set, form.setState),
    [L.value.set, form.setState]
  );

  const onBlur = useCallback(
    () => pipe(L.touched.set(true), form.setState),
    [L.touched, form.setState]
  );

  return (
    <TextField
      {...props}
      {...error}
      value={L.value.get(form.state)}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
};

export type FormNullableTextInputProps<S extends object> =
  BaseFormTextInputProps<S> & {
    lens: Lens<AsForm<S>, FieldNullableString>;
  };

// TODO: Get rid of DRY
export const FormNullableTextInput = <S extends object>({
  lens,
  form,
  ...props
}: FormNullableTextInputProps<S>) => {
  const L = useMemo(
    () => ({
      value: lens.compose(fieldValueL()),
      errors: lens.compose(fieldErrorsL),
      touched: lens.compose(fieldTouchedL),
    }),
    [lens]
  );

  const error: Partial<TextFieldProps> = useMemo(() => {
    const errors = L.errors.get(form.state);
    return A.isEmpty(errors)
      ? {}
      : {
          error: true,
          helperText: errors.join(", "),
        };
  }, [L.errors, form.state]);

  const onChange = useMemo(
    () => flow(getEventValue, emptyAsNull, L.value.set, form.setState),
    [L.value.set, form.setState]
  );

  const onBlur = useCallback(
    () => pipe(L.touched.set(true), form.setState),
    [L.touched, form.setState]
  );

  return (
    <TextField
      {...props}
      {...error}
      value={L.value.get(form.state) || ""}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
};

const getEventValue = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): string => event.target.value;
