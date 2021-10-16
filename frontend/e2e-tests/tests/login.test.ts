import { logout, resetAll } from "../utils";
import * as AppBar from "./views/AppBar";
import * as Login from "./views/Login";
import * as Signup from "./views/Signup";

beforeEach(resetAll);

describe("Authentication", () => {
  test("Login as admin", async () => {
    await Login.open();
    await Login.typeUsername("admin");
    await Login.typePassword("password");
    await Login.submit();

    expect(await AppBar.getUsername()).toEqual("admin");
  });

  test("Login with invalid credentials fails", async () => {
    await Login.open();
    await Login.typeUsername("admin");
    await Login.typePassword("bassworth");
    await Login.submit();

    expect(await Login.getError()).toEqual("Unauthorized");
  });

  test("Signup with new user name works", async () => {
    await Signup.open();
    await Signup.typeUsername("john");
    await Signup.typeEmail("john@gmail.com");
    await Signup.typePhone("+358401234567");
    await Signup.typePassword("hunter22");
    await Signup.typePasswordConfirm("hunter22");
    await Signup.submit();

    expect(await AppBar.getUsername()).toEqual("john");
  });

  test("Signup with existing user name fails", async () => {
    await Signup.open();
    await Signup.typeUsername("admin");
    await Signup.typePassword("hunter22");
    await Signup.typePasswordConfirm("hunter22");
    await Signup.submit();

    expect(await Signup.getError()).toEqual("User name already exists");
  });

  test("Login with new user works", async () => {
    await Signup.open();
    await Signup.typeUsername("john");
    await Signup.typePassword("hunter22");
    await Signup.typePasswordConfirm("hunter22");
    await Signup.submit();

    await logout();

    await Login.open();
    await Login.typeUsername("john");
    await Login.typePassword("hunter22");
    await Login.submit();

    expect(await AppBar.getUsername()).toEqual("john");
  });
});
