import Drawer from "@mui/material/Drawer";
import React from "react";
import { DrawerTitle } from "../DrawerTitle";
import { LoginForm } from "./LoginForm";

export type LoginDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const LoginDrawer = (props: LoginDrawerProps) => (
  <Drawer anchor="right" open={props.open} onClose={props.onClose}>
    <DrawerTitle title="Login" />
    <LoginForm onLogin={props.onClose} />
  </Drawer>
);
