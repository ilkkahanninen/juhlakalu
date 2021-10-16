import { Compo } from "../rust-types/Compo";
import { CompoState } from "../rust-types/CompoState";
import { CompoUpdate } from "../rust-types/CompoUpdate";
import { Credentials } from "../rust-types/Credentials";
import { NewUser } from "../rust-types/NewUser";
import { User } from "../rust-types/User";
import { getFetchJson } from "./apiFetch";

const fetchJson = getFetchJson();

export const login = fetchJson<Credentials, User>("POST", "/auth/login");
export const logout = fetchJson<void, undefined>("GET", "/auth/logout");
export const getCurrentUser = fetchJson<void, User>("GET", "/auth/currentUser");
export const signup = fetchJson<NewUser, User>("POST", "/users/signup");

export const getCompos = fetchJson<void, Compo[]>("GET", "/compos");
export const getCompoById = (id: number) =>
  fetchJson<void, Compo>("GET", `/compos/${id}`)();
export const getCompoStates = fetchJson<void, CompoState[]>(
  "GET",
  "/compos/states"
);
export const createCompo = fetchJson<CompoUpdate, Compo>("POST", "/compos");
export const updateCompo = (compoId: number) =>
  fetchJson<CompoUpdate, Compo>("PUT", `/compos/${compoId}`);
