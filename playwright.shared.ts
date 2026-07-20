import type { PlaywrightTestConfig } from "@playwright/test";

export const staticBaseURL = "http://127.0.0.1:4173";

export const staticWebServer = {
  command: "npm run build && npm run start:static",
  url: staticBaseURL,
  reuseExistingServer: true,
} satisfies PlaywrightTestConfig["webServer"];
