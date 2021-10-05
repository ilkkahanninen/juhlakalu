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
import {
  signupErrorL,
  signupIsLoadingL,
  signupViewL,
  useAppState,
  useResetState,
  userL,
} from "../../state/AppState";
import { startedAsyncState } from "../../state/asyncState";
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

export const SignupForm = () => {
  const { state, dispatch, dispatchTaskEither } = useAppState();
  useResetState(signupViewL, { error: undefined, isLoading: false });

  const form = useForm(emptyForm, signupValidations);

  const submit = async () => {
    dispatch(signupViewL.set(startedAsyncState));
    await dispatchTaskEither(
      signup(form.asData()),
      signupErrorL.set,
      userL.set
    );
    dispatch(signupIsLoadingL.set(false));
  };

  const error = signupErrorL.get(state);
  const isLoading = signupIsLoadingL.get(state);

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
          disabled={isLoading || form.hasErrors}
        >
          Sign up
        </FormSubmitButton>
      </ButtonGroup>
    </Form>
  );
};
