import React from "react";
import { logout } from "../../api/api";
import { RaisedButton } from "../../components/atoms/buttons";
import { Headline } from "../../components/atoms/typography";
import { ViewContainer } from "../../components/atoms/ViewContainer";
import { useAppState, userL } from "../../state/AppState";
import { ignoreDispatch } from "../../state/useStore";

export const MainView = () => {
  const { state, dispatchTaskEither } = useAppState();
  const logoutUser = () => {
    dispatchTaskEither(logout(), ignoreDispatch, userL.set);
  };

  return (
    <ViewContainer>
      <Headline id="main_title">Hello, {state.user?.username}!</Headline>
      <RaisedButton onClick={logoutUser}>Logout</RaisedButton>
    </ViewContainer>
  );
};
