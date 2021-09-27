import { flow } from "fp-ts/lib/function";
import React, { useEffect, useState } from "react";
import { login } from "../../api/api";
import { Headline } from "../../components/atoms/typography";
import { ViewContainer } from "../../components/atoms/ViewContainer";
import { FormTextInput, TextInput } from "../../components/forms/TextInput";
import { Credentials } from "../../rust-types/Credentials";
import { loginErrorL, useAppState, userL } from "../../state/AppState";
import { setter } from "../../utils/objects";
import { Lens } from "monocle-ts";
import {
  ButtonGroup,
  FormSubmitButton,
  RaisedButton,
} from "../../components/atoms/buttons";
import { Form } from "../../components/forms/Form";
import { ErrorMessage } from "../../components/atoms/messages";

const setUsername = setter<Credentials>()("username");
const setPassword = setter<Credentials>()("password");

const usernameL = Lens.fromProp<Credentials>()("username");
const passwordL = Lens.fromProp<Credentials>()("password");

export const LoginView = () => {
  const { state, dispatch, dispatchTaskEither } = useAppState();

  const form = useState<Credentials>({
    username: "",
    password: "",
  });

  useEffect(() => {
    dispatch(loginErrorL.set(undefined));
  }, []);

  const submit = () => {
    dispatch(loginErrorL.set(undefined));
    dispatchTaskEither(login(form[0]), loginErrorL.set, userL.set);
  };

  const error = loginErrorL.get(state);

  return (
    <ViewContainer>
      <Headline>Login</Headline>
      <ErrorMessage>{error?.message}</ErrorMessage>
      <Form onSubmit={submit}>
        <FormTextInput lens={usernameL} label="User name" form={form} />
        <FormTextInput
          lens={passwordL}
          label="Password"
          form={form}
          type="password"
        />
        <ButtonGroup>
          <FormSubmitButton>Login</FormSubmitButton>
        </ButtonGroup>
      </Form>
    </ViewContainer>
  );
};
