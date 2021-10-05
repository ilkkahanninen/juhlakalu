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
import { emptyAsNull, joinClassNames } from "../../utils/strings";
import { FormHook } from "../../utils/useForm";
import "./TextInput.less";

export type TextInputProps = {
  id?: string;
  value: string;
  onChange: (s: string) => void;
  onBlur?: (s: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  type?: TextInputType;
  error?: string;
};

export type TextInputType = "text" | "password" | "email";

export const TextInput = (props: TextInputProps) => {
  const onChangeProp = props.onChange;
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeProp(event.target.value);
    },
    [onChangeProp]
  );

  const onBlurProp = props.onBlur;
  const onBlur = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onBlurProp?.(event.target.value);
    },
    [onBlurProp]
  );

  return (
    <label className="textinput__container">
      {props.label && <span className="textinput__label">{props.label}</span>}
      <input
        id={props.id}
        type={props.type || "text"}
        value={props.value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={props.disabled}
        className={joinClassNames(
          "textinput__input",
          props.error && "textinput__input--error",
          props.className
        )}
      />
      {props.error && <div className="textinput__error">{props.error}</div>}
    </label>
  );
};

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

  return (
    <TextInput
      {...props}
      value={L.value.get(form.state)}
      error={L.errors.get(form.state).join(", ")}
      onChange={flow(L.value.set, form.setState)}
      onBlur={() => pipe(L.touched.set(true), form.setState)}
    />
  );
};

export type FormNullableTextInputProps<S extends object> =
  BaseFormTextInputProps<S> & {
    lens: Lens<AsForm<S>, FieldNullableString>;
  };

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

  return (
    <TextInput
      {...props}
      value={L.value.get(form.state) || ""}
      error={L.errors.get(form.state).join(", ")}
      onChange={flow(emptyAsNull, L.value.set, form.setState)}
      onBlur={() => pipe(L.touched.set(true), form.setState)}
    />
  );
};
