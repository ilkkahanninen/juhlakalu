import Box from "@mui/material/Box";
import React from "react";
import { MainAppBar } from "../../components/MainAppBar";

export type ErrorViewProps = {
  title: string;
  children: React.ReactNode;
};

export const ErrorView = (props: ErrorViewProps) => (
  <>
    <MainAppBar title={props.title} />
    <Box sx={{ p: 2 }}>{props.children}</Box>
  </>
);
