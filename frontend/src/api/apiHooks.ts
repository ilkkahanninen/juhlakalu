import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { useEffect, useState } from "react";
import { flow } from "fp-ts/lib/function";
import { fold } from "fp-ts/lib/Semigroup";

export type TaskInit = { state: "init" };
export type TaskLoading<E, A> = { state: "loading"; task: TE.TaskEither<E, A> };
export type TaskOk<T> = { state: "ok"; result: T };
export type TaskError<T> = { state: "error"; result: T };
export type TaskState<E, A> =
  | TaskInit
  | TaskLoading<E, A>
  | TaskOk<A>
  | TaskError<E>;

const init = (): TaskInit => ({ state: "init" });
const start = <E, A>(task: TE.TaskEither<E, A>): TaskLoading<E, A> => ({
  state: "loading",
  task,
});
const finish = <T>(result: T): TaskOk<T> => ({ state: "ok", result });
const fail = <T>(result: T): TaskError<T> => ({ state: "error", result });

export const foldTask =
  <E, A, B>(task: TaskState<E, A>) =>
  (onLoad: () => B, onFail: (e: E) => B, onOk: (a: A) => B) => {
    switch (task.state) {
      case "init":
      case "loading":
        return onLoad();
      case "error":
        return onFail(task.result);
      case "ok":
        return onOk(task.result);
    }
  };

export const useTask = <E, A>(task: TE.TaskEither<E, A>): TaskState<E, A> => {
  const [state, setState] = useState<TaskState<E, A>>(init());

  useEffect(() => {
    setState(start(task));
    task().then(flow(E.fold<E, A, TaskState<E, A>>(fail, finish), setState));
  }, [task]);

  return state;
};
