import React from "react";
import "./messages.less";

export type MessageProps = {
  id?: string;
  children?: string;
};

export const ErrorMessage = (props: MessageProps) =>
  props.children ? (
    <p id={props.id} className="message message__error">
      {props.children}
    </p>
  ) : null;
