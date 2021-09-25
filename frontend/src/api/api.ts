import { Credentials } from "../rust-types/Credentials";
import { User } from "../rust-types/User";
import { apiFetch } from "./apiFetch";

export const login = apiFetch<Credentials, User>("POST", "/auth/login");
export const logout = apiFetch<void, void>("GET", "/auth/logout");
export const getCurrentUser = apiFetch<void, User>("GET", "/auth/currentUser");
