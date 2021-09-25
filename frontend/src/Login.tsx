import React, { useEffect, useState } from "react";
import { Credentials } from "../../credentials";
import { getCurrentUser, login } from "./api/api";
import { foldTask, useTask } from "./api/apiHooks";
import { setter } from "./utils/objects";

const loginTask = login({ username: "ilkka", password: "password" });
const initialLoginCheck = getCurrentUser();

const setUsername = setter<Credentials>()("username");
const setPassword = setter<Credentials>()("password");

export const Login = () => {
  const [loginTask, runLoginTask] = useState(() => initialLoginCheck);
  const userTask = useTask(loginTask);
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });

  return (
    <div>
      <h1>Login</h1>
      {foldTask(userTask)(
        () => (
          <div>Loading</div>
        ),
        (error) => (
          <div>
            {error.message}
            <input
              type="text"
              onChange={(event) =>
                setCredentials(setUsername(event.target.value))
              }
            />
            <input
              type="password"
              onChange={(event) =>
                setCredentials(setPassword(event.target.value))
              }
            />
            <button onClick={() => runLoginTask(() => login(credentials))}>
              Login
            </button>
          </div>
        ),
        (user) => (
          <h1>Hello, {user.username}!</h1>
        )
      )}
    </div>
  );
};
