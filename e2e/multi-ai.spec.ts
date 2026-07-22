import { test, expect } from "@playwright/test";
import { installModelMocks } from "./mocks";

/* e2e/multi-ai.spec.ts (Step 12.2) — Feature 9 (Debate/Consensus/Synthesis,
   Step 8.3/8.4), the app's core differentiator per this step's explicit
   instruction. Runs the real composer -> pipeline flow first (CANON frames
   all three Multi-AI actions as "after an answer"), then drives the real
   MultiAiActions component through Debate -> Consensus -> Synthesis with
   manual partner selection (deterministic — avoids depending on
   autoSelectPartners' heuristic scoring for this specific question).
   Every model call, including the partner's own /api/proxy-openai call, is
   mocked at the network boundary (mocks.ts) — the debate/consensus/synthesis
   client code, DebateView/ConsensusView/SynthesisView rendering, and the
   phase/enablement state machine (Consensus/Synthesis disabled until a
   complete transcript exists) are all exercised for real. */

// Same fixture topic as core-flow.spec.ts's translation/detection mocks —
// mocks.ts's canned replies are topic-fixed (boiling point), not derived
// from the actual input, so every test in this suite uses this question to
// keep what's asked and what's mocked-back coherent.
const QUESTION = "so umm i was wondering, what temperature does water boil at? like at sea level i guess";
const ANSWER_TEXT =
  "Water boils at 100 degrees Celsius, which is 212 degrees Fahrenheit, at sea level under standard atmospheric pressure.";

async function askAndAnswer(page: import("@playwright/test").Page): Promise<void> {
  await page.getByLabel("What's on your mind?").fill(QUESTION);
  await page.getByRole("button", { name: /TRANSLATE.*ASK/i }).click();
  await expect(page.locator(".message-bubble--assistant").first()).toBeVisible({ timeout: 10_000 });
}

test("multi-AI: debate, then consensus, then synthesis", async ({ page }) => {
  await installModelMocks(page, { answerText: ANSWER_TEXT });
  await page.goto("/");
  await askAndAnswer(page);

  // Expand MULTI-AI ACTIONS.
  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const body = page.locator('[data-testid="multi-ai-actions-body"]');
  await expect(body).toBeVisible();

  // Switch to manual selection (deterministic — avoids depending on the
  // auto-select heuristic for this specific question) and pick GPT-5.5 only.
  await body.getByRole("button", { name: "Manual selection" }).click();
  const partnerPicker = page.locator('[data-testid="partner-picker"]');
  await expect(partnerPicker).toBeVisible();
  await partnerPicker.getByRole("checkbox", { name: /GPT-5\.5/ }).check();

  // Start the debate.
  await body.getByRole("button", { name: "Start debate" }).click();

  const debateView = page.locator('[data-testid="debate-view"]');
  await expect(debateView).toBeVisible({ timeout: 10_000 });

  const claudeColumn = debateView.locator('section[aria-label^="Claude"]');
  await expect(claudeColumn).toContainText("boils at 100");
  const partnerColumn = debateView.locator('section[aria-label^="GPT-5.5"]');
  await expect(partnerColumn).toContainText("From GPT-5.5");

  // Consensus becomes available only once a complete transcript exists.
  const consensusButton = body.getByRole("button", { name: "Consensus" });
  await expect(consensusButton).toBeEnabled();
  await consensusButton.click();

  const consensusView = page.locator('[data-testid="consensus-view"]');
  await expect(consensusView).toBeVisible({ timeout: 10_000 });
  await expect(consensusView).toContainText("100°C");

  // Synthesis reads the same transcript, independent of Consensus having run.
  const synthesisButton = body.getByRole("button", { name: "Synthesis" });
  await expect(synthesisButton).toBeEnabled();
  await synthesisButton.click();

  const synthesisView = page.locator('[data-testid="synthesis-view"]');
  await expect(synthesisView).toBeVisible({ timeout: 10_000 });
  await expect(synthesisView).toContainText("refined answer");
});

test("multi-AI: Consensus and Synthesis are disabled before a debate completes", async ({ page }) => {
  await installModelMocks(page, { answerText: ANSWER_TEXT });
  await page.goto("/");
  await askAndAnswer(page);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const body = page.locator('[data-testid="multi-ai-actions-body"]');
  await expect(body).toBeVisible();

  await expect(body.getByRole("button", { name: "Consensus" })).toBeDisabled();
  await expect(body.getByRole("button", { name: "Synthesis" })).toBeDisabled();
});
