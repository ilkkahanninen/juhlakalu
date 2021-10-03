import { Lens } from "monocle-ts";
import React from "react";
import { ViewContainer } from "../../components/atoms/ViewContainer";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export const LoginView = () => {
  return (
    <ViewContainer>
      <LoginForm />
      <SignupForm />
    </ViewContainer>
  );
};
