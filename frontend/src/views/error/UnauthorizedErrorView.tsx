import React from "react";
import { ErrorView } from "./ErrorView";

export const UnauthorizedErrorView = () => (
  <ErrorView title="Unauthorized">
    You don't have privileges to see this page.
  </ErrorView>
);
