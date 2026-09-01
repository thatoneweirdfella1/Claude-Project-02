import { expect, test, type Page, type Route } from "@playwright/test";
import { debateSystemPrompt } from "../src/services/debate/prompt";
import { CONSENSUS_SYSTEM_PROMPT, SYNTHESIS_SYSTEM_PROMPT } from "../src/services/multiAi/prompt";
import { installModelMocks } from "./mocks";

const QUESTION = "What practical plan should we build?";
const CLAUDE_TEXT = "Claude completed before the other participant was cancelled.";
const PARTNER_TEXT = "GPT-5.5 completed its argument.";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function anthropic(text: string): string {
  return JSON.stringify({ content: [{ type: "text", text }], usage: { input_tokens: 50, output_tokens: 30 } });
}

async function installServices(page: Page) {
  const control = { slowPartner: true, slowConsensus: false, slowSynthesis: false };
  const counts = { claudeCompleted: 0, consensus: 0, synthesis: 0 };
  await installModelMocks(page, { answerText: "This test uses explicit Multi-AI actions." });
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
  await page.route("**/api/proxy-openai", async (route: Route) => {
    if (control.slowPartner) await delay(5_000);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ text: PARTNER_TEXT, usage: { inputTokens: 45, outputTokens: 25 } }),
    });
  });
  await page.route("**/api/proxy", async (route: Route) => {
    const body = route.request().postDataJSON() as { system?: string };
    if (body.system === debateSystemPrompt("for") || body.system === debateSystemPrompt("against")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: anthropic(CLAUDE_TEXT) });
      counts.claudeCompleted += 1;
      return;
    }
    if (body.system === CONSENSUS_SYSTEM_PROMPT) {
      counts.consensus += 1;
      if (control.slowConsensus) await delay(5_000);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: anthropic(JSON.stringify({ disagreement: "Different emphasis", commonGround: "Shared facts", unifiedView: "Combined view" })),
      });
      return;
    }
    if (body.system === SYNTHESIS_SYSTEM_PROMPT) {
      counts.synthesis += 1;
      if (control.slowSynthesis) await delay(5_000);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: anthropic(JSON.stringify({ refinedAnswer: "A measured combined answer." })),
      });
      return;
    }
    throw new Error(`Unexpected proxy request: ${JSON.stringify(body)}`);
  });
  return { control, counts };
}

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

test("R24: visible cancel aborts debate, consensus, and synthesis and persists truthful partial work", async ({ page }) => {
  test.setTimeout(90_000);
  const { control, counts } = await installServices(page);
  await page.goto("/");
  await restoreIfOffered(page);
  await prepareFundedConversation(page);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const actions = page.getByTestId("multi-ai-actions-body");
  await actions.getByRole("button", { name: "Start debate", exact: true }).click();
  await approveCost(page);
  await expect.poll(() => counts.claudeCompleted).toBe(1);
  await actions.getByTestId("multi-ai-cancel").click();

  const branches = page.getByTestId("conversation-area").getByTestId("multi-ai-run");
  await expect(branches).toHaveCount(1);
  await expect(branches.nth(0).getByRole("status")).toHaveText("Cancelled");
  await branches.nth(0).locator("summary").click();
  await expect(branches.nth(0)).toContainText(CLAUDE_TEXT);

  control.slowPartner = false;
  await actions.getByRole("button", { name: "Run debate again", exact: true }).click();
  await approveCost(page);
  await expect(actions.getByTestId("debate-view")).toContainText(PARTNER_TEXT);

  control.slowConsensus = true;
  await actions.getByRole("button", { name: "Consensus", exact: true }).click();
  await approveCost(page);
  await expect.poll(() => counts.consensus).toBe(1);
  await actions.getByTestId("multi-ai-cancel").click();
  await expect(actions.getByRole("status").filter({ hasText: "Consensus was cancelled" })).toBeVisible();
  await expect(branches.nth(1).getByRole("status")).toHaveText("Cancelled");

  control.slowConsensus = false;
  await actions.getByRole("button", { name: "Consensus", exact: true }).click();
  await approveCost(page);
  await expect(actions.getByTestId("consensus-view")).toBeVisible();
  await expect(branches.nth(1).getByRole("status")).toHaveText("Complete");

  control.slowSynthesis = true;
  await actions.getByRole("button", { name: "Synthesis", exact: true }).click();
  await approveCost(page);
  await expect.poll(() => counts.synthesis).toBe(1);
  await actions.getByTestId("multi-ai-cancel").click();
  await expect(actions.getByRole("status").filter({ hasText: "Synthesis was cancelled" })).toBeVisible();
  await expect(branches.nth(1).getByRole("status")).toHaveText("Cancelled");

  await page.reload();
  await restoreIfOffered(page);
  const restored = page.getByTestId("conversation-area").getByTestId("multi-ai-run");
  await expect(restored).toHaveCount(2);
  await expect(restored.nth(0).getByRole("status")).toHaveText("Cancelled");
  await expect(restored.nth(1).getByRole("status")).toHaveText("Cancelled");
  await restored.nth(0).locator("summary").click();
  await expect(restored.nth(0)).toContainText(CLAUDE_TEXT);

  await page.locator(".leftnav-item").filter({ hasText: "Settings" }).click();
  await page.getByRole("button", { name: "Plan & credits", exact: true }).click();
  await expect(page.locator(".settings-item__label").filter({ hasText: "released" })).toHaveCount(2);
});
