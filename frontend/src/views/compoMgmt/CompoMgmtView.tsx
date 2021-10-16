import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import React, { useCallback, useState } from "react";
import { MainAppBar } from "../../components/MainAppBar";
import { Compo } from "../../rust-types/Compo";
import { useBool } from "../../state/useBool";
import { requiresAdminRole } from "../../utils/requiresAdminRole";
import { AddCompoDialog } from "./AddCompoDialog";
import { CompoEditDialog } from "./CompoEditDialog";
import { CompoMgmtList } from "./CompoMgmtList";
import { useCompos } from "./useCompos";

export const CompoMgmtView = requiresAdminRole(() => {
  const { compos } = useCompos();

  const [editedCompoId, setEditedCompoId] = useState<number | null>(null);
  const openCompoEdit = useCallback(
    (compo: Compo) => setEditedCompoId(compo.id),
    []
  );
  const closeCompoEdit = useCallback(() => setEditedCompoId(null), []);

  const addCompoDialog = useBool(false);

  return (
    <>
      <MainAppBar title="Compos" />
      <Toolbar>
        <Button onClick={addCompoDialog.set}>Add compo</Button>
      </Toolbar>
      <CompoMgmtList compos={compos} onRowClick={openCompoEdit} />
      <CompoEditDialog compoId={editedCompoId} onClose={closeCompoEdit} />
      <AddCompoDialog
        isOpen={addCompoDialog.state}
        onClose={addCompoDialog.unset}
      />
    </>
  );
});
