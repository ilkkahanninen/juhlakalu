import React, { useEffect, useState } from "react";
import { CompoDialog } from "./CompoDialog";
import { useCompo } from "./useCompos";

export type CompoEditDialogProps = {
  compoId: number | null;
  onClose: () => void;
};

export const CompoEditDialog = (props: CompoEditDialogProps) => {
  const compo = useCompo(props.compoId);
  const [isOpen, setOpen] = useState(false);

  useEffect(
    () => setOpen(props.compoId != null && !compo.isSaved),
    [compo.isSaved, props.compoId]
  );

  return (
    <CompoDialog
      title={`Edit ${compo.data?.title || "compo"}`}
      submitButton="Update"
      compo={compo.data}
      open={isOpen}
      onClose={props.onClose}
      onSubmit={compo.save}
    />
  );
};
