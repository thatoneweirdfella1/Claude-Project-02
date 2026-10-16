import { test as base, expect } from "@playwright/test";

export { expect };
export type { Page, Locator, Route } from "@playwright/test";

/* Default answers for the two endpoints every page load calls. Without them,
   vite preview returns the SPA HTML and AccountGate waits forever on
   "Loading account". Registered first, so any route a test adds itself for
   the same URL wins (Playwright runs the most recently added route first). */
export const test = base.extend<{ defaultAppMocks: void }>({
  defaultAppMocks: [
    async ({ page }, use) => {
      await page.route("**/api/account", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, user: null }) }),
      );
      await page.route("**/api/verify-access", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ requiresPassword: false, ok: true }) }),
      );
      await use();
    },
    { auto: true },
  ],
});
