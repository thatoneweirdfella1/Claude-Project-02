import { test, expect, type Page } from "./fixtures";
import { installModelMocks } from "./mocks";

const QUESTION = "so umm i was wondering, what temperature does water boil at? like at sea level i guess";

async function restoreLastWorkIfPrompted(page: Page) {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  if (await restore.isVisible({ timeout: 10_000 }).catch(() => false)) await restore.click();
}

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
  await review.getByRole("button", { name: "Copy only", exact: true }).click();

  await expect(page.locator(".message-bubble--user").first()).toContainText(QUESTION);
  const assistant = page.locator(".message-bubble--assistant").first();
  await expect(assistant).toContainText("REQUEST");
  await expect(assistant).toContainText("RESPONSE STYLE");
  await expect(assistant).toContainText("balanced tone");

  // A prepared handoff is not an answer, so it has no rating row (by design since
  // commit 2e46e95). Rate the real answer instead: import the destination AI's reply.
  await expect(assistant.getByRole("radiogroup", { name: "Rate this answer" })).toHaveCount(0);
  await page.getByRole("button", { name: "Import Response", exact: true }).click();
  const importDialog = page.getByRole("dialog", { name: "Import Response" });
  await importDialog.getByLabel("Source label").fill("ChatGPT");
  await importDialog.getByLabel("Pasted response").fill("Water boils at 100 degrees Celsius (212 F) at sea level.");
  await importDialog.getByRole("button", { name: "Confirm import", exact: true }).click();
  const imported = page.locator(".message-bubble--assistant").last();
  await expect(imported).toContainText("Water boils at 100 degrees Celsius");
  await imported.getByRole("radio", { name: "4 stars" }).click();
  await expect(imported.getByRole("radio", { name: "4 stars" })).toHaveAttribute("aria-checked", "true");

  await page.waitForTimeout(5_500);
  await page.reload();
  await restoreLastWorkIfPrompted(page);
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
  await restoreLastWorkIfPrompted(page);
  await expect(page.getByLabel("What's on your mind?")).toHaveValue("this draft should survive a reload even though I never submit it", { timeout: 10_000 });
});
