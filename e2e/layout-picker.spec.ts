import { test, expect } from "@playwright/test";

/* e2e/layout-picker.spec.ts — CLAUDE.md "Design layouts": a second
   radiogroup in the same gear dropdown theme-toggle.spec.ts already covers,
   letting the operator pick a complete visual re-skin (accent color, marble
   textures, logo treatment) independent of the Light/Dark/Auto theme toggle.
   Covers what a static/code-only check can't: the click actually reaches
   accountStore.setLayout, the data-layout DOM attribute the CSS keys off
   actually flips, the logo mark swaps assets, and the choice survives a
   reload (accountStore.layout is one of ACCOUNT_PERSISTED_KEYS). */

test("layout picker: gear dropdown switches Original/Gold and persists", async ({ page }) => {
  await page.route("**/api/verify-access", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: false, ok: true }),
    });
  });

  await page.goto("/");

  const settingsButton = page.getByLabel("Settings");
  await expect(settingsButton).toBeVisible();

  // Default is "original" (accountStore's documented default, unchanged from
  // every prior session's only layout) until a user picks something else.
  await expect(page.locator("html")).toHaveAttribute("data-layout", "original");

  await settingsButton.click();
  const popover = page.locator('[data-testid="visibility-popover"]');
  await expect(popover).toBeVisible();

  const originalRadio = page.getByRole("radio", { name: "Original", exact: true });
  const goldRadio = page.getByRole("radio", { name: "Gold", exact: true });

  await expect(originalRadio).toHaveAttribute("aria-checked", "true");

  const logoMark = page.locator('[data-testid="logo"] .logo-mark');
  await expect(logoMark).toHaveAttribute("src", "/logo-mark.png");

  await goldRadio.click();
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
  await expect(goldRadio).toHaveAttribute("aria-checked", "true");
  await expect(originalRadio).toHaveAttribute("aria-checked", "false");
  await expect(logoMark).toHaveAttribute("src", "/logo-mark-gold.png");

  // Persists across reload — layout is in ACCOUNT_PERSISTED_KEYS, but the
  // autosave interval is 5s (persistence.ts, AUTOSAVE_INTERVAL_MS) — same
  // real-tick wait theme-toggle.spec.ts uses, not relying on the pagehide
  // flush's fire-and-forget race with navigation.
  await page.waitForTimeout(5_500);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");

  await page.getByLabel("Settings").click();
  await expect(page.getByRole("radio", { name: "Gold", exact: true })).toHaveAttribute("aria-checked", "true");

  // Layout and theme are independent — Gold should apply cleanly in both.
  const lightRadio = page.getByRole("radio", { name: "Light", exact: true });
  await lightRadio.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
});
