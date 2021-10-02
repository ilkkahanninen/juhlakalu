import * as E from "fp-ts/Either";
import { reloadFixtures } from "./testApi";

export const initFixtures = async () => {
  const response = await reloadFixtures()();
  E.mapLeft((error) => {
    throw new Error(
      `Could not load fixtures. Maybe the test server is not running? ${JSON.stringify(
        error
      )}`
    );
  })(response);
};
