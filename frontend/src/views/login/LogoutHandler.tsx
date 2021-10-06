import { Redirect } from "react-router";
import { logout } from "../../api/api";
import { useAppState, userL } from "../../state/AppState";
import { useOnMount } from "../../state/useOnMount";
import { ignoreDispatch } from "../../state/useStore";

export const LogoutHandler = () => {
  const { state, dispatchTaskEither } = useAppState();
  useOnMount(() => {
    dispatchTaskEither(logout(), ignoreDispatch, userL.set);
  });

  return <Redirect to="/" />;
};
