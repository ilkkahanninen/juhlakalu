import React, { useCallback } from "react";

export type FormProps = {
  onSubmit: () => void;
  children?: React.ReactNode;
};

export const Form = ({ onSubmit, children }: FormProps) => {
  const submit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit();
      return false;
    },
    [onSubmit]
  );
  return <form onSubmit={submit}>{children}</form>;
};
