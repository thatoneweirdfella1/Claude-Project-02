import { test, expect } from "@playwright/test";

test("Sessions screen displays and loads", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.waitForLoadState("networkidle");

  // Wait for root element to have content
  await page.waitForSelector("#root > *", { timeout: 15000 });

  // Navigate to Sessions by finding the Sessions nav item
  const sessionsNavButton = page.locator("button", { hasText: /^Sessions$/ });
  if (await sessionsNavButton.count() > 0) {
    await sessionsNavButton.click();
    await page.waitForTimeout(500);
  }

  // Verify Sessions screen is displayed
  const sessionsScreen = page.locator(".screen-sessions");
  await expect(sessionsScreen).toBeVisible({ timeout: 10000 });

  // Verify the screen header
  const header = sessionsScreen.locator("h1");
  await expect(header).toHaveText("Sessions");

  // Verify either the empty state or the session list exists
  const emptyState = sessionsScreen.locator("text=No saved sessions yet");
  const sessionList = sessionsScreen.locator(".session-list");

  const emptyStateVisible = await emptyState.isVisible().catch(() => false);
  const sessionListVisible = await sessionList.isVisible().catch(() => false);

  expect(emptyStateVisible || sessionListVisible).toBe(true);
});

test("Trash screen displays", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.waitForLoadState("networkidle");

  // Wait for root element to have content
  await page.waitForSelector("#root > *", { timeout: 15000 });

  // Navigate to Trash
  const trashNavButton = page.locator("button", { hasText: /^Trash$/ });
  if (await trashNavButton.count() > 0) {
    await trashNavButton.click();
    await page.waitForTimeout(500);
  }

  // Verify Trash screen is displayed
  const trashScreen = page.locator(".screen-trash");
  await expect(trashScreen).toBeVisible({ timeout: 10000 });

  // Verify the screen header
  const header = trashScreen.locator("h1");
  await expect(header).toHaveText("Trash");

  // Verify either the empty state or the trash list exists
  const emptyState = trashScreen.locator("text=No deleted sessions");
  const trashedList = trashScreen.locator(".trashed-list");

  const emptyStateVisible = await emptyState.isVisible().catch(() => false);
  const trashedListVisible = await trashedList.isVisible().catch(() => false);

  expect(emptyStateVisible || trashedListVisible).toBe(true);
});
