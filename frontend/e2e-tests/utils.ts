import * as E from "fp-ts/Either";
import { reloadFixtures, serverAddr } from "./testApi";

export const getUrl = (path: string = "") => `http://${serverAddr}${path}`;

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

export const logout = async () => {
  await page.goto(getUrl("/logout"));
  await page.waitForSelector("#login_title");
};

export const resetAll = async () => {
  await initFixtures();
  await logout();
};

export const getElementText = async (selector: string) => {
  await page.waitForSelector(selector);
  const element = await page.$(selector);
  return await page.evaluate((el) => el.textContent, element);
};
