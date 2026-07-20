import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "browser-smoke.spec.ts",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run start:static",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chrome-desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "edge-desktop", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
    { name: "android-chromium-emulation", use: { ...devices["Pixel 7"] } },
    { name: "ios-webkit-emulation", use: { ...devices["iPhone 13"] } },
  ],
});
