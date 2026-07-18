import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/* Step 12.1: this file needs to work in TWO environments — this sandbox
   (a pre-installed Chromium at a fixed path, `playwright install` forbidden)
   and a real CI runner (no such path exists; `playwright install` is the
   normal, correct thing to run there). Rather than hardcode one and break
   the other, use the sandbox path only if it's actually present; otherwise
   leave executablePath undefined so Playwright resolves whatever browser
   `playwright install` put in its own managed location — exactly what a CI
   job that runs that step provides. */
const SANDBOX_CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const executablePath = existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined;

/* playwright.config.ts (Step 12.2) — E2E suite runs against a PRODUCTION
   build served by `vite preview`, not the dev server. This is a deliberate
   workaround, not a style choice: `npm run dev` currently fails to load the
   app at all — src/services/routing.js is a UMD module (`module.exports =
   factory()` inside a `typeof module === "object"` guard), and Vite's dev
   server serves src/ files as native ESM with no CommonJS interop (that
   interop only runs during `vite build`, via Rollup, for files Vite treats
   as dependencies — routing.js is app source, not a pre-bundled dependency,
   so it never gets it). The browser console shows exactly this under dev:
   "SyntaxError: ... does not provide an export named 'default'". This is a
   real, previously-undetected bug (logged in BUILD-LOG.md PARKED, Step
   12.2) — every prior browser-driven session (11.1/11.4's audit, 11.5's own
   verification) used `vite preview`, so nothing ever exercised `vite dev`
   this way before. Fixing routing.js/routingService.ts is a src/ change
   outside this step's "build tests, don't refactor" boundary; building
   against `vite preview` here is what the tests actually need to run.

   Every model call the app would make (translate, detect, execute, debate,
   consensus, synthesis) is intercepted at the network boundary by each test
   via page.route() — nothing here talks to a real model or a real deployed
   proxy, since neither exists in this build's sandbox (BUILD-LOG.md: proxy
   live-deploy is parked for Step 12.3). See the executablePath comment above
   for how this same config also runs in CI. */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false, // shared IndexedDB-backed app state across tests in a file; keep it simple
  retries: 0,
  // list for live console output; html (never auto-opened — CI has no
  // browser to open it in) so a failed CI run has a report worth uploading.
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5175",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run build && npx vite preview --port 5175 --strictPort",
    url: "http://localhost:5175",
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
});
