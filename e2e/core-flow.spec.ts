import { test, expect } from "@playwright/test";
import { installModelMocks } from "./mocks";
import { clickWithCostConfirmation, enableDeveloperMode } from "./credit-helpers";

/* e2e/core-flow.spec.ts (Step 12.2) — SPOT CHECK: the core flow named by this
   step's own text, verbatim: "type a question, hit TRANSLATE & ASK, see
   pills, get a streamed answer, rate it, confirm autosave restores after
   reload." Every model call is mocked at the network boundary (see mocks.ts)
   — this exercises the REAL composer, pipeline orchestrator, streaming
   parser, detection panel, rating store action, and IndexedDB persistence;
   only model inference itself is stubbed.

   Once a run finishes, CenterColumn.handleDone pushes the assistant message
   into session.conversation and clears the transient run/display state in
   the same callback (setRun(null)) — the "streamed answer" UI (StreamingAnswer,
   data-testid="streaming-answer-done") unmounts at that point and
   ConversationArea's persisted MessageBubble (.message-bubble--assistant)
   takes over rendering, rating included. Assertions below target that
   persisted bubble, not the transient one, since the transient one is not
   guaranteed to still be mounted by the time an assertion settles. */

const QUESTION = "so umm i was wondering, what temperature does water boil at? like at sea level i guess";
const ANSWER_TEXT =
  "Water boils at 100 degrees Celsius, which is 212 degrees Fahrenheit, at sea level under standard atmospheric pressure.";

test("core flow: type, translate & ask, pills, streamed answer, rate, autosave restore", async ({ page }) => {
  await installModelMocks(page, { answerText: ANSWER_TEXT });
  await page.goto("/");
  await enableDeveloperMode(page);

  const input = page.getByLabel("What's on your mind?");
  await expect(input).toBeVisible();
  await input.fill(QUESTION);

  await clickWithCostConfirmation(
    page,
    page.locator(".translate-ask-button"),
  );

  // The user's raw message lands in the conversation immediately.
  await expect(page.locator(".message-bubble--user").first()).toContainText(QUESTION);

  // Translation gate: proceed (mocked confidence 95) shows the translated prompt.
  const translationCard = page.locator('[data-testid="translation-card"]');
  await expect(translationCard).toBeVisible();
  await expect(translationCard).toContainText("What is the boiling point of water at sea level?");

  // State pills: all four dimensions from the mocked detection reply.
  await expect(page.locator('[data-testid="state-detection-panel"]')).toBeVisible();
  await expect(page.locator('[data-testid="state-pill-emotion"]')).toContainText(/calm/i);
  await expect(page.locator('[data-testid="state-pill-rsd"]')).toContainText(/low/i);
  await expect(page.locator('[data-testid="state-pill-interest"]')).toContainText(/high/i);
  await expect(page.locator('[data-testid="state-pill-cognitive"]')).toContainText(/analytical/i);

  // Streamed answer: once finished, it's the persisted assistant bubble.
  const assistantBubble = page.locator(".message-bubble--assistant").first();
  await expect(assistantBubble).toBeVisible({ timeout: 10_000 });
  await expect(assistantBubble).toContainText("Water boils at 100 degrees Celsius");

  // Rate it: 4 stars.
  await assistantBubble.getByRole("radio", { name: "4 stars" }).click();
  await expect(assistantBubble.getByRole("radio", { name: "4 stars" })).toHaveAttribute("aria-checked", "true");

  // Autosave restore: CANON's autosave interval is 5s (persistence.ts,
  // AUTOSAVE_INTERVAL_MS) — wait for at least one real tick rather than
  // relying solely on the pagehide flush's fire-and-forget race with
  // navigation, then reload and confirm the conversation + rating survive.
  await page.waitForTimeout(5_500);
  await page.reload();

  await expect(page.locator(".message-bubble--user").first()).toContainText(QUESTION, { timeout: 10_000 });
  const assistantBubbleAfterReload = page.locator(".message-bubble--assistant").first();
  await expect(assistantBubbleAfterReload).toContainText("Water boils at 100 degrees Celsius");
  await expect(assistantBubbleAfterReload.getByRole("radio", { name: "4 stars" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("core flow: draft input survives a reload before submitting", async ({ page }) => {
  await installModelMocks(page, { answerText: ANSWER_TEXT });
  await page.goto("/");

  const input = page.getByLabel("What's on your mind?");
  await input.fill("this draft should survive a reload even though I never submit it");

  await page.waitForTimeout(5_500);
  await page.reload();

  await expect(page.getByLabel("What's on your mind?")).toHaveValue(
    "this draft should survive a reload even though I never submit it",
    { timeout: 10_000 },
  );
});
