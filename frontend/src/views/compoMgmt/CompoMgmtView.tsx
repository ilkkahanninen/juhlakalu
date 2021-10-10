import React, { useCallback, useState } from "react";
import { MainAppBar } from "../../components/MainAppBar";
import { Compo } from "../../rust-types/Compo";
import { requiresAdminRole } from "../../utils/requiresAdminRole";
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

  return (
    <>
      <MainAppBar title="Compos" />
      <CompoMgmtList compos={compos} onRowClick={openCompoEdit} />
      <CompoEditDialog compoId={editedCompoId} onClose={closeCompoEdit} />
    </>
  );
});
