import React from "react";
import { logout } from "../../api/api";
import { RaisedButton } from "../../components/atoms/buttons";
import { Headline } from "../../components/atoms/typography";
import { ViewContainer } from "../../components/atoms/ViewContainer";
import { errorL, useAppState, userL } from "../../state/AppState";

export const MainView = () => {
  const { state, dispatchTaskEither } = useAppState();
  const logoutUser = () => {
    dispatchTaskEither(logout(), errorL.set, userL.set);
  };

  return (
    <ViewContainer>
      <Headline>Hello, {state.user?.username}!</Headline>
      <RaisedButton onClick={logoutUser}>Logout</RaisedButton>
    </ViewContainer>
  );
};
