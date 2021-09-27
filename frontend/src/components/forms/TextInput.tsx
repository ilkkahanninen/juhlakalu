import { flow } from "fp-ts/lib/function";
import { Lens } from "monocle-ts";
import React, { useCallback } from "react";
import { joinClassNames } from "../../utils/strings";
import "./TextInput.less";

export type TextInputProps = {
  value: string;
  onChange: (s: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  type?: TextInputType;
};

export type TextInputType = "text" | "password";

export const TextInput = (props: TextInputProps) => {
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange(event.target.value);
    },
    [props.onChange]
  );

  return (
    <label className="textinput__container">
      {props.label && <span className="textinput__label">{props.label}</span>}
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={onChange}
        disabled={props.disabled}
        className={joinClassNames("textinput__input", props.className)}
      />
    </label>
  );
};

export type FormTextInputProps<S> = {
  form: [S, React.Dispatch<React.SetStateAction<S>>];
  lens: Lens<S, string>;
  label?: string;
  disabled?: boolean;
  type?: TextInputType;
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
