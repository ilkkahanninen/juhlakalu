import Box from "@mui/material/Box";
import { Theme } from "@mui/system";
import { SxProps } from "@mui/system/styleFunctionSx/styleFunctionSx";
import React, { useCallback } from "react";

export type FormProps = {
  onSubmit: () => void;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export const Form = ({ onSubmit, sx, children }: FormProps) => {
  const submit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit();
      return false;
    },
    [onSubmit]
  );
  return (
    <Box sx={sx} role="form">
      <form onSubmit={submit}>{children}</form>
    </Box>
  );
};
