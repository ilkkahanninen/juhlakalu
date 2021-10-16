import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCompo,
  getCompoById,
  getCompos,
  getCompoStates,
  updateCompo,
} from "../../api/api";
import { Compo } from "../../rust-types/Compo";
import { CompoUpdate } from "../../rust-types/CompoUpdate";
import { ErrorMessage } from "../../rust-types/ErrorMessage";
import { composL, compoStatesL, useAppState } from "../../state/AppState";
import { isOk, useTaskState } from "../../state/TaskState";
import { useOnMount } from "../../state/useOnMount";
import { ignoreDispatch, tapDispatch } from "../../state/useStore";
import { patchObjArrayById } from "../../utils/objects";

export type ComposHook = {
  compos: Compo[];
};

export const useCompos = (): ComposHook => {
  const { state, dispatchTaskEither } = useAppState();
  const [error, setError] = useState<ErrorMessage | null>(null);
  useOnMount(() => {
    dispatchTaskEither(getCompos(), tapDispatch(setError), composL.set);
  });

  return useMemo(
    () => ({
      compos: composL.get(state),
    }),
    [state]
  );
};

export type CompoHook = {
  data: Compo | null;
  create: (compo: CompoUpdate) => void;
  update: (compoId: number) => (compo: CompoUpdate) => void;
  isSaved: boolean;
  reset: () => void;
};

export const useCompo = (compoId: number | null): CompoHook => {
  const { state, dispatch, dispatchTaskEither } = useAppState();
  const [_error, setError] = useState<ErrorMessage | null>(null);
  const saveTask = useTaskState<Compo>();

  useEffect(() => {
    if (compoId !== null) {
      dispatchTaskEither(
        getCompoById(compoId),
        tapDispatch(setError),
        (compo) => composL.modify(patchObjArrayById(compo))
      );
    }
  }, [compoId, dispatchTaskEither]);

  useEffect(() => {
    saveTask.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compoId]);

  const data = useMemo(
    () =>
      pipe(
        state,
        composL.get,
        A.findFirst((c) => c.id === compoId),
        O.getOrElseW(() => null)
      ),
    [compoId, state]
  );

  const create = useCallback(
    (compo: CompoUpdate) => {
      saveTask.dispatch(createCompo(compo), {
        onSuccess: (compo) => dispatch(composL.modify(A.append(compo))),
      });
    },
    [dispatch, saveTask]
  );

  const update = useCallback(
    (compoId: number) => (compo: CompoUpdate) => {
      saveTask.dispatch(updateCompo(compoId)(compo), {
        onSuccess: (compo) =>
          dispatch(composL.modify(patchObjArrayById(compo))),
      });
    },
    [dispatch, saveTask]
  );

  return useMemo(
    () => ({
      data,
      create,
      update,
      isSaved: isOk(saveTask),
      reset: saveTask.reset,
    }),
    [data, create, update, saveTask]
  );
};

export const useCompoStates = () => {
  const { state, dispatchTaskEither } = useAppState();
  useOnMount(() => {
    if (A.isEmpty(state.compoStates)) {
      dispatchTaskEither(getCompoStates(), ignoreDispatch, compoStatesL.set);
    }
  });
  return compoStatesL.get(state);
};
