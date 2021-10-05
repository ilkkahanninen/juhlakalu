import { Lens } from "monocle-ts";
import React from "react";
import { login } from "../../api/api";
import { ButtonGroup, FormSubmitButton } from "../../components/atoms/buttons";
import { ErrorMessage } from "../../components/atoms/messages";
import { Headline } from "../../components/atoms/typography";
import { Form } from "../../components/forms/Form";
import { FormTextInput } from "../../components/forms/TextInput";
import { Credentials } from "../../rust-types/Credentials";
import {
  loginErrorL,
  loginIsLoadingL,
  loginViewL,
  useAppState,
  useResetState,
  userL,
} from "../../state/AppState";
import { startedAsyncState } from "../../state/asyncState";
import * as F from "../../utils/forms";
import { useForm } from "../../utils/useForm";
import * as V from "../../utils/validators";

type LoginForm = F.AsForm<Credentials>;

const emptyForm: Credentials = {
  username: "",
  password: "",
};

const loginFormLens = Lens.fromProp<LoginForm>();
const usernameL = loginFormLens("username");
const passwordL = loginFormLens("password");

const validateLogin = F.formValidator(
  F.field(usernameL, V.username),
  F.field(passwordL, V.password)
);

export const LoginForm = () => {
  const { state, dispatch, dispatchTaskEither } = useAppState();
  useResetState(loginViewL, { error: undefined, isLoading: false });

  const form = useForm(emptyForm, validateLogin);

  const submit = async () => {
    dispatch(loginViewL.set(startedAsyncState));
    await dispatchTaskEither(login(form.asData()), loginErrorL.set, userL.set);
    dispatch(loginIsLoadingL.set(false));
  };

  const error = loginErrorL.get(state);
  const isLoading = loginIsLoadingL.get(state);

  return (
    <Form onSubmit={submit}>
      <Headline id="login_title">Login</Headline>
      <ErrorMessage id="login_error">{error?.message}</ErrorMessage>
      <FormTextInput
        label="User name"
        lens={usernameL}
        form={form}
        id="login_username"
      />
      <FormTextInput
        label="Password"
        lens={passwordL}
        form={form}
        type="password"
        id="login_password"
      />
      <ButtonGroup>
        <FormSubmitButton
          id="login_submit"
          disabled={isLoading || form.hasErrors}
        >
          Login
        </FormSubmitButton>
      </ButtonGroup>
    </Form>
  );
};
