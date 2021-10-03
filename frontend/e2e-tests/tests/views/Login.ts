import { getElementText, getUrl } from "../../utils";

export const open = async () => {
  await page.goto(getUrl());
  await page.waitForSelector("#login_title");
};

export const typeUsername = async (username: string) => {
  await page.type("#login_username", username);
};

export const typePassword = async (password: string) => {
  await page.type("#login_password", password);
};

export const submit = async () => {
  await page.click("#login_submit");
};

export const getError = async () => getElementText("#login_error");
