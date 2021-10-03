import { Lens } from "monocle-ts";
import React, { useState } from "react";
import { login, signup } from "../../api/api";
import { ButtonGroup, FormSubmitButton } from "../../components/atoms/buttons";
import { ErrorMessage } from "../../components/atoms/messages";
import { Headline } from "../../components/atoms/typography";
import { Form } from "../../components/forms/Form";
import {
  FormNullableTextInput,
  FormTextInput,
} from "../../components/forms/TextInput";
import { NewUser } from "../../rust-types/NewUser";
import {
  signupErrorL,
  signupIsLoadingL,
  signupViewL,
  useAppState,
  useResetState,
  userL,
} from "../../state/AppState";
import { startedAsyncState } from "../../state/asyncState";

const usernameL = Lens.fromProp<SignupFields>()("username");
const emailL = Lens.fromProp<SignupFields>()("email");
const phoneL = Lens.fromProp<SignupFields>()("phone");
const passwordL = Lens.fromProp<SignupFields>()("password");
const passwordConfirmL = Lens.fromProp<SignupFields>()("passwordConfirm");

type SignupFields = NewUser & {
  passwordConfirm: string;
};

export const SignupForm = () => {
  const { state, dispatch, dispatchTaskEither } = useAppState();
  useResetState(signupViewL, { error: undefined, isLoading: false });

  const form = useState<SignupFields>({
    username: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });

  const submit = async () => {
    dispatch(signupViewL.set(startedAsyncState));
    await dispatchTaskEither(signup(form[0]), signupErrorL.set, userL.set);
    dispatch(signupIsLoadingL.set(false));
  };

  const error = signupErrorL.get(state);
  const isLoading = signupIsLoadingL.get(state);
  const formFilled = Boolean(
    form[0].username &&
      form[0].password &&
      form[0].password === form[0].passwordConfirm
  );
  const passwordMismatch = Boolean(
    form[0].password &&
      form[0].passwordConfirm &&
      form[0].password !== form[0].passwordConfirm
  );

  return (
    <Form onSubmit={submit}>
      <Headline id="signup_title">Sign up</Headline>
      <ErrorMessage id="signup_error">
        {error?.error === "AlreadyExists"
          ? "User name already exists"
          : error?.message}
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
      {passwordMismatch && (
        <ErrorMessage id="signup_password_error">
          Passwords do not match
        </ErrorMessage>
      )}
      <ButtonGroup>
        <FormSubmitButton
          id="signup_submit"
          disabled={isLoading || !formFilled}
        >
          Sign up
        </FormSubmitButton>
      </ButtonGroup>
    </Form>
  );
};
