import { test, expect } from "@playwright/test";
import { allowLocalAccess } from "./credit-helpers";

test("Session History: save, load, delete, restore", async ({ page }) => {
  // Navigate to app
  await allowLocalAccess(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Go to Translate screen and create a session by duplicating
  const leftNav = page.locator(".leftnav-items");
  const translateButton = leftNav.locator("text=Translate");
  await translateButton.click();
  await page.waitForLoadState("networkidle");

  // Click "Duplicate Session" to create a test session
  const duplicateButton = page.locator("button:has-text('Duplicate Session')");
  await duplicateButton.click();
  await page.waitForTimeout(500);

  // Navigate to Sessions screen
  const sessionsNavItem = leftNav.locator("text=Sessions");
  await sessionsNavItem.click();
  await page.waitForLoadState("networkidle");

  // Verify the duplicated session appears in the list
  const sessionsList = page.locator(".session-list");
  await expect(sessionsList).toBeVisible();

  const sessionItems = page.locator(".session-item");
  const itemCount = await sessionItems.count();
  expect(itemCount).toBeGreaterThan(0);

  // Get the first session item
  const firstSession = sessionItems.first();
  const sessionTitle = firstSession.locator("h3").first();
  await expect(sessionTitle).toBeVisible();

  // Test Load button
  const loadButton = firstSession.locator("button:has-text('Load')");
  await loadButton.click();
  await page.waitForLoadState("networkidle");

  // Verify we're back on Translate screen
  const centerColumn = page.locator(".center-column");
  await expect(centerColumn).toBeVisible();

  // Go back to Sessions screen
  await sessionsNavItem.click();
  await page.waitForLoadState("networkidle");

  // Test Delete button (move to trash)
  const firstSessionAgain = page.locator(".session-item").first();
  const deleteButton = firstSessionAgain.locator("button:has-text('Delete')");
  await deleteButton.click();
  await page.waitForTimeout(500);

  // Verify session is gone from Sessions screen
  const sessionItemsAfterDelete = page.locator(".session-item");
  const countAfterDelete = await sessionItemsAfterDelete.count();
  expect(countAfterDelete).toBeLessThan(itemCount);

  // Navigate to Trash screen
  const trashNavItem = leftNav.locator("text=Trash");
  await trashNavItem.click();
  await page.waitForLoadState("networkidle");

  // Verify the deleted session appears in trash
  const trashedList = page.locator(".trashed-list");
  await expect(trashedList).toBeVisible();

  const trashedItems = page.locator(".trashed-item");
  const trashedCount = await trashedItems.count();
  expect(trashedCount).toBeGreaterThan(0);

  // Test Restore button
  const firstTrashedSession = trashedItems.first();
  const restoreButton = firstTrashedSession.locator("button:has-text('Restore')");
  await restoreButton.click();
  await page.waitForTimeout(500);

  // Verify session is gone from Trash screen
  const trashedItemsAfterRestore = page.locator(".trashed-item");
  const trashedCountAfterRestore = await trashedItemsAfterRestore.count();
  expect(trashedCountAfterRestore).toBeLessThan(trashedCount);

  // Navigate back to Sessions screen to confirm session is restored
  await sessionsNavItem.click();
  await page.waitForLoadState("networkidle");

  const sessionItemsAfterRestore = page.locator(".session-item");
  const countAfterRestore = await sessionItemsAfterRestore.count();
  expect(countAfterRestore).toBeGreaterThan(countAfterDelete);
});
