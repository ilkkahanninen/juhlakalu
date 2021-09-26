import React, { useState } from "react";
import { login } from "../../api/api";
import { Credentials } from "../../rust-types/Credentials";
import { loginErrorL, useAppState, userL } from "../../state/AppState";
import { setter } from "../../utils/objects";

const setUsername = setter<Credentials>()("username");
const setPassword = setter<Credentials>()("password");

export const LoginView = () => {
  const { state, dispatchTaskEither } = useAppState();

  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });

  const submit = () => {
    dispatchTaskEither(login(credentials), loginErrorL.set, userL.set);
  };

  const error = loginErrorL.get(state);

  return (
    <div>
      <h1>Login</h1>
      <div>
        <input
          type="text"
          onChange={(event) => setCredentials(setUsername(event.target.value))}
        />
      </div>
      <div>
        <input
          type="password"
          onChange={(event) => setCredentials(setPassword(event.target.value))}
        />
      </div>
      <div>
        <button onClick={submit}>Login</button>
        {error && <div style={{ color: "red" }}>{error.message}</div>}
      </div>
    </div>
  );
};
