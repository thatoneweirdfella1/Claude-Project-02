import { expect, test, type Page } from "@playwright/test";
import { allowLocalAccess } from "./credit-helpers";

interface FilePayload {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

const UNSUPPORTED_MESSAGE =
  '"archive.zip" isn\'t a supported file type. Choose a PDF, TXT, JSON, CSV, PNG, JPG, JPEG, GIF, WEBP, or BMP file.';
const OVERSIZED_MESSAGE =
  '"too-large.txt" is 10.0 MB, over the 10.0 MB per-file limit. Choose a file no larger than 10.0 MB.';

async function mockAccountUnconfigured(page: Page): Promise<void> {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false, user: null }),
    });
  });
}

async function chooseContextFile(page: Page, file: FilePayload): Promise<void> {
  await page.getByRole("button", { name: /Add Context/ }).click();
  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles(file);
}

async function openContextSnapshot(page: Page): Promise<void> {
  const trigger = page.getByRole("button", { name: /Context Snapshot/ });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
}

async function restoreAfterReload(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  if (await restore.count() > 0) {
    await expect(restore).toBeVisible();
    await restore.click();
  }
  await expect(page.getByRole("button", { name: /Add Context/ })).toBeVisible();
}

test.describe("R09 File Attachment", () => {
  test.beforeEach(async ({ page }) => {
    await allowLocalAccess(page);
    await mockAccountUnconfigured(page);
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Add Context/ })).toBeVisible();
  });

  test("supported upload shows name, type, size, provenance, and included state", async ({ page }) => {
    await chooseContextFile(page, {
      name: "evidence.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("R09 browser proof"),
    });

    await openContextSnapshot(page);
    const row = page.locator(".context-snapshot-panel__row").filter({ hasText: "evidence.txt" });
    await expect(row).toBeVisible();
    await expect(row).toContainText("evidence.txt");
    await expect(row).toContainText("text/plain");
    await expect(row).toContainText("17 B");
    await expect(row).toContainText("Uploaded");
    await expect(row).toContainText("Included");
  });

  test("visible controls exclude and include an attached file", async ({ page }) => {
    await chooseContextFile(page, {
      name: "toggle.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("toggle"),
    });
    await openContextSnapshot(page);

    const row = page.locator(".context-snapshot-panel__row").filter({ hasText: "toggle.txt" });
    await row.getByRole("button", { name: "Exclude toggle.txt", exact: true }).click();
    await expect(row).toContainText("Excluded");
    await row.getByRole("button", { name: "Include toggle.txt", exact: true }).click();
    await expect(row).toContainText("Included");
  });

  test("visible Remove control removes an attached file", async ({ page }) => {
    await chooseContextFile(page, {
      name: "remove-me.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("remove"),
    });
    await openContextSnapshot(page);

    const row = page.locator(".context-snapshot-panel__row").filter({ hasText: "remove-me.txt" });
    await row.getByRole("button", { name: "Remove remove-me.txt", exact: true }).click();
    await expect(row).toHaveCount(0);
    await expect(page.getByText("No context attached.", { exact: true })).toBeVisible();
  });

  test("unsupported file shows the exact actionable rejection and never enters context", async ({ page }) => {
    await chooseContextFile(page, {
      name: "archive.zip",
      mimeType: "application/zip",
      buffer: Buffer.from("not context"),
    });

    await expect(page.getByRole("alert")).toHaveText(UNSUPPORTED_MESSAGE);
    await openContextSnapshot(page);
    await expect(page.locator(".context-snapshot-panel__row")).toHaveCount(0);
    await expect(page.getByText("No context attached.", { exact: true })).toBeVisible();
  });

  test("oversized file shows the exact actionable rejection and never enters context", async ({ page }) => {
    await chooseContextFile(page, {
      name: "too-large.txt",
      mimeType: "text/plain",
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 97),
    });

    await expect(page.getByRole("alert")).toHaveText(OVERSIZED_MESSAGE);
    await openContextSnapshot(page);
    await expect(page.locator(".context-snapshot-panel__row")).toHaveCount(0);
    await expect(page.getByText("No context attached.", { exact: true })).toBeVisible();
  });

  test("successfully attached file persists through reload", async ({ page }) => {
    await chooseContextFile(page, {
      name: "persistent.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("persist me"),
    });
    await openContextSnapshot(page);
    await expect(page.locator(".context-snapshot-panel__row").filter({ hasText: "persistent.txt" })).toContainText("Included");

    await page.waitForTimeout(700);
    await page.reload();
    await restoreAfterReload(page);
    await openContextSnapshot(page);

    const row = page.locator(".context-snapshot-panel__row").filter({ hasText: "persistent.txt" });
    await expect(row).toContainText("text/plain");
    await expect(row).toContainText("Uploaded");
    await expect(row).toContainText("Included");
  });
});
