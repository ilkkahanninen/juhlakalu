import { flow } from "fp-ts/lib/function";
import { Lens } from "monocle-ts";
import React, { useCallback } from "react";
import { login } from "../../api/api";
import { ButtonGroup, FormSubmitButton } from "../../components/atoms/buttons";
import { ErrorMessage } from "../../components/atoms/messages";
import { Headline } from "../../components/atoms/typography";
import { Form } from "../../components/forms/Form";
import { FormTextInput } from "../../components/forms/TextInput";
import { Credentials } from "../../rust-types/Credentials";
import { User } from "../../rust-types/User";
import { useAppState, userL } from "../../state/AppState";
import {
  errorMessage,
  isProcessing,
  useTaskState,
} from "../../state/TaskState";
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
  const appState = useAppState();
  const loginTask = useTaskState<User>();
  const form = useForm(emptyForm, validateLogin);

  const submit = useCallback(
    () =>
      loginTask.dispatch(login(form.asData()), {
        onSuccess: flow(userL.set, appState.dispatch),
      }),
    [appState.dispatch, form, loginTask]
  );

  return (
    <Form onSubmit={submit}>
      <Headline id="login_title">Login</Headline>
      <ErrorMessage id="login_error">{errorMessage(loginTask)}</ErrorMessage>
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
          disabled={isProcessing(loginTask) || form.hasErrors}
        >
          Login
        </FormSubmitButton>
      </ButtonGroup>
    </Form>
  );
};
