import { Lens } from "monocle-ts";
import * as F from "./forms";
import * as E from "fp-ts/Either";
import * as V from "./validators";

describe("Forms", () => {
  test("Validate a single form field", () => {
    const name: F.FieldString = {
      value: "X",
      errors: [],
      touched: false,
    };

    const lengthValidator = V.strMinLength(2, "Too snappy");

    const caseValidator = F.validator(
      (name: string) => name.toLowerCase() === name,
      () => "Must be lowercase"
    );

    const validated = F.combine(lengthValidator, caseValidator)(F.validateAll)(
      name
    );

    expect(validated).toEqual(
      E.left({
        value: "X",
        errors: ["Too snappy", "Must be lowercase"],
        touched: false,
      })
    );
  });

  test("Validate a field in form object", () => {
    type Form = F.AsForm<{
      username: string;
      password: string;
      confirm: string;
    }>;

    const form: Form = {
      username: {
        value: "john",
        errors: [],
        touched: false,
      },
      password: {
        value: "  hunter2  ",
        errors: ["old error"],
        touched: true,
      },
      confirm: {
        value: "huntar",
        errors: [],
        touched: true,
      },
    };

    const usernameL = Lens.fromProp<typeof form>()("username");
    const passwordL = Lens.fromProp<typeof form>()("password");
    const confirmL = Lens.fromProp<typeof form>()("confirm");

    const validateLength = V.strMinLength(8, "Password is too short");

    const validateSpecialCharacters = F.validator(
      (password: string) => password.match(/\W/) !== null,
      () => "Password must contain special characters"
    );

    const formValidation = F.formValidator(
      F.field(usernameL, validateLength),
      F.field(
        passwordL,
        F.combine(V.trim, validateLength, validateSpecialCharacters)
      ),
      F.fieldCompare(
        confirmL,
        passwordL,
        V.equals<string>("Passwords do not match")
      )
    );

    const validated = formValidation(F.validateTouched)(form);

    expect(validated).toEqual(
      E.left({
        username: {
          value: "john",
          errors: [],
          touched: false,
        },
        password: {
          value: "hunter2",
          errors: [
            "Password is too short",
            "Password must contain special characters",
          ],
          touched: true,
        },
        confirm: {
          value: "huntar",
          errors: ["Passwords do not match"],
          touched: true,
        },
      })
    );
  });
});
