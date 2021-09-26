import { Credentials } from "../rust-types/Credentials";
import { User } from "../rust-types/User";
import { fetchJson } from "./apiFetch";

export const login = fetchJson<Credentials, User>("POST", "/auth/login");
export const logout = fetchJson<void, undefined>("GET", "/auth/logout");
export const getCurrentUser = fetchJson<void, User>("GET", "/auth/currentUser");
