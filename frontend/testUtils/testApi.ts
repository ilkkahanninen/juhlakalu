import { getFetchJson } from "../src/api/apiFetch";

const serverAddr = process.env.SERVER_ADDR || "127.0.0.1:8000";

const fetchJson = getFetchJson(
  (route) => `http://${serverAddr}/__tests${route}`
);

export const reloadFixtures = fetchJson<void, undefined>("GET", "/reset");
