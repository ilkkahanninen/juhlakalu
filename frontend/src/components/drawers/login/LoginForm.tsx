import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { Lens } from "monocle-ts";
import React, { useCallback } from "react";
import { login } from "../../../api/api";
import { Credentials } from "../../../rust-types/Credentials";
import { User } from "../../../rust-types/User";
import { useAppState, userL } from "../../../state/AppState";
import {
  errorMessage,
  isProcessing,
  useTaskState,
} from "../../../state/TaskState";
import * as F from "../../../utils/forms";
import { renderOption } from "../../../utils/options";
import { useForm } from "../../../utils/useForm";
import * as V from "../../../utils/validators";
import { FormSubmitButton } from "../../buttons/FormSubmitButton";
import { Form } from "../../forms/Form";
import { FormTextInput } from "../../forms/TextInput";

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

export type LoginFormProps = {
  onLogin: () => void;
};

export const LoginForm = (props: LoginFormProps) => {
  const appState = useAppState();
  const loginTask = useTaskState<User>();
  const form = useForm(emptyForm, validateLogin);

  const submit = useCallback(
    () =>
      loginTask.dispatch(login(form.asData()), {
        onSuccess: flow(userL.set, appState.dispatch, props.onLogin),
      }),
    [appState.dispatch, form, loginTask, props.onLogin]
  );

  return (
    <Form sx={{ width: 320, m: 2 }} onSubmit={submit}>
      <Stack spacing={2}>
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
        <FormSubmitButton
          id="login_submit"
          loading={isProcessing(loginTask)}
          disabled={form.hasErrors}
        >
          Login
        </FormSubmitButton>
        {pipe(
          loginTask,
          errorMessage,
          O.map((message) => (
            <Alert id="login_error" severity="error">
              {message}
            </Alert>
          )),
          renderOption
        )}
      </Stack>
    </Form>
  );
};
