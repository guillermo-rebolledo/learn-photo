import { defineConfig, devices } from "@playwright/test";
import { staticBaseURL, staticWebServer } from "./playwright.shared";

export default defineConfig({
  testDir: "./tests",
  testMatch: "browser-smoke.spec.ts",
  fullyParallel: true,
  use: {
    baseURL: staticBaseURL,
    trace: "on-first-retry",
  },
  webServer: staticWebServer,
  projects: [
    { name: "chrome-desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "edge-desktop", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
    { name: "android-chromium-emulation", use: { ...devices["Pixel 7"] } },
    { name: "ios-webkit-emulation", use: { ...devices["iPhone 13"] } },
  ],
});
