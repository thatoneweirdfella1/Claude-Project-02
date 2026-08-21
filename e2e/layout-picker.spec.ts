import { test, expect } from "@playwright/test";

test("the approved frozen layout supersedes every obsolete layout choice", async ({ page }) => {
  await page.route("**/api/verify-access", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: false, ok: true }),
    });
  });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-layout-authority",
    "approved-gold-1600x1024-v2",
  );
  await expect(page.locator('[data-testid="logo"] .logo-mark')).toHaveAttribute(
    "src",
    "/logo-mark-gold.png",
  );

  await page.locator(".leftnav-content").getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.locator(".screen-settings")).toBeVisible();
  await expect(page.getByRole("button", { name: "Original", exact: true })).toHaveCount(0);
  await page.getByLabel("Settings").click();
  await expect(page.getByTestId("visibility-popover")).toBeVisible();
  await expect(page.getByTestId("layout-toggle")).toHaveCount(0);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
});
