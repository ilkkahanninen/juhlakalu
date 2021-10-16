import React, { useEffect } from "react";
import { CompoDialog } from "./CompoDialog";
import { useCompo } from "./useCompos";

export type AddCompoDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddCompoDialog = (props: AddCompoDialogProps) => {
  const compo = useCompo(null);

  useEffect(() => {
    if (props.isOpen && compo.isSaved) {
      compo.reset();
      props.onClose();
    }
  }, [compo, compo.isSaved, props, props.isOpen]);

  return (
    <CompoDialog
      title={"New compo"}
      submitButton="Create"
      compo={compo.data}
      open={props.isOpen}
      onClose={props.onClose}
      onSubmit={compo.create}
    />
  );
};
