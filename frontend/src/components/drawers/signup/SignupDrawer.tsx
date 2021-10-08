import Drawer from "@mui/material/Drawer";
import React from "react";
import { DrawerTitle } from "../DrawerTitle";
import { SignupForm } from "./SignupForm";

export type SignupDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const SignupDrawer = (props: SignupDrawerProps) => (
  <Drawer anchor="right" open={props.open} onClose={props.onClose}>
    <DrawerTitle title="Sign up" />
    <SignupForm onSignup={props.onClose} />
  </Drawer>
);
