import { getElementText, getUrl } from "../../utils";

export const open = async () => {
  await page.goto(getUrl());
  await page.waitForSelector("#signup_title");
};

export const typeUsername = async (username: string) => {
  await page.type("#signup_username", username);
};

export const typeEmail = async (email: string) => {
  await page.type("#signup_email", email);
};

export const typePhone = async (phone: string) => {
  await page.type("#signup_phone", phone);
};

export const typePassword = async (password: string) => {
  await page.type("#signup_password", password);
};

export const typePasswordConfirm = async (password: string) => {
  await page.type("#signup_password_confirm", password);
};

export const submit = async () => {
  await page.click("#signup_submit");
};

export const getError = async () => getElementText("#signup_error");
