import React, { useState } from "react";
import { getCompos } from "../../api/api";
import { MainAppBar } from "../../components/MainAppBar";
import { ErrorMessage } from "../../rust-types/ErrorMessage";
import { composL, useAppState } from "../../state/AppState";
import { useOnMount } from "../../state/useOnMount";
import { tapDispatch } from "../../state/useStore";
import { requiresAdminRole } from "../../utils/requiresAdminRole";
import { CompoMgmtList } from "./CompoMgmtList";

export const CompoMgmtView = requiresAdminRole(() => {
  const { state, dispatchTaskEither } = useAppState();
  const [error, setError] = useState<ErrorMessage | null>(null);
  useOnMount(() => {
    dispatchTaskEither(getCompos(), tapDispatch(setError), composL.set);
  });

  return (
    <>
      <MainAppBar title="Compos" />
      <CompoMgmtList compos={composL.get(state)} />
    </>
  );
});
