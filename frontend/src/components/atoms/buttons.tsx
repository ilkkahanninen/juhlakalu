import { plainComponent } from "../../utils/plainComponent";
import { joinClassNames } from "../../utils/strings";
import "./buttons.less";

export const ButtonGroup = plainComponent("section", "buttongroup");
export const RaisedButton = plainComponent(
  "button",
  "button button__raisedbutton"
);

export type FormSubmitButtonProps = {
  children: string;
  className?: string;
  disabled?: boolean;
};

export const FormSubmitButton = ({
  children,
  className,
  ...rest
}: FormSubmitButtonProps) => (
  <input
    type="submit"
    className={joinClassNames("button button__raisedbutton", className)}
    value={children}
    {...rest}
  />
);
