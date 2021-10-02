import { getElementText, getUrl, resetAll } from "../utils";

beforeEach(resetAll);

describe("Authentication", () => {
  test("Login works", async () => {
    await page.goto(getUrl());

    await page.waitForSelector("#login_title");
    await page.type("#login_username", "admin");
    await page.type("#login_password", "admin2");
    await page.click("#login_submit");

    expect(await getElementText("#main_title")).toEqual("Hello, admin!");
  });

  test("Login with invalid credentials fails", async () => {
    await page.goto(getUrl());

    await page.waitForSelector("#login_title");
    await page.type("#login_username", "admin");
    await page.type("#login_password", "xxxxx");
    await page.click("#login_submit");

    expect(await getElementText("#login_error")).toEqual("Unauthorized");
  });
});
