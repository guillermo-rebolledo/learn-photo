import { defineConfig, devices } from "@playwright/test";
import { siteUrl } from "./lib/site";

const productionURL = process.env.PRODUCTION_URL ?? siteUrl;

export default defineConfig({
  testDir: "./tests",
  testMatch: "production-smoke.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  use: {
    baseURL: productionURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
