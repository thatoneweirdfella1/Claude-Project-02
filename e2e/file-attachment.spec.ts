/* R09 File Attachment verification
   - Files are accepted and appear in Context Snapshot with name, type, size, and provenance
   - Unsupported and oversized files show actionable rejection messages with exact text
   - Rejected files never enter context
   - Inclusion state can be toggled with real clicks
   - Files can be removed with real clicks
   - Changes persist through reload
 */

import { test, expect, type Page } from "@playwright/test";
import { allowLocalAccess } from "./credit-helpers";

async function mockAccountUnconfigured(page: Page): Promise<void> {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false, user: null }),
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

test.describe("R09 File Attachment", () => {
  test.beforeEach(async ({ page }) => {
    await allowLocalAccess(page);
    await mockAccountUnconfigured(page);
    await page.goto("/");
    await page.waitForSelector("#root > *", { timeout: 15_000 });
    // Wait for Add Context button to be visible
    await page.getByRole("button", { name: "Add Context" }).waitFor({ state: "visible" });
  });

  test("uploads a text file and shows it in Context Snapshot with name, type, size, provenance", async ({ page }) => {
    const fileName = "test.txt";
    const fileContent = "This is a test file for context attachment.";

    // Find the file input and set files directly
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: "text/plain",
      buffer: Buffer.from(fileContent),
    });

    // Wait for file to appear in the snapshot
    await page.getByText(fileName).first().waitFor({ state: "visible", timeout: 15000 });

    // Check that the file appears in the context snapshot with all required fields
    const fileRow = page.locator(".context-snapshot-panel__row").filter({ hasText: fileName });
    await expect(fileRow).toBeVisible({ timeout: 15000 });

    // Verify all required fields are present
    await expect(fileRow).toContainText("file", { timeout: 5000 }); // Kind (lowercase in snapshot)
    await expect(fileRow).toContainText(fileName, { timeout: 5000 }); // Name
    await expect(fileRow).toContainText("Uploaded", { timeout: 5000 }); // Provenance
    // Size should be shown in bytes
    await expect(fileRow).toContainText("B", { timeout: 5000 });
  });

  test("shows actionable rejection message for unsupported file types", async ({ page }) => {
    // Set unsupported file (zip) directly on the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "archive.zip",
      mimeType: "application/zip",
      buffer: Buffer.from("PK\x03\x04"), // ZIP file signature
    });

    // Wait for and verify the rejection message appears
    const rejectionDiv = page.locator(".attach-context-controls__rejections");
    await expect(rejectionDiv).toBeVisible({ timeout: 10000 });

    // Verify the exact actionable rejection message
    await expect(rejectionDiv).toContainText("archive.zip");
    await expect(rejectionDiv).toContainText("isn't a supported file type yet");
    await expect(rejectionDiv).toContainText("PDF, TXT, JSON, CSV, and image files");

    // Verify the rejected file did NOT enter context
    const snapshotRows = page.locator(".context-snapshot-panel__row").filter({ hasText: "archive.zip" });
    await expect(snapshotRows).not.toBeVisible();

    // Click dismiss to clear rejection
    await page.locator(".attach-context-controls__rejections button").click();
    await expect(rejectionDiv).not.toBeVisible();
  });

  test("shows actionable rejection for oversized files", async ({ page }) => {
    // Create a file larger than 10MB (11MB) and set it directly on the file input
    const oversizedSize = 11 * 1024 * 1024;
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "huge.txt",
      mimeType: "text/plain",
      buffer: Buffer.alloc(oversizedSize), // 11MB file
    });

    // Wait for rejection message
    const rejectionDiv = page.locator(".attach-context-controls__rejections");
    await expect(rejectionDiv).toBeVisible({ timeout: 15000 });

    // Verify the exact actionable rejection message
    await expect(rejectionDiv).toContainText("huge.txt", { timeout: 5000 });
    await expect(rejectionDiv).toContainText("over the 10 MB per-file limit", { timeout: 5000 });

    // Verify the oversized file did NOT enter context
    const snapshotRows = page.locator(".context-snapshot-panel__row").filter({ hasText: "huge.txt" });
    await expect(snapshotRows).not.toBeVisible();
  });

  test("shows inclusion state and allows toggling with real clicks", async ({ page }) => {
    const fileName = "toggletest.txt";
    const fileContent = "Test content for toggle";

    // Set file directly on the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: "text/plain",
      buffer: Buffer.from(fileContent),
    });

    // Wait for file to appear
    await page.getByText(fileName).first().waitFor({ state: "visible", timeout: 15000 });

    // Click "View All" button with proper locator
    const viewAllButton = page.getByRole("button").filter({ hasText: "View All" });
    await viewAllButton.click();

    // Wait for the Manage Context dialog
    await page.getByText("Manage Context").waitFor({ state: "visible" });

    // Verify file is shown with "Included" status
    const fileRow = page.locator(".context-manager-row").filter({ hasText: fileName });
    await expect(fileRow.locator("small")).toContainText("Included", { timeout: 5000 });

    // Find and click the checkbox for this file with real click
    const checkbox = fileRow.locator('input[type="checkbox"]');
    await checkbox.click();

    // Verify it now says "Excluded"
    await expect(fileRow.locator("small")).toContainText("Excluded", { timeout: 5000 });

    // Toggle back to Included with real click
    await checkbox.click();
    await expect(fileRow.locator("small")).toContainText("Included", { timeout: 5000 });
  });

  test("allows removing a file with real click", async ({ page }) => {
    const fileName = "removetest.txt";
    const fileContent = "Test content for removal";

    // Set file directly on the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: "text/plain",
      buffer: Buffer.from(fileContent),
    });

    // Wait for file to appear
    await page.getByText(fileName).first().waitFor({ state: "visible", timeout: 15000 });

    // Verify file is in context snapshot
    const snapshotRow = page.locator(".context-snapshot-panel__row").filter({ hasText: fileName });
    await expect(snapshotRow).toBeVisible({ timeout: 5000 });

    // Open the context manager
    await page.getByRole("button").filter({ hasText: "View All" }).click();
    await page.getByText("Manage Context").waitFor({ state: "visible" });

    // Find the row for this file and click Remove button with real click
    const fileRow = page.locator(".context-manager-row").filter({ hasText: fileName });
    const removeButton = fileRow.getByRole("button", { name: "Remove" });
    await removeButton.click();

    // Verify the file is no longer visible in the dialog
    await expect(fileRow).not.toBeVisible({ timeout: 5000 });
  });

  test("persistence through reload", async ({ page }) => {
    const fileName = "persistent.txt";
    const fileContent = "Content that should persist";

    // Set file directly on the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: "text/plain",
      buffer: Buffer.from(fileContent),
    });

    // Wait for file to appear
    await page.getByText(fileName).first().waitFor({ state: "visible", timeout: 15000 });

    // Verify it appears in context snapshot with correct provenance
    const snapshotRow = page.locator(".context-snapshot-panel__row").filter({ hasText: fileName });
    await expect(snapshotRow).toContainText("Uploaded", { timeout: 5000 });

    // Wait a bit for autosave
    await page.waitForTimeout(2_000);

    // Reload the page
    await page.reload();
    await afterReload(page);

    // Check that the file is still there after reload
    const persistedRow = page.locator(".context-snapshot-panel__row").filter({ hasText: fileName });
    await expect(persistedRow).toBeVisible({ timeout: 15000 });
    await expect(persistedRow).toContainText("Uploaded", { timeout: 5000 });
  });

  test("displays correct provenance for different attachment sources", async ({ page }) => {
    // File upload (should show "Uploaded")
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "uploaded.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Uploaded content"),
    });

    await page.getByText("uploaded.txt").first().waitFor({ state: "visible", timeout: 15000 });
    let row = page.locator(".context-snapshot-panel__row").filter({ hasText: "uploaded.txt" });
    await expect(row).toContainText("Uploaded", { timeout: 5000 });

    // Open Add Context menu again
    await page.getByRole("button", { name: "Add Context" }).click();

    // Add pasted text (should show "Pasted")
    await page.getByRole("menuitem", { name: "Paste Text" }).click();
    await page.fill("input[placeholder='Meeting notes']", "My Notes");
    await page.fill("textarea", "This is pasted content");
    await page.getByRole("button", { name: "Add Text" }).click();

    // Check that pasted text shows "Pasted" provenance
    await page.getByText("My Notes").waitFor({ state: "visible" });
    row = page.locator(".context-snapshot-panel__row").filter({ hasText: "My Notes" });
    await expect(row).toContainText("Pasted", { timeout: 5000 });
  });
});
