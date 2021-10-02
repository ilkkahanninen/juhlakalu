import { getFetchJson, Router } from "../src/api/apiFetch";

export const serverAddr = process.env.SERVER_ADDR || "127.0.0.1:8000";

const fetchJson = getFetchJson(
  (route) => `http://${serverAddr}/__tests${route}`
);

export const reloadFixtures = fetchJson<void, undefined>("GET", "/reset");
