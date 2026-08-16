import { test, expect } from "@playwright/test";
import { installModelMocks } from "./mocks";

const QUESTION = "so umm i was wondering, what temperature does water boil at? like at sea level i guess";
const ANSWER_TEXT =
  "Water boils at 100 degrees Celsius, which is 212 degrees Fahrenheit, at sea level under standard atmospheric pressure.";

async function askAndAnswer(page: import("@playwright/test").Page): Promise<void> {
  await page.getByLabel("What's on your mind?").fill(QUESTION);
  await page.locator(".translate-ask-button").click();
  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await review.getByRole("button", { name: /Copy-ready · Continue/ }).click();
  await expect(page.locator(".message-bubble--assistant").first()).toBeVisible({ timeout: 10_000 });
}

test("multi-AI: paid routes stay visibly disabled on the free-first route", async ({ page }) => {
  await installModelMocks(page, { answerText: ANSWER_TEXT });
  await page.goto("/");
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
  await page.goto("/");
  await askAndAnswer(page);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const body = page.locator('[data-testid="multi-ai-actions-body"]');
  await expect(body).toBeVisible();

  await expect(body.getByRole("button", { name: "Consensus" })).toBeDisabled();
  await expect(body.getByRole("button", { name: "Synthesis" })).toBeDisabled();
});
