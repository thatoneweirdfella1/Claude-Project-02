import { test, expect, type Page } from "@playwright/test";
import { allowLocalAccess } from "./credit-helpers";

/* R30: Exact Preview and Production Gate — the browser smoke matrix and
   overlay-preservation check named in the work order. Runs the real
   production build (npm run build + vite preview, per playwright.config.ts)
   through every primary navigation destination this repair session touched
   or could have affected, plus the dropdown/popover dismiss behavior R30
   calls out by name ("overlay-preservation"). This does not deploy or
   promote anything — it is local evidence for the candidate commit's
   browser-level health. */

async function mockAccountUnconfigured(page: Page): Promise<void> {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false, user: null }),
    });
  });
}

async function mockProviderStatusAllUnavailable(page: Page): Promise<void> {
  await page.route("**/api/provider-status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ anthropic: false, openai: false, google: false, xai: false, deepseek: false }),
    });
  });
}

async function afterReload(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  if (await restore.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await restore.click();
  }
  await page.waitForSelector("#root > *", { timeout: 15_000 });
}

test.describe("R30: browser smoke matrix — every primary screen loads with no console error", () => {
  test.beforeEach(async ({ page }) => {
    await allowLocalAccess(page);
    await mockAccountUnconfigured(page);
    await mockProviderStatusAllUnavailable(page);
  });

  // Primary left-nav destinations (navigation.ts PRIMARY_NAVIGATION).
  const SCREENS: Array<{ nav: string; heading: string }> = [
    { nav: "Translate", heading: "" }, // default landing screen, no separate nav click needed
    { nav: "Sessions", heading: "Sessions" },
    { nav: "Projects", heading: "Projects" },
    { nav: "Saved Tools", heading: "Saved Tools" },
    { nav: "Settings", heading: "Settings" },
  ];

  for (const screen of SCREENS) {
    test(`${screen.nav} screen renders with no thrown console error`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await page.goto("/");
      await afterReload(page);

      if (screen.nav !== "Translate") {
        await page.getByTestId("col-left").getByRole("button", { name: screen.nav, exact: true }).click();
      }
      if (screen.heading) {
        await expect(page.getByRole("heading", { name: screen.heading, exact: true })).toBeVisible({ timeout: 10_000 });
      }

      expect(consoleErrors, `Uncaught error(s) on ${screen.nav}: ${consoleErrors.join("; ")}`).toEqual([]);
    });
  }

  // "Techniques" lives behind the "All Tools" popover (TOOL_NAVIGATION), not
  // the primary left-nav list.
  test("Techniques (via All Tools) renders with no thrown console error", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/");
    await afterReload(page);
    await page.getByTestId("col-left").getByRole("button", { name: "All Tools", exact: true }).click();
    await page.getByRole("dialog", { name: "All tools" }).getByRole("button", { name: "Techniques", exact: true }).click({ timeout: 10_000 });

    await expect(page.getByRole("heading", { name: "Techniques", exact: true })).toBeVisible({ timeout: 10_000 });
    expect(consoleErrors).toEqual([]);
  });

  test("AI Connections (via All Tools) shows the real Provider Connections panel (R26) with no console error", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/");
    await afterReload(page);
    await page.getByTestId("col-left").getByRole("button", { name: "All Tools", exact: true }).click();
    await page.getByRole("dialog", { name: "All tools" }).getByRole("button", { name: "AI Connections", exact: true }).click({ timeout: 10_000 });

    await expect(page.getByTestId("provider-connections-panel")).toBeVisible({ timeout: 10_000 });
    // All five providers report no server configuration per the mock above —
    // fail closed and distinguish that from verified connection health.
    for (const id of ["anthropic", "openai", "google", "xai", "deepseek"]) {
      await expect(page.getByTestId(`provider-status-${id}`)).toContainText("Not configured");
    }

    expect(consoleErrors).toEqual([]);
  });
});

test.describe("R30: overlay-preservation — dropdowns/popovers still open and dismiss correctly", () => {
  test.beforeEach(async ({ page }) => {
    await allowLocalAccess(page);
    await mockAccountUnconfigured(page);
    await mockProviderStatusAllUnavailable(page);
    await page.goto("/");
    await afterReload(page);
  });

  test("the Add Context popover opens and closes without leaving a stuck overlay", async ({ page }) => {
    const addContext = page.getByRole("button", { name: /Add Context/ });
    await addContext.click();
    const menu = page.getByTestId("attach-popover");
    await expect(menu).toBeVisible({ timeout: 5_000 });

    await addContext.click();
    await expect(menu).toBeHidden({ timeout: 5_000 });
  });

  test("Escape dismisses the topmost open layer without affecting the page underneath", async ({ page }) => {
    // Same dismissLayers() stack every modal/dropdown in this app registers
    // with (keyboard/dismissLayers.ts) — confirmed still wired after this
    // session's changes.
    const addContext = page.getByRole("button", { name: /Add Context/ });
    await addContext.click();
    const menu = page.getByTestId("attach-popover");
    await expect(menu).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden({ timeout: 5_000 });
    // The page underneath is still fully interactive after dismissal — the
    // same trigger button can be clicked again to reopen the popover.
    await expect(addContext).toBeVisible();
    await addContext.click();
    await expect(menu).toBeVisible({ timeout: 5_000 });
  });

  test("Right-rail visibility gear popover opens and closes without leaving a stuck overlay", async ({ page }) => {
    const gear = page.getByTestId("visibility-gear");
    await gear.click();
    await expect(gear).toHaveAttribute("aria-expanded", "true");

    await gear.click();
    await expect(gear).toHaveAttribute("aria-expanded", "false");
  });
});
