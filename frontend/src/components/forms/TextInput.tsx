import { flow } from "fp-ts/lib/function";
import { Lens } from "monocle-ts";
import React, { useCallback } from "react";
import { emptyAsNull, joinClassNames } from "../../utils/strings";
import "./TextInput.less";

export type TextInputProps = {
  id?: string;
  value: string;
  onChange: (s: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  type?: TextInputType;
};

export type TextInputType = "text" | "password";

export const TextInput = (props: TextInputProps) => {
  const onChangeProp = props.onChange;
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeProp(event.target.value);
    },
    [onChangeProp]
  );

  return (
    <label className="textinput__container">
      {props.label && <span className="textinput__label">{props.label}</span>}
      <input
        id={props.id}
        type={props.type || "text"}
        value={props.value}
        onChange={onChange}
        disabled={props.disabled}
        className={joinClassNames("textinput__input", props.className)}
      />
    </label>
  );
};

type BaseFormTextInputProps<S> = {
  id?: string;
  form: [S, React.Dispatch<React.SetStateAction<S>>];
  label?: string;
  disabled?: boolean;
  type?: TextInputType;
};

export type FormTextInputProps<S> = BaseFormTextInputProps<S> & {
  lens: Lens<S, string>;
};

export const FormTextInput = <S,>({
  lens,
  form: [state, setState],
  ...props
}: FormTextInputProps<S>) => (
  <TextInput
    {...props}
    value={lens.get(state)}
    onChange={flow(lens.set, setState)}
  />
);

export type FormNullableTextInputProps<S> = BaseFormTextInputProps<S> & {
  lens: Lens<S, string | null>;
};

export const FormNullableTextInput = <S,>({
  lens,
  form: [state, setState],
  ...props
}: FormNullableTextInputProps<S>) => (
  <TextInput
    {...props}
    value={lens.get(state) || ""}
    onChange={flow(emptyAsNull, lens.set, setState)}
  />
);
