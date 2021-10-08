import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React from "react";

export type DrawerTitleProps = {
  title: string;
};

export const DrawerTitle = (props: DrawerTitleProps) => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        {props.title}
      </Typography>
    </Toolbar>
  </AppBar>
);
