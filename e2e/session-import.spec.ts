import { test, expect, type Page } from "@playwright/test";
import { allowLocalAccess } from "./credit-helpers";

/* R08 (2nd repair attempt) — Session Import Selector.

   The first R08 pass fixed src/components/session/ImportModal.tsx, which is
   dead code: never imported or rendered anywhere in the app (see
   docs/checkpoints/CLAUDE-REPAIR-GROUP-1-R08.md Session 9). The real, live
   "import a supported session file" UI is the Sessions screen
   (SessionsScreen in src/components/layout/ScreenRouter.tsx, routed at
   PRIMARY_NAVIGATION "sessions"): an "Import" button opens a hidden
   `<input type="file" accept=".json">`. Before this fix, selecting a file
   applied it to the store immediately with no preview and no confirm step,
   and rejected bad files with a blocking native alert() (which Playwright
   can't even assert the text of without special handling). This spec
   drives the real rendered Sessions screen end to end: chooser -> preview
   -> confirm/cancel/reject -> reload persistence -> no partial import. */

async function mockAccountUnconfigured(page: Page): Promise<void> {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false, user: null }),
    });
  });
}

async function goToSessions(page: Page) {
  await page.getByRole("button", { name: "Sessions", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sessions", exact: true })).toBeVisible();
}

async function afterReload(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  if (await restore.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await restore.click();
  }
  await page.waitForSelector("#root > *", { timeout: 15_000 });
}

const VALID_SESSION_JSON = JSON.stringify({
  id: "external-session-e2e",
  createdAt: Date.now(),
  archived: false,
  tag: "R08 E2E Imported Session",
  model: "auto",
  directness: 2,
  techniques: [],
  context: [{ id: "c1", kind: "text", label: "Notes", content: "hi", bytes: 2 }],
  variables: {},
  conversation: [
    { id: "m1", role: "user", content: "hello from the imported file", timestamp: 1 },
    { id: "m2", role: "assistant", content: "hi there", timestamp: 2 },
  ],
});

test("Session Import Selector: chooser, preview, confirm, cancel, reject, no partial import", async ({ page }) => {
  await allowLocalAccess(page);
  await mockAccountUnconfigured(page);
  await page.goto("/");
  await page.waitForSelector("#root > *", { timeout: 15_000 });

  // ---- R08.1: visible chooser, even with zero sessions on the screen ----
  await goToSessions(page);
  await expect(page.getByText("No active sessions yet.")).toBeVisible();
  const importButton = page.getByRole("button", { name: "Import", exact: true });
  await expect(importButton).toBeVisible();
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toHaveCount(1);
  await expect(fileInput).toHaveAttribute("accept", ".json");
  // No dialog is open yet — nothing was auto-imported.
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // ---- R08.3: actionable rejection for a broken file, nothing applied ----
  await fileInput.setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{ this is not valid json"),
  });
  const rejectDialog = page.getByRole("dialog", { name: "Import a session file" });
  await expect(rejectDialog).toBeVisible();
  await expect(rejectDialog).toContainText(/valid JSON/i);
  const confirmBtn = rejectDialog.getByRole("button", { name: "Confirm import", exact: true });
  await expect(confirmBtn).toBeDisabled();
  await rejectDialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("No active sessions yet.")).toBeVisible();

  // ---- R08.2/R08.4: preview a valid file, Cancel applies nothing ----
  await fileInput.setInputFiles({
    name: "session.json",
    mimeType: "application/json",
    buffer: Buffer.from(VALID_SESSION_JSON),
  });
  const previewDialog = page.getByRole("dialog", { name: "Import a session file" });
  await expect(previewDialog).toBeVisible();
  await expect(previewDialog).toContainText("R08 E2E Imported Session");
  await expect(previewDialog).toContainText("2 messages");
  await expect(previewDialog).toContainText("1 context item");
  await expect(previewDialog.getByRole("button", { name: "Confirm import", exact: true })).toBeEnabled();
  await previewDialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("No active sessions yet.")).toBeVisible();

  // ---- R08.4/R08.5: explicit Confirm actually applies the import ----
  await fileInput.setInputFiles({
    name: "session.json",
    mimeType: "application/json",
    buffer: Buffer.from(VALID_SESSION_JSON),
  });
  const confirmDialog = page.getByRole("dialog", { name: "Import a session file" });
  await confirmDialog.getByRole("button", { name: "Confirm import", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("R08 E2E Imported Session")).toBeVisible();

  // ---- Reload: the import genuinely persisted, not just a UI illusion ----
  await page.waitForTimeout(1_000);
  await page.reload();
  await afterReload(page);
  await goToSessions(page);
  await expect(page.getByText("R08 E2E Imported Session")).toBeVisible();

  // ---- R08.5: a rejected import after a real session exists changes nothing ----
  await fileInput.setInputFiles({
    name: "empty.json",
    mimeType: "application/json",
    buffer: Buffer.from(""),
  });
  const emptyDialog = page.getByRole("dialog", { name: "Import a session file" });
  await expect(emptyDialog).toContainText(/empty/i);
  await expect(emptyDialog.getByRole("button", { name: "Confirm import", exact: true })).toBeDisabled();
  await emptyDialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Still exactly the one previously-imported session — no partial/ghost entries.
  await expect(page.locator(".session-item")).toHaveCount(1);
  await expect(page.getByText("R08 E2E Imported Session")).toBeVisible();
});
