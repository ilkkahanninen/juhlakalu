import { getElementText } from "../../utils";

export const getTitle = () => getElementText("#appbar_title");

export const clickLogin = () => page.click("#appbar_login");

export const clickSignup = () => page.click("#appbar_signup");

export const getUsername = () => getElementText("#appbar_username");
