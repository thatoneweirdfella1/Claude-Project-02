import { expect, test, type Page } from "@playwright/test";
import { CONSENSUS_SYSTEM_PROMPT } from "../src/services/multiAi/prompt";
import { installModelMocks } from "./mocks";

const QUESTION = "What practical plan should we build?";
const MARKERS = [
  "CLAUDE [anthropic · claude-sonnet-5]'S ANSWER:",
  "GPT-5.5 [openai · gpt-5.5]'S ANSWER:",
  "GEMINI 3.1 PRO [google · gemini-3.1-pro]'S ANSWER:",
  "GROK 4.3 [xai · grok-4.3]'S ANSWER:",
] as const;

async function installServices(page: Page, consensusInputs: string[]): Promise<void> {
  await installModelMocks(page, { answerText: "This test exercises only explicit Multi-AI actions." });
  await page.route("**/api/account", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, user: null }) });
  });
  await page.route("**/api/provider-status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ anthropic: true, openai: true, google: true, xai: true, deepseek: true }),
    });
  });
  await page.route("**/api/proxy-*", async (route) => {
    const body = route.request().postDataJSON() as { model: string };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ text: `${body.model} exact argument`, usage: { inputTokens: 42, outputTokens: 24 } }),
    });
  });
  page.on("request", (request) => {
    if (new URL(request.url()).pathname !== "/api/proxy") return;
    const body = request.postDataJSON() as { system?: string; messages?: Array<{ content?: string }> };
    const input = body.messages?.[0]?.content;
    if (body.system === CONSENSUS_SYSTEM_PROMPT && typeof input === "string") consensusInputs.push(input);
  });
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

function expectExactStableParticipants(input: string, expected: number): void {
  for (let index = 0; index < MARKERS.length; index += 1) {
    const marker = MARKERS[index];
    expect(input.split(marker)).toHaveLength(index < expected ? 2 : 1);
  }
  for (let index = 1; index < expected; index += 1) {
    expect(input.indexOf(MARKERS[index - 1])).toBeLessThan(input.indexOf(MARKERS[index]));
  }
}

test("R23: 2-, 3-, and 4-participant consensus inputs contain every exact route once in stable order", async ({ page }) => {
  test.setTimeout(75_000);
  const consensusInputs: string[] = [];
  await installServices(page, consensusInputs);
  await page.goto("/");
  await restoreIfOffered(page);
  await prepareFundedConversation(page);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const actions = page.getByTestId("multi-ai-actions-body");
  await actions.getByRole("button", { name: "Manual selection", exact: true }).click();
  const partnerLabels = ["GPT-5.5", "Gemini 3.1 Pro", "Grok 4.3"];

  for (let runIndex = 0; runIndex < partnerLabels.length; runIndex += 1) {
    await actions.getByRole("checkbox", { name: new RegExp(partnerLabels[runIndex]) }).click();
    await actions.getByRole("button", { name: runIndex === 0 ? "Start debate" : "Run debate again", exact: true }).click();
    await approveCost(page);
    await expect(actions.getByTestId("debate-view").getByRole("region")).toHaveCount(runIndex + 2);
    await actions.getByRole("button", { name: "Consensus", exact: true }).click();
    await approveCost(page);
    await expect(actions.getByTestId("consensus-view")).toBeVisible();
    await expect.poll(() => consensusInputs.length).toBe(runIndex + 1);
  }

  expectExactStableParticipants(consensusInputs[0], 2);
  expectExactStableParticipants(consensusInputs[1], 3);
  expectExactStableParticipants(consensusInputs[2], 4);
  await expect(page.getByTestId("conversation-area").getByTestId("multi-ai-run")).toHaveCount(3);
});
