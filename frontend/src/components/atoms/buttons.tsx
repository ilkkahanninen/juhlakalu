import { plainComponent } from "../../utils/plainComponent";
import { joinClassNames } from "../../utils/strings";
import "./buttons.less";

export const ButtonGroup = plainComponent("section", "buttongroup");
export const RaisedButton = plainComponent("button", "raisedbutton");

export type FormSubmitButtonProps = React.HTMLAttributes<HTMLInputElement> & {
  children: string;
};

export const FormSubmitButton = ({
  children,
  className,
  ...rest
}: FormSubmitButtonProps) => (
  <input
    type="submit"
    className={joinClassNames("raisedbutton", className)}
    value={children}
    {...rest}
  />
);
