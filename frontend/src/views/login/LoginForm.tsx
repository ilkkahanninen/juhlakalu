import { Lens } from "monocle-ts";
import React, { useState } from "react";
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

const usernameL = Lens.fromProp<Credentials>()("username");
const passwordL = Lens.fromProp<Credentials>()("password");

export const LoginForm = () => {
  const { state, dispatch, dispatchTaskEither } = useAppState();
  useResetState(loginViewL, { error: undefined, isLoading: false });

  const form = useState<Credentials>({
    username: "",
    password: "",
  });

  const submit = async () => {
    dispatch(loginViewL.set(startedAsyncState));
    await dispatchTaskEither(login(form[0]), loginErrorL.set, userL.set);
    dispatch(loginIsLoadingL.set(false));
  };

  const error = loginErrorL.get(state);
  const isLoading = loginIsLoadingL.get(state);
  const formFilled = Boolean(form[0].username && form[0].password);

  return (
    <Form onSubmit={submit}>
      <Headline id="login_title">Login</Headline>
      <ErrorMessage id="login_error">{error?.message}</ErrorMessage>
      <FormTextInput
        id="login_username"
        lens={usernameL}
        label="User name"
        form={form}
      />
      <FormTextInput
        id="login_password"
        lens={passwordL}
        label="Password"
        form={form}
        type="password"
      />
      <ButtonGroup>
        <FormSubmitButton id="login_submit" disabled={isLoading || !formFilled}>
          Login
        </FormSubmitButton>
      </ButtonGroup>
    </Form>
  );
};
