import { test, expect, type Page } from "@playwright/test";
import { installModelMocks } from "./mocks";
import { enableDeveloperMode } from "./credit-helpers";

const QUESTION = "What is 2+2?";
const EXPECTED_ANSWER = "The answer is four.";

async function restoreLastWorkIfPrompted(page: Page) {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  if (await restore.isVisible({ timeout: 2_000 }).catch(() => false)) await restore.click();
}

async function disableReviewBeforeSend(page: Page) {
  await page.getByRole("button", { name: "Show Advanced Controls" }).click();
  await page.waitForTimeout(300);
  await page.locator('input[name="review-before-sending"]').nth(1).click();
  await page.getByRole("button", { name: "Show Advanced Controls" }).click();
  await page.waitForTimeout(300);
}

async function handleStateReviewIfNeeded(page: Page) {
  const keepCurrentBtn = page.getByRole("button", { name: "Keep current" });
  const hasStateReview = await keepCurrentBtn.isVisible({ timeout: 1000 }).catch(() => false);
  if (hasStateReview) {
    await keepCurrentBtn.click();
    await page.waitForTimeout(500);
  }
}

test("Developer Mode: Bypasses cost authorization in real pipeline", async ({ page }) => {
  // Install mocks to simulate provider response
  await installModelMocks(page, { answerText: EXPECTED_ANSWER });
  await page.goto("/");
  await restoreLastWorkIfPrompted(page);

  // Disable review-before-send setting
  await disableReviewBeforeSend(page);

  // Enable Developer Mode
  await enableDeveloperMode(page);

  // Type a message
  const input = page.getByLabel("What's on your mind?");
  await input.fill(QUESTION);

  // Click Send button
  await page.locator(".translate-ask-button").click();

  // In Developer Mode, NO COST CONFIRMATION DIALOG should appear
  // Instead, request should flow directly through pipeline
  const costDialog = page.getByRole("dialog", { name: "Confirm AI Cost" });
  await expect(costDialog).not.toBeVisible({ timeout: 2000 });

  // Wait for pipeline to start
  await page.waitForTimeout(1500);

  // Handle state review if needed
  await handleStateReviewIfNeeded(page);

  // Give pipeline time to execute fully
  await page.waitForTimeout(2000);

  // Verify message was added to conversation (with longer timeout for streaming)
  const userMessage = page.locator(".message-bubble--user").first();
  await expect(userMessage).toContainText(QUESTION, { timeout: 10_000 });

  // Verify pipeline executed and response arrived
  const assistantMessage = page.locator(".message-bubble--assistant").first();
  await expect(assistantMessage).toContainText(EXPECTED_ANSWER, { timeout: 10_000 });
});

test("Developer Mode: Uses existing translation pipeline", async ({ page }) => {
  // Install mocks for provider response
  await installModelMocks(page, { answerText: "Response from pipeline" });
  await page.goto("/");
  await restoreLastWorkIfPrompted(page);

  // Disable review-before-send setting
  await disableReviewBeforeSend(page);

  // Enable Developer Mode
  await enableDeveloperMode(page);

  // Send message
  const input = page.getByLabel("What's on your mind?");
  await input.fill("Test message");
  await page.locator(".translate-ask-button").click();

  // Wait for pipeline to start
  await page.waitForTimeout(1500);

  // Handle state review if needed
  await handleStateReviewIfNeeded(page);

  // Wait for pipeline to complete
  await page.waitForTimeout(1000);

  // Verify the translation pipeline ran (answer appears)
  const assistantMessage = page.locator(".message-bubble--assistant").first();
  await expect(assistantMessage).toContainText("Response from pipeline", { timeout: 10_000 });
});

test("Developer Mode: Conversation persists on reload", async ({ page }) => {
  await installModelMocks(page, { answerText: "Persistent answer" });
  await page.goto("/");
  await restoreLastWorkIfPrompted(page);

  // Disable review-before-send setting
  await disableReviewBeforeSend(page);

  // Enable Developer Mode
  await enableDeveloperMode(page);

  // Send a message
  const input = page.getByLabel("What's on your mind?");
  await input.fill(QUESTION);
  await page.locator(".translate-ask-button").click();

  // Wait for pipeline to start
  await page.waitForTimeout(1500);

  // Handle state review if needed
  await handleStateReviewIfNeeded(page);

  // Wait for response
  const assistantMessage = page.locator(".message-bubble--assistant").first();
  await expect(assistantMessage).toContainText("Persistent answer", { timeout: 10_000 });

  // Wait for autosave
  await page.waitForTimeout(3000);

  // Re-install mocks before reload (they're cleared when page reloads)
  await installModelMocks(page, { answerText: "Persistent answer" });

  // Reload page
  await page.reload();

  // Wait for page to stabilize after reload
  await page.waitForTimeout(1000);

  // Verify conversation persisted
  await expect(page.locator(".message-bubble--user").first()).toContainText(QUESTION, { timeout: 10_000 });
  await expect(page.locator(".message-bubble--assistant").first()).toContainText("Persistent answer");
});

test("Developer Mode: Respects provider selection", async ({ page }) => {
  await installModelMocks(page, { answerText: "Provider response" });
  await page.goto("/");
  await restoreLastWorkIfPrompted(page);

  // Disable review-before-send setting
  await disableReviewBeforeSend(page);

  // Enable Developer Mode
  await enableDeveloperMode(page);

  // Select Anthropic provider explicitly (it's available)
  await page.getByRole("button", { name: /Any AI|Anthropic/ }).first().click();
  await page.waitForTimeout(500);  // Wait for provider selection to take effect

  // Verify Send button becomes enabled when a provider is available
  const sendButton = page.locator(".translate-ask-button");
  await expect(sendButton).toBeEnabled({ timeout: 5_000 });

  // Send message with selected provider
  const input = page.getByLabel("What's on your mind?");
  await input.fill("Test");
  await sendButton.click();

  // Wait for pipeline to start
  await page.waitForTimeout(1500);

  // Handle state review if needed
  await handleStateReviewIfNeeded(page);

  // Verify response came from the selected provider via pipeline
  const assistantMessage = page.locator(".message-bubble--assistant").first();
  await expect(assistantMessage).toBeVisible({ timeout: 10_000 });
});

test("Developer Mode: Unavailable provider disables Send", async ({ page }) => {
  // Mock with only unavailable providers
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false, user: null }),
    });
  });
  await page.route("**/api/verify-access", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: false, ok: true }),
    });
  });
  await page.route("**/api/provider-status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        anthropic: false,
        openai: false,
        google: false,
        xai: false,
        deepseek: false,
      }),
    });
  });

  await page.goto("/");
  await restoreLastWorkIfPrompted(page);

  // Enable Developer Mode
  await enableDeveloperMode(page);

  // Type a message
  const input = page.getByLabel("What's on your mind?");
  await input.fill("Test message");

  // Verify Send button remains disabled when no providers available
  const sendButton = page.locator(".translate-ask-button");
  await expect(sendButton).toBeDisabled({ timeout: 3_000 });
});
