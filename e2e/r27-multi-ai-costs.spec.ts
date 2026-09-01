import { expect, test, type Page } from "@playwright/test";
import { installModelMocks } from "./mocks";

const QUESTION = "What practical plan should we build?";

async function restoreIfOffered(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  const app = page.locator("#root > *").first();
  await expect(restore.or(app)).toBeVisible();
  if (await restore.isVisible()) await restore.click();
  await expect(app).toBeVisible();
}

async function prepareFundedConversation(page: Page): Promise<void> {
  await page.getByLabel("What's on your mind?").fill(QUESTION);
  await page.locator(".translate-ask-button").click();
  await page.getByRole("dialog", { name: "State change suggested" }).getByRole("button", { name: "Accept & Continue", exact: true }).click();
  await page.getByRole("dialog", { name: "Review AI-ready request" }).getByRole("button", { name: "Copy only", exact: true }).click();
  await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Plan & credits", exact: true }).click();
  await page.getByRole("button", { name: "Start Plus sandbox checkout", exact: true }).click();
  await page.getByRole("dialog", { name: "Sandbox checkout pending" }).getByRole("button", { name: "Apply verified sandbox callback", exact: true }).click();
  await page.getByTestId("col-left").getByRole("button", { name: "Talk to AI", exact: true }).click();
}

test("R27: authorization shows exact per-participant assumptions and persisted actual reconciliation", async ({ page }) => {
  await installModelMocks(page, { answerText: "Only Multi-AI is exercised." });
  await page.route("**/api/account", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, user: null }) });
  });
  await page.route("**/api/provider-status", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ anthropic: true, openai: true, google: false, xai: false, deepseek: false }) });
  });
  await page.goto("/");
  await restoreIfOffered(page);
  await prepareFundedConversation(page);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const actions = page.getByTestId("multi-ai-actions-body");
  await actions.getByRole("button", { name: "Start debate", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Confirm AI Cost" });
  const breakdown = dialog.getByTestId("cost-estimate-breakdown");
  await expect(breakdown.getByRole("listitem")).toHaveCount(2);
  const inputTokens = Math.ceil(QUESTION.length / 4) + 600;
  await expect(breakdown).toContainText(`Claude: anthropic · claude-sonnet-5 — assumes ${inputTokens} input tokens and up to 1200 output tokens`);
  await expect(breakdown).toContainText("$3/1M input + $15/1M output (multi-provider-prices-2026-09-01)");
  await expect(breakdown).toContainText(`gpt-5.5: openai · gpt-5.5 — assumes ${inputTokens} input tokens and up to 1200 output tokens`);
  await expect(breakdown).toContainText("$3/1M input + $12/1M output (multi-provider-prices-2026-09-01)");
  const claudeEstimate = (inputTokens * 3 + 1200 * 15) / 1_000_000;
  const openAiEstimate = (inputTokens * 3 + 1200 * 12) / 1_000_000;
  await expect(dialog).toContainText(`Estimated: up to $${(claudeEstimate + openAiEstimate).toFixed(4)}`);
  await dialog.getByRole("button", { name: /Continue for up to/ }).click();

  await expect(actions.getByTestId("debate-view").getByRole("region")).toHaveCount(2);
  const branch = page.getByTestId("conversation-area").getByTestId("multi-ai-run");
  await branch.locator("summary").click();
  await expect(branch).toContainText(`Estimated $${claudeEstimate.toFixed(4)} · Actual $0.0009`);
  await expect(branch).toContainText(`Estimated $${openAiEstimate.toFixed(4)} · Actual $0.0005`);
  await expect(branch).toContainText(`Total — estimated $${(claudeEstimate + openAiEstimate).toFixed(4)} · actual $0.0014`);

  await page.reload();
  await restoreIfOffered(page);
  const restored = page.getByTestId("conversation-area").getByTestId("multi-ai-run");
  await restored.locator("summary").click();
  await expect(restored).toContainText("Actual $0.0009");
  await expect(restored).toContainText("Actual $0.0005");
});
