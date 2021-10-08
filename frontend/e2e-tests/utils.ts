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
  await page.goto(getUrl());
  await page.waitForSelector("#appbar_title");
  const account = await page.$("#appbar_account");
  if (account) {
    await account.click();
    await page.click("#appbar_logout");
    await page.waitForSelector("#appbar_login");
  }
};

export const resetAll = async () => {
  await initFixtures();
  await logout();
};

export const getElementText = async (selector: string) => {
  await page.waitForSelector(selector, { timeout: 300 });
  const element = await page.$(selector);
  return await page.evaluate((el) => el.textContent, element);
};
