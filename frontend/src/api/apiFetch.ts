import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { ErrorMessage } from "../rust-types/ErrorMessage";

export type Method = "GET" | "POST";

export const routeToUrl = (route: string) =>
  `${location.protocol}//${location.host}/api${route}`;

export const fetchJson =
  <T, S extends object | undefined>(method: Method, route: string) =>
  (body: T): TE.TaskEither<ErrorMessage, S> =>
    pipe(
      TE.tryCatch(async () => {
        const response = await runFetch(method, route, body);
        return pipe(
          await parseJson<S>(response),
          errorsToLeft<S>(response),
          TE.fromEither
        );
      }, asErrorMessage),
      TE.flatten
    );

const runFetch = <T>(
  method: Method,
  route: string,
  body: T
): Promise<Response> =>
  fetch(routeToUrl(route), {
    method,
    body: body && JSON.stringify(body),
    headers: body && {
      "Content-Type": "application/json",
    },
  });

const parseJson = <S extends object | undefined>(response: Response) =>
  TE.tryCatch(
    async () => {
      const json = await response.text();
      return (json.length === 0 ? undefined : JSON.parse(json)) as S;
    },
    () =>
      ({
        error: "invalidJson",
        message: "Server sent an invalid JSON response",
      } as ErrorMessage)
  )();

const errorsToLeft = <S extends object | undefined>(response: Response) =>
  E.chain((body: S) =>
    response.status < 400 ? E.right(body) : E.left(body as ErrorMessage)
  );

const asErrorMessage = (err: any): ErrorMessage =>
  ({
    error: "error",
    message: err?.toString() || "Unexpected fetch error",
  } as ErrorMessage);
