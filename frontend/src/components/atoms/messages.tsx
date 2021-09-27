import React from "react";
import "./messages.less";

export type MessageProps = {
  children?: string;
};

export const ErrorMessage = (props: MessageProps) =>
  props.children ? (
    <p className="message message__error">{props.children}</p>
  ) : null;
