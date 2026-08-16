import { test, expect } from "@playwright/test";
import { installModelMocks } from "./mocks";

const QUESTION = "so umm i was wondering, what temperature does water boil at? like at sea level i guess";

test("core free-first flow: type, review, continue, rate, autosave restore", async ({ page }) => {
  await installModelMocks(page, { answerText: "unused on local route" });
  await page.goto("/");

  const input = page.getByLabel("What's on your mind?");
  await input.fill(QUESTION);
  await page.locator(".translate-ask-button").click();

  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await expect(review).toBeVisible();
  await expect(review.getByText(/No Divergence credits/)).toBeVisible();
  await expect(review.locator("textarea")).toContainText(QUESTION);
  await review.getByRole("button", { name: /Copy-ready · Continue/ }).click();

  await expect(page.locator(".message-bubble--user").first()).toContainText(QUESTION);
  const assistant = page.locator(".message-bubble--assistant").first();
  await expect(assistant).toContainText("REQUEST");
  await expect(assistant).toContainText("RESPONSE STYLE");
  await expect(assistant).toContainText("balanced tone");

  await assistant.getByRole("radio", { name: "4 stars" }).click();
  await expect(assistant.getByRole("radio", { name: "4 stars" })).toHaveAttribute("aria-checked", "true");

  await page.waitForTimeout(5_500);
  await page.reload();
  await expect(page.locator(".message-bubble--user").first()).toContainText(QUESTION, { timeout: 10_000 });
  await expect(page.locator(".message-bubble--assistant").first()).toContainText("No Divergence credits");
});

test("core flow: draft input survives a reload before submitting", async ({ page }) => {
  await installModelMocks(page, { answerText: "unused" });
  await page.goto("/");
  const input = page.getByLabel("What's on your mind?");
  await input.fill("this draft should survive a reload even though I never submit it");
  await page.waitForTimeout(5_500);
  await page.reload();
  await expect(page.getByLabel("What's on your mind?")).toHaveValue("this draft should survive a reload even though I never submit it", { timeout: 10_000 });
});
