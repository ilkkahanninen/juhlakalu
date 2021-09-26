import React from "react";
import { logout } from "../../api/api";
import { errorL, useAppState, userL } from "../../state/AppState";

export const MainView = () => {
  const { state, dispatchTaskEither } = useAppState();
  const logoutUser = () => {
    dispatchTaskEither(logout(), errorL.set, userL.set);
  };

  return (
    <div>
      <h1>Hello, {state.user?.username}!</h1>
      <button onClick={logoutUser}>Logout</button>
    </div>
  );
};
