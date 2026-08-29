import { test, expect, type Page } from "@playwright/test";
import { allowLocalAccess } from "./credit-helpers";

/* AccountGate.tsx calls GET /api/account on mount (services/durableSync.ts).
   vite preview has no serverless backend for that route and SPA-falls-back
   to index.html (200, non-JSON), which durableSync's jsonRequest silently
   treats as an empty-but-ok body — landing AccountGate in a permanently
   ambiguous `webUser === undefined` state ("Loading account" forever, see
   docs/checkpoints/CLAUDE-REPAIR-PROGRESS.md Session 6). Mocking it as
   `{ configured: false, user: null }` is the same workaround the project's
   own e2e specs are documented to use. */
async function mockAccountUnconfigured(page: Page): Promise<void> {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false, user: null }),
    });
  });
}

/* R07 (2nd repair attempt) — the LIVE Saved Tools -> Templates screen
   (TemplatesScreen in src/components/layout/ScreenRouter.tsx). Drives the
   real rendered create -> save -> reload -> load -> edit -> save -> edit ->
   cancel -> reload sequence end to end. The dead src/components/session/
   LoadTemplateMenu.tsx is never rendered by the app and is not exercised
   here. */

async function goToTemplates(page: Page) {
  await page.getByRole("button", { name: "Saved Tools", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Saved Tools", exact: true })).toBeVisible();
}

/* A reload with prior autosaved state can surface the "Welcome back" restore
   prompt (same as e2e/core-flow.spec.ts's restoreLastWorkIfPrompted) — while
   it's up, #root's normal content isn't rendered, so it must be resolved
   before anything else on the page can be interacted with. */
async function afterReload(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  if (await restore.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await restore.click();
  }
  await page.waitForSelector("#root > *", { timeout: 15_000 });
}

test("create, reload-rediscover, load, edit, and cancel a custom template", async ({ page }) => {
  await allowLocalAccess(page);
  await mockAccountUnconfigured(page);
  await page.goto("/");
  await page.waitForSelector("#root > *", { timeout: 15_000 });
  await goToTemplates(page);

  // ---- Create ----
  await page.getByRole("button", { name: "Create Template", exact: true }).click();
  await page.getByPlaceholder("e.g., Quick FAQ").fill("R07 E2E Template");
  await page.locator(".template-form select").selectOption("claude-opus-4-8");
  await page
    .getByPlaceholder("Pre-fill this question when the template is used")
    .fill("What is the R07 starter question?");
  await page.getByRole("button", { name: "Create", exact: true }).click();

  const card = page.locator(".template-card", { hasText: "R07 E2E Template" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("What is the R07 starter question?");
  await expect(card).toContainText("Model: claude-opus-4-8");

  // ---- Reload: rediscover (autosave debounce is AUTOSAVE_DELAY_MS=500ms
  // in src/services/persistence.ts; give it margin before reloading) ----
  await page.waitForTimeout(1_000);
  await page.reload();
  await afterReload(page);
  await goToTemplates(page);
  const cardAfterReload = page.locator(".template-card", { hasText: "R07 E2E Template" });
  await expect(cardAfterReload).toBeVisible();
  await expect(cardAfterReload).toContainText("What is the R07 starter question?");

  // ---- Load ----
  await cardAfterReload.getByRole("button", { name: "Use Template", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Talk to AI", exact: true }).first()).toBeVisible();
  await expect(page.getByLabel("What's on your mind?")).toHaveValue("What is the R07 starter question?");

  // ---- Edit: change starter question, Save ----
  await goToTemplates(page);
  const editCard = page.locator(".template-card", { hasText: "R07 E2E Template" });
  await editCard.locator('button[title="Edit template"]').click();
  const starterField = page.getByPlaceholder("Pre-fill this question when the template is used");
  await expect(starterField).toHaveValue("What is the R07 starter question?");
  await starterField.fill("Edited starter question after Save");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator(".template-card", { hasText: "R07 E2E Template" })).toContainText(
    "Edited starter question after Save",
  );

  // ---- Reload: edit persisted ----
  await page.waitForTimeout(1_000);
  await page.reload();
  await afterReload(page);
  await goToTemplates(page);
  await expect(page.locator(".template-card", { hasText: "R07 E2E Template" })).toContainText(
    "Edited starter question after Save",
  );

  // ---- Edit again, then Cancel ----
  const cardForCancel = page.locator(".template-card", { hasText: "R07 E2E Template" });
  await cardForCancel.locator('button[title="Edit template"]').click();
  const starterFieldAgain = page.getByPlaceholder("Pre-fill this question when the template is used");
  await starterFieldAgain.fill("This change must NOT be saved");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".template-card", { hasText: "R07 E2E Template" })).toContainText(
    "Edited starter question after Save",
  );
  await expect(page.getByText("This change must NOT be saved")).toHaveCount(0);

  // ---- Reload: cancel'd change was NOT persisted ----
  await page.waitForTimeout(1_000);
  await page.reload();
  await afterReload(page);
  await goToTemplates(page);
  await expect(page.locator(".template-card", { hasText: "R07 E2E Template" })).toContainText(
    "Edited starter question after Save",
  );
  await expect(page.getByText("This change must NOT be saved")).toHaveCount(0);
});
