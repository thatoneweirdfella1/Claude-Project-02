import { test, expect } from "@playwright/test";

test("the frozen shell switches between its approved light and dark themes", async ({ page }) => {
  await page.route("**/api/verify-access", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: false, ok: true }),
    });
  });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const appearance = page.locator(".appearance-settings");
  await expect(appearance).toBeVisible();

  await appearance.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");

  await appearance.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.waitForTimeout(5_500);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.locator(".appearance-settings").getByRole("button", { name: "System", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", /^(light|dark)$/);
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
});
