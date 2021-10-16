import React, { useState } from "react";
import { useOnChange } from "../../state/useOnChange";
import { CompoDialog } from "./CompoDialog";
import { useCompo } from "./useCompos";

export type CompoEditDialogProps = {
  compoId: number | null;
  onClose: () => void;
};

export const CompoEditDialog = (props: CompoEditDialogProps) => {
  const compo = useCompo(props.compoId);
  const [isOpen, setOpen] = useState(false);

  useOnChange(
    (compoId, isSaved) => {
      setOpen(compoId !== null && !isSaved);
    },
    [props.compoId, compo.isSaved]
  );

  return (
    <CompoDialog
      title={`Edit ${compo.data?.title || "compo"}`}
      submitButton="Update"
      compo={compo.data}
      open={isOpen}
      onClose={props.onClose}
      onSubmit={props.compoId ? compo.update(props.compoId) : null}
    />
  );
};
