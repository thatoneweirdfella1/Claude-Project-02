import { test, expect, type Page } from "@playwright/test";
import { installModelMocks } from "./mocks";

const QUESTION = "so umm i was wondering, what temperature does water boil at? like at sea level i guess";
const ANSWER_TEXT =
  "Water boils at 100 degrees Celsius, which is 212 degrees Fahrenheit, at sea level under standard atmospheric pressure.";

/* Second-pass fix: this file never mocked /api/account, so AccountGate
   (services/durableSync.ts) sat forever in an ambiguous "Loading account"
   state against vite preview's SPA-fallback 200/HTML response — every test
   here failed before it could even find the composer. Same fix already
   established in e2e/templates.spec.ts, e2e/url-context.spec.ts, etc. */
async function mockAccountUnconfigured(page: Page): Promise<void> {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, user: null }) });
  });
}

async function afterReload(page: Page): Promise<void> {
  await page.waitForSelector("#root > *", { timeout: 15_000 });
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  if (await restore.isVisible({ timeout: 3_000 }).catch(() => false)) await restore.click();
}

/* Second-pass fix: the original helper clicked a "Copy-ready · Continue"
   button that has never existed in ReviewReadyRequest.tsx — a dead
   selector on every run. Both tests below only need ANY message in the
   conversation (Composer.tsx's hasConversation gate is just
   `conversation.length > 0`) to reveal Multi-AI Actions; they deliberately
   stay on the default "Universal" (free-first, no provider configured)
   destination, since that's exactly the route being tested — so the real
   fix is completing the free/manual handoff dialog ("Copy only"), not
   routing through a paid destination. This file's two tests never ran
   successfully before this fix — confirmed by reproducing the original
   failure against a stashed copy of the file, unrelated to any other
   change this pass made. */
async function askAndAnswer(page: import("@playwright/test").Page): Promise<void> {
  await page.getByLabel("What's on your mind?").fill(QUESTION);
  await page.locator(".translate-ask-button").click();
  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await review.getByRole("button", { name: "Copy only" }).click();
  await expect(page.locator(".message-bubble--assistant").first()).toBeVisible({ timeout: 10_000 });
}

test("multi-AI: paid routes stay visibly disabled on the free-first route", async ({ page }) => {
  await installModelMocks(page, { answerText: ANSWER_TEXT });
  await mockAccountUnconfigured(page);
  await page.goto("/");
  await afterReload(page);
  await askAndAnswer(page);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const body = page.locator('[data-testid="multi-ai-actions-body"]');
  await expect(body).toBeVisible();
  await expect(body.getByRole("status")).toContainText("Paid multi-AI routes are unavailable");

  await expect(body.getByRole("button", { name: "Manual selection" })).toBeDisabled();
  await expect(body.getByRole("button", { name: "Start debate" })).toBeDisabled();
  await expect(body.getByRole("button", { name: "Consensus" })).toBeDisabled();
  await expect(body.getByRole("button", { name: "Synthesis" })).toBeDisabled();
  await expect(page.getByRole("dialog", { name: "Confirm AI Cost" })).toHaveCount(0);
});

test("multi-AI: Consensus and Synthesis are disabled before a debate completes", async ({ page }) => {
  await installModelMocks(page, { answerText: ANSWER_TEXT });
  await mockAccountUnconfigured(page);
  await page.goto("/");
  await afterReload(page);
  await askAndAnswer(page);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const body = page.locator('[data-testid="multi-ai-actions-body"]');
  await expect(body).toBeVisible();

  await expect(body.getByRole("button", { name: "Consensus" })).toBeDisabled();
  await expect(body.getByRole("button", { name: "Synthesis" })).toBeDisabled();
});
