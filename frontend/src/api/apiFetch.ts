import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { ErrorMessage } from "../rust-types/ErrorMessage";

export type Method = "GET" | "POST";

export const routeToUrl = (route: string) =>
  `http://localhost:8080/api${route}`;

export const apiFetch =
  <T, S>(method: Method, route: string) =>
  (body: T): TE.TaskEither<ErrorMessage, S> =>
    pipe(
      TE.tryCatch(
        async () => {
          const response = await fetch(routeToUrl(route), {
            method,
            body: body && JSON.stringify(body),
            headers: body && {
              "Content-Type": "application/json",
            },
          });
          const responseBody = await response.json().catch(() => ({
            error: "invalidJson",
            message: "Server sent an invalid JSON response",
          }));
          return response.status < 400
            ? TE.right(responseBody as S)
            : TE.left(responseBody as ErrorMessage);
        },
        (err: any) =>
          ({
            error: "error",
            message: err?.toString() || "Unexpected fetch error",
          } as ErrorMessage)
      ),
      TE.flatten
    );
