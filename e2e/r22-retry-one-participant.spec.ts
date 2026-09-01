import { expect, test, type Page } from "@playwright/test";
import { installModelMocks } from "./mocks";

const QUESTION = "What practical plan should we build?";
const CLAUDE_ARGUMENT = "Yes — water reliably boils at 100°C (212°F) at sea level under standard atmospheric pressure; this is a well-established physical constant.";
const RETRIED_PARTNER_ARGUMENT = "The retried GPT-5.5 side completed without replacing Claude's successful side.";

async function installServices(page: Page): Promise<{ counts: { anthropic: number; openai: number } }> {
  const counts = { anthropic: 0, openai: 0 };
  await installModelMocks(page, { answerText: "This test exercises the explicit Multi-AI workflow." });
  await page.route("**/api/account", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, user: null }) });
  });
  await page.route("**/api/provider-status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ anthropic: true, openai: true, google: false, xai: false, deepseek: false }),
    });
  });
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path === "/api/proxy") counts.anthropic += 1;
  });
  await page.route("**/api/proxy-openai", async (route) => {
    counts.openai += 1;
    if (counts.openai === 1) {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "simulated first-attempt outage" }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ text: RETRIED_PARTNER_ARGUMENT, usage: { inputTokens: 40, outputTokens: 25 } }),
    });
  });
  return { counts };
}

async function restoreIfOffered(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  const app = page.locator("#root > *").first();
  await expect(restore.or(app)).toBeVisible();
  if (await restore.isVisible()) await restore.click();
  await expect(app).toBeVisible();
}

async function prepareConversation(page: Page): Promise<void> {
  await page.getByLabel("What's on your mind?").fill(QUESTION);
  await page.locator(".translate-ask-button").click();
  await page.getByRole("dialog", { name: "State change suggested" })
    .getByRole("button", { name: "Accept & Continue", exact: true }).click();
  await page.getByRole("dialog", { name: "Review AI-ready request" })
    .getByRole("button", { name: "Copy only", exact: true }).click();

  await page.locator(".leftnav-item").filter({ hasText: "Settings" }).click();
  await page.getByRole("button", { name: "Plan & credits", exact: true }).click();
  await page.getByRole("button", { name: "Start Plus sandbox checkout", exact: true }).click();
  await page.getByRole("dialog", { name: "Sandbox checkout pending" })
    .getByRole("button", { name: "Apply verified sandbox callback", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Verified sandbox callback applied exactly once");
  await page.locator(".leftnav-item").filter({ hasText: "Talk to AI" }).click();
}

async function approveCost(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog", { name: "Confirm AI Cost" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /Continue for up to/ }).click();
}

test("R22: retrying the failed participant makes one new provider call and preserves the success", async ({ page }) => {
  test.setTimeout(60_000);
  const { counts } = await installServices(page);
  await page.goto("/");
  await restoreIfOffered(page);
  await prepareConversation(page);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const actions = page.getByTestId("multi-ai-actions-body");
  await actions.getByRole("button", { name: "Start debate", exact: true }).click();
  await approveCost(page);

  const debate = actions.getByTestId("debate-view");
  await expect(debate).toContainText(CLAUDE_ARGUMENT);
  await expect(debate.getByRole("button", { name: "Try this side again", exact: true })).toBeVisible();
  expect(counts).toEqual({ anthropic: 1, openai: 1 });
  await expect(actions.getByRole("button", { name: "Consensus", exact: true })).toBeDisabled();

  await debate.getByRole("button", { name: "Try this side again", exact: true }).click();
  await approveCost(page);
  await expect(debate).toContainText(RETRIED_PARTNER_ARGUMENT);
  await expect(debate).toContainText(CLAUDE_ARGUMENT);
  await expect(debate.getByRole("button", { name: "Try this side again", exact: true })).toHaveCount(0);
  expect(counts).toEqual({ anthropic: 1, openai: 2 });
  await expect(actions.getByRole("button", { name: "Consensus", exact: true })).toBeEnabled();

  const branch = page.getByTestId("conversation-area").getByTestId("multi-ai-run");
  await expect(branch.getByRole("status")).toHaveText("Complete");
  await branch.locator("summary").click();
  await expect(branch).toContainText(CLAUDE_ARGUMENT);
  await expect(branch).toContainText(RETRIED_PARTNER_ARGUMENT);

  await page.reload();
  await restoreIfOffered(page);
  const restored = page.getByTestId("conversation-area").getByTestId("multi-ai-run");
  await expect(restored.getByRole("status")).toHaveText("Complete");
  await restored.locator("summary").click();
  await expect(restored).toContainText(CLAUDE_ARGUMENT);
  await expect(restored).toContainText(RETRIED_PARTNER_ARGUMENT);
  expect(counts).toEqual({ anthropic: 1, openai: 2 });
});
