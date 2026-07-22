import { test, expect } from "@playwright/test";

/* e2e/theme-toggle.spec.ts — CANON Feature 12's "gear dropdown... with theme
   toggle (Light / Dark / Auto)". VISUAL-AUDIT V16 flagged this as a real
   spec gap (the toggle was entirely unbuilt, not just unstyled) and named
   it a hard blocker for Step 12.3 specifically, unlike the build's other
   escalated findings. Covers what a static/code-only audit can't: the
   click actually reaches accountStore.setTheme, the DOM attribute the rest
   of the CSS keys off actually flips, and the choice survives a reload
   (accountStore.theme is one of ACCOUNT_PERSISTED_KEYS). */

test("theme toggle: gear dropdown switches and persists Light/Dark/Auto", async ({ page }) => {
  // AppAccessGate (operator-directed, post-12.3) checks /api/verify-access
  // before AppShell ever mounts — mirrors the real "no APP_ACCESS_PASSWORD
  // configured" case (true for local dev), same mock installModelMocks
  // registers for every other E2E test.
  await page.route("**/api/verify-access", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: false, ok: true }),
    });
  });

  await page.goto("/");

  // AppAccessGate resolves (an async /api/verify-access check) before
  // AppShell — and therefore useThemeEffect — ever mounts, so data-theme
  // isn't set until the gear button itself exists. Waiting on the gear is
  // both the natural "app is actually up" signal and avoids a race against
  // that async check.
  const settingsButton = page.getByLabel("Settings");
  await expect(settingsButton).toBeVisible();

  // Default is dark (accountStore's documented default, unchanged from every
  // prior session's only theme) until a user picks something else.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await settingsButton.click();
  const popover = page.locator('[data-testid="visibility-popover"]');
  await expect(popover).toBeVisible();

  const lightRadio = page.getByRole("radio", { name: "Light", exact: true });
  const darkRadio = page.getByRole("radio", { name: "Dark", exact: true });
  const autoRadio = page.getByRole("radio", { name: "Auto", exact: true });

  await expect(darkRadio).toHaveAttribute("aria-checked", "true");

  await lightRadio.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(lightRadio).toHaveAttribute("aria-checked", "true");
  await expect(darkRadio).toHaveAttribute("aria-checked", "false");

  // Persists across reload — theme is in ACCOUNT_PERSISTED_KEYS, but the
  // autosave interval is 5s (persistence.ts, AUTOSAVE_INTERVAL_MS) — same
  // real-tick wait core-flow.spec.ts uses, not relying on the pagehide
  // flush's fire-and-forget race with navigation.
  await page.waitForTimeout(5_500);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByLabel("Settings").click();
  await expect(page.getByRole("radio", { name: "Light", exact: true })).toHaveAttribute("aria-checked", "true");

  // Auto resolves against the OS preference rather than storing a fixed
  // light/dark value — just confirm it's selectable and takes effect as
  // one of the two real values (the emulated browser's own default).
  await autoRadio.click();
  await expect(autoRadio).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", /^(light|dark)$/);
});
