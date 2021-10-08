import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { Lens } from "monocle-ts";
import React from "react";
import { signup } from "../../../api/api";
import { NewUser } from "../../../rust-types/NewUser";
import { User } from "../../../rust-types/User";
import { useAppState, userL } from "../../../state/AppState";
import {
  customErrorMessage,
  isProcessing,
  useTaskState,
} from "../../../state/TaskState";
import * as F from "../../../utils/forms";
import { renderOption } from "../../../utils/options";
import { useForm } from "../../../utils/useForm";
import * as V from "../../../utils/validators";
import { FormSubmitButton } from "../../buttons/FormSubmitButton";
import { Form } from "../../forms/Form";
import { FormNullableTextInput, FormTextInput } from "../../forms/TextInput";

type Signup = NewUser & {
  passwordConfirm: string;
};

type SignupForm = F.AsForm<Signup>;

const emptyForm: Signup = {
  username: "",
  email: null,
  phone: null,
  password: "",
  passwordConfirm: "",
};

const signupFormLens = Lens.fromProp<SignupForm>();
const usernameL = signupFormLens("username");
const emailL = signupFormLens("email");
const phoneL = signupFormLens("phone");
const passwordL = signupFormLens("password");
const passwordConfirmL = signupFormLens("passwordConfirm");

const signupValidations = F.formValidator(
  F.field(usernameL, V.username),
  F.field(passwordL, V.password),
  F.fieldCompare(passwordConfirmL, passwordL, V.passwordsMatch)
);

const signupErrorMessage = customErrorMessage({
  AlreadyExists: "User name already exists",
});

export type SignupFormProps = {
  onSignup: () => void;
};

export const SignupForm = (props: SignupFormProps) => {
  const appState = useAppState();
  const form = useForm(emptyForm, signupValidations);
  const signupTask = useTaskState<User>();

  const submit = () =>
    signupTask.dispatch(signup(form.asData()), {
      onSuccess: flow(userL.set, appState.dispatch, props.onSignup),
    });

  return (
    <Form sx={{ width: 320, m: 2 }} onSubmit={submit}>
      <Stack spacing={2}>
        <FormTextInput
          id="signup_username"
          lens={usernameL}
          label="User name *"
          form={form}
        />
        <FormNullableTextInput
          id="signup_email"
          lens={emailL}
          type="email"
          label="Email"
          form={form}
        />
        <FormNullableTextInput
          id="signup_phone"
          lens={phoneL}
          type="tel"
          label="Phone"
          form={form}
        />
        <FormTextInput
          id="signup_password"
          lens={passwordL}
          label="Password *"
          form={form}
          type="password"
        />
        <FormTextInput
          id="signup_password_confirm"
          lens={passwordConfirmL}
          label="Confirm password *"
          form={form}
          type="password"
        />
        <FormSubmitButton
          id="signup_submit"
          disabled={isProcessing(signupTask) || form.hasErrors}
        >
          Sign up
        </FormSubmitButton>
        {pipe(
          signupTask,
          signupErrorMessage,
          O.map((message) => (
            <Alert id="signup_error" severity="error">
              {message}
            </Alert>
          )),
          renderOption
        )}
      </Stack>
    </Form>
  );
};
