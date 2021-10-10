import CloseIcon from "@mui/icons-material/Close";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import Toolbar from "@mui/material/Toolbar";
import { TransitionProps } from "@mui/material/transitions";
import Typography from "@mui/material/Typography";
import React, { useCallback, useEffect } from "react";
import { Compo } from "../../rust-types/Compo";
import { useForm } from "../../utils/useForm";
import { CompoForm, validateCompoForm } from "./CompoForm";

export type CompoDialogProps = {
  title: string;
  submitButton: string;
  compo: Compo | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (compo: Compo) => void;
};

const emptyForm: Compo = {
  id: 0,
  title: "",
  description: null,
  state: "",
  state_name: "",
  public: false,
  accept_entries: false,
  voting_open: false,
  results_public: false,
};

export const CompoDialog = (props: CompoDialogProps) => {
  const form = useForm(props.compo || emptyForm, validateCompoForm);

  useEffect(() => {
    form.initState(props.compo || emptyForm);
    // Ignore changes on form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.compo]);

  const submit = useCallback(() => {
    props.onSubmit(form.asData());
  }, [form, props]);

  return (
    <Dialog
      fullScreen
      open={props.open}
      onClose={close}
      TransitionComponent={Transition}
    >
      <AppBar position="relative">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={props.onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {props.title}
          </Typography>
          <Button autoFocus color="inherit" onClick={submit}>
            {props.submitButton}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <CompoForm form={form} />
      </Box>
    </Dialog>
  );
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
