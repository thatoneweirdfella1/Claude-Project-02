import { expect, test, type Page } from "@playwright/test";
import { installModelMocks } from "./mocks";

const QUESTION = "What practical plan should we build?";

async function installLocalServices(page: Page): Promise<void> {
  await installModelMocks(page, { answerText: "This test uses only the explicit Multi-AI workflow." });
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false, user: null }),
    });
  });
  await page.route("**/api/provider-status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ anthropic: true, openai: true, google: false, xai: false, deepseek: false }),
    });
  });
}

async function restoreIfOffered(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  const app = page.locator("#root > *").first();
  await expect(restore.or(app)).toBeVisible();
  if (await restore.isVisible()) await restore.click();
  await expect(app).toBeVisible();
}

async function addManualHandoff(page: Page): Promise<void> {
  await page.getByLabel("What's on your mind?").fill(QUESTION);
  await page.locator(".translate-ask-button").click();
  await page.getByRole("dialog", { name: "State change suggested" })
    .getByRole("button", { name: "Accept & Continue", exact: true }).click();
  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await review.getByRole("button", { name: "Copy only", exact: true }).click();
  await expect(page.locator(".message-bubble--user").filter({ hasText: QUESTION })).toBeVisible();
}

async function fundBothLocalLedgers(page: Page): Promise<void> {
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

test("R21: debate, consensus, synthesis, attribution, status, and costs persist as a conversation branch", async ({ page }) => {
  test.setTimeout(60_000);
  await installLocalServices(page);
  await page.goto("/");
  await restoreIfOffered(page);
  await addManualHandoff(page);
  await fundBothLocalLedgers(page);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const actions = page.getByTestId("multi-ai-actions-body");
  await actions.getByRole("button", { name: "Start debate", exact: true }).click();
  await approveCost(page);

  await expect(actions.getByTestId("debate-view").getByRole("region")).toHaveCount(2);
  await expect(actions.getByTestId("debate-view")).toContainText("Claude");
  await expect(actions.getByTestId("debate-view")).toContainText("GPT-5.5");

  await actions.getByRole("button", { name: "Consensus", exact: true }).click();
  await approveCost(page);
  await expect(actions.getByTestId("consensus-view")).toContainText("Both agree water boils at 100°C");

  await actions.getByRole("button", { name: "Synthesis", exact: true }).click();
  await approveCost(page);
  await expect(actions.getByTestId("synthesis-view")).toContainText("Water boils at 100°C");

  const branch = page.getByTestId("conversation-area").getByTestId("multi-ai-run");
  await expect(branch).toHaveCount(1);
  await expect(branch.getByRole("status")).toHaveText("Complete");
  await branch.locator("summary").click();
  await expect(branch).toContainText("anthropic · claude-sonnet-5");
  await expect(branch).toContainText("openai · gpt-5.5");
  await expect(branch).toContainText("Estimated $");
  await expect(branch).toContainText("Actual $");
  await expect(branch).toContainText("Common ground:");
  await expect(branch).toContainText("Synthesis");

  await page.locator(".leftnav-item").filter({ hasText: "Settings" }).click();
  await page.locator(".leftnav-item").filter({ hasText: "Talk to AI" }).click();
  await expect(page.getByTestId("conversation-area").getByTestId("multi-ai-run")).toHaveCount(1);

  await page.reload();
  await restoreIfOffered(page);
  const restoredBranch = page.getByTestId("conversation-area").getByTestId("multi-ai-run");
  await expect(restoredBranch).toHaveCount(1);
  await expect(restoredBranch.getByRole("status")).toHaveText("Complete");
  await restoredBranch.locator("summary").click();
  await expect(restoredBranch).toContainText("anthropic · claude-sonnet-5");
  await expect(restoredBranch).toContainText("openai · gpt-5.5");
  await expect(restoredBranch).toContainText("Both agree water boils at 100°C");
  await expect(restoredBranch).toContainText("This refined answer merges both sides");
});
