import { Redirect } from "react-router";
import { logout } from "../../api/api";
import { errorL, useAppState, userL } from "../../state/AppState";
import { useOnMount } from "../../state/useOnMount";

export const LogoutHandler = () => {
  const { state, dispatchTaskEither } = useAppState();
  useOnMount(() => {
    dispatchTaskEither(logout(), errorL.set, userL.set);
  });

  return <Redirect to="/" />;
};
