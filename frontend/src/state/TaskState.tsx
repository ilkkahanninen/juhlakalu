import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { useCallback, useMemo } from "react";
import { ErrorCode } from "../rust-types/ErrorCode";
import { ErrorMessage } from "../rust-types/ErrorMessage";
import { useStore } from "./useStore";

export type InitialTaskState = {
  state: "initial";
};

export type ProcessingTaskState = {
  state: "processing";
};

export type FailedTaskState = {
  state: "fail";
  error: ErrorMessage;
};

export type OkTaskState<T> = {
  state: "ok";
  result: T;
};

export type TaskState<T> =
  | InitialTaskState
  | ProcessingTaskState
  | FailedTaskState
  | OkTaskState<T>;

export type TaskStateDispatchFn<T> = (
  task: TE.TaskEither<ErrorMessage, T>,
  handlers?: {
    onSuccess?: (result: T) => void;
    onFail?: (error: ErrorMessage) => void;
  }
) => void;

export type TaskStateHook<T> = TaskState<T> & {
  dispatch: TaskStateDispatchFn<T>;
};

const initial: InitialTaskState = {
  state: "initial",
};

const started: ProcessingTaskState = {
  state: "processing",
};

const fail = (error: ErrorMessage): FailedTaskState => ({
  state: "fail",
  error,
});

const ok = <T,>(result: T): OkTaskState<T> => ({
  state: "ok",
  result,
});

const lift =
  <T,>(state: T) =>
  () =>
    state;

export const useTaskState = <T,>(): TaskStateHook<T> => {
  const store = useStore<TaskState<T>>(initial);

  const dispatch: TaskStateDispatchFn<T> = useCallback(
    (task, handlers) => {
      store.dispatch(() => started);
      store.dispatchTaskEither(
        task,
        (error) => {
          handlers?.onFail?.(error);
          return lift(fail(error));
        },
        (result) => {
          handlers?.onSuccess?.(result);
          return lift(ok(result));
        }
      );
    },
    [store]
  );

  const result = useMemo(
    () => ({ ...store.state, dispatch }),
    [dispatch, store.state]
  );

  return result;
};

export const isProcessing = (hook: TaskStateHook<any>): boolean =>
  hook.state === "processing";

export const isDone = (hook: TaskStateHook<any>): boolean =>
  hook.state === "ok" || hook.state === "fail";

export const errorMessage = (hook: TaskStateHook<any>): O.Option<string> =>
  hook.state === "fail" ? O.some(hook.error.message) : O.none;

export const customErrorMessage =
  (customErrorMessages: Partial<Record<ErrorCode, string>>) =>
  (hook: TaskStateHook<any>): O.Option<string> =>
    hook.state === "fail"
      ? O.some(customErrorMessages[hook.error.error] || hook.error.message)
      : O.none;
