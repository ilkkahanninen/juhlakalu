import { Credentials } from "../rust-types/Credentials";
import { NewUser } from "../rust-types/NewUser";
import { User } from "../rust-types/User";
import { getFetchJson } from "./apiFetch";

const fetchJson = getFetchJson();

export const login = fetchJson<Credentials, User>("POST", "/auth/login");
export const logout = fetchJson<void, undefined>("GET", "/auth/logout");
export const getCurrentUser = fetchJson<void, User>("GET", "/auth/currentUser");
export const signup = fetchJson<NewUser, User>("POST", "/users/signup");
