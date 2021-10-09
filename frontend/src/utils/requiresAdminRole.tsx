import React from "react";
import { useAppState, userL } from "../state/AppState";
import { UnauthorizedErrorView } from "../views/error/UnauthorizedErrorView";

export const requiresAdminRole =
  <P extends object>(Component: React.ComponentType<P>) =>
  (props: P) => {
    const { state } = useAppState();
    const user = userL.get(state);
    return user?.roles.includes("admin") ? (
      <Component {...props} />
    ) : (
      <UnauthorizedErrorView />
    );
  };
