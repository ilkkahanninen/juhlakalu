import { flow } from "fp-ts/lib/function";
import { Lens } from "monocle-ts";
import React from "react";
import { signup } from "../../api/api";
import { ButtonGroup, FormSubmitButton } from "../../components/atoms/buttons";
import { ErrorMessage } from "../../components/atoms/messages";
import { Headline } from "../../components/atoms/typography";
import { Form } from "../../components/forms/Form";
import {
  FormNullableTextInput,
  FormTextInput,
} from "../../components/forms/TextInput";
import { NewUser } from "../../rust-types/NewUser";
import { User } from "../../rust-types/User";
import { useAppState, userL } from "../../state/AppState";
import {
  customErrorMessage,
  isProcessing,
  useTaskState,
} from "../../state/TaskState";
import * as F from "../../utils/forms";
import { useForm } from "../../utils/useForm";
import * as V from "../../utils/validators";

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

export const SignupForm = () => {
  const appState = useAppState();
  const form = useForm(emptyForm, signupValidations);
  const signupTask = useTaskState<User>();

  const submit = () =>
    signupTask.dispatch(signup(form.asData()), {
      onSuccess: flow(userL.set, appState.dispatch),
    });

  return (
    <Form onSubmit={submit}>
      <Headline id="signup_title">Sign up</Headline>
      <ErrorMessage id="signup_error">
        {signupErrorMessage(signupTask)}
      </ErrorMessage>
      <FormTextInput
        id="signup_username"
        lens={usernameL}
        label="User name"
        form={form}
      />
      <FormNullableTextInput
        id="signup_email"
        lens={emailL}
        type="email"
        label="Email (optional)"
        form={form}
      />
      <FormNullableTextInput
        id="signup_phone"
        lens={phoneL}
        label="Phone (optional)"
        form={form}
      />
      <FormTextInput
        id="signup_password"
        lens={passwordL}
        label="Password"
        form={form}
        type="password"
      />
      <FormTextInput
        id="signup_password_confirm"
        lens={passwordConfirmL}
        label="Confirm password"
        form={form}
        type="password"
      />
      <ButtonGroup>
        <FormSubmitButton
          id="signup_submit"
          disabled={isProcessing(signupTask) || form.hasErrors}
        >
          Sign up
        </FormSubmitButton>
      </ButtonGroup>
    </Form>
  );
};
