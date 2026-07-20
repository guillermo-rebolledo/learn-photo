import { defineConfig, devices } from "@playwright/test";
import { staticBaseURL, staticWebServer } from "./playwright.shared";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 1,
  use: {
    baseURL: staticBaseURL,
    trace: "on-first-retry",
  },
  webServer: staticWebServer,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
