import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import { Lens } from "monocle-ts";
import React from "react";
import { Form } from "../../components/forms/Form";
import {
  FormNullableTextInput,
  FormTextInput,
} from "../../components/forms/TextInput";
import { Compo } from "../../rust-types/Compo";
import * as F from "../../utils/forms";
import { FormHook } from "../../utils/useForm";
import * as V from "../../utils/validators";
import { useCompoStates } from "./useCompos";

type CompoForm = F.AsForm<Compo>;

const compoFormLens = Lens.fromProp<CompoForm>();
const titleL = compoFormLens("title");
const descriptionL = compoFormLens("description");
const compoStateL = compoFormLens("state");

export const validateCompoForm = F.formValidator(F.field(titleL, V.notEmpty));

export type CompoFormProps = {
  form: FormHook<Compo>;
};

export const CompoForm = (props: CompoFormProps) => {
  const states = useCompoStates();

  return (
    <Form onSubmit={console.log}>
      <Stack spacing={2}>
        <FormTextInput
          label="Title"
          form={props.form}
          lens={titleL}
          fullWidth
        />
        {states.length > 0 && (
          <FormTextInput
            label="State"
            form={props.form}
            lens={compoStateL}
            fullWidth
            select
          >
            {states.map((state) => (
              <MenuItem key={state.id} value={state.id}>
                {state.name}
              </MenuItem>
            ))}
          </FormTextInput>
        )}
        <FormNullableTextInput
          label="Description"
          form={props.form}
          lens={descriptionL}
          fullWidth
          multiline
        />
      </Stack>
    </Form>
  );
};
