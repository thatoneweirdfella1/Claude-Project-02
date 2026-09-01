import { expect, test, type Page } from "@playwright/test";
import { installModelMocks } from "./mocks";

const FIRST_QUESTION = "Explain the unresolved architecture tradeoff.";
const SECOND_QUESTION = "What evidence would settle the tradeoff?";

async function installLocalAccount(page: Page): Promise<void> {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false, user: null }),
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

async function addManualHandoff(page: Page, question: string): Promise<void> {
  await page.getByLabel("What's on your mind?").fill(question);
  await page.locator(".translate-ask-button").click();
  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await expect(review).toBeVisible();
  await review.getByRole("button", { name: "Copy only", exact: true }).click();
  await expect(page.locator(".message-bubble--user").filter({ hasText: question })).toBeVisible();
}

test("R20: select a complete conversation range, review it, and persist a zero-cost source handoff", async ({ page }) => {
  test.setTimeout(45_000);
  let providerRequests = 0;
  page.on("request", (request) => {
    if (/\/api\/proxy(?:-|$)/.test(new URL(request.url()).pathname)) providerRequests += 1;
  });
  await installModelMocks(page, { answerText: "No connected answer is used by this local handoff test." });
  await installLocalAccount(page);

  await page.goto("/");
  await restoreIfOffered(page);
  await addManualHandoff(page, FIRST_QUESTION);
  await addManualHandoff(page, SECOND_QUESTION);

  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  const actions = page.getByTestId("multi-ai-actions-body");
  await actions.getByRole("button", { name: /Select conversation source/ }).click();

  const firstBoundary = actions.getByRole("checkbox", { name: `Select range boundary: ${FIRST_QUESTION}` });
  const secondBoundary = actions.getByRole("checkbox", { name: `Select range boundary: ${SECOND_QUESTION}` });
  await firstBoundary.click();
  await secondBoundary.click();

  const checkboxes = actions.getByRole("group", { name: "Select messages for Multi-AI" }).getByRole("checkbox");
  await expect(checkboxes).toHaveCount(4);
  await expect(checkboxes.nth(1)).toBeChecked();
  await expect(checkboxes.nth(2)).toBeChecked();
  await expect(actions.getByText("Review context bundle (3 messages)", { exact: true })).toBeVisible();

  const bundle = actions.getByTestId("multi-ai-context-bundle");
  await expect(bundle).toContainText(`You: ${FIRST_QUESTION}`);
  await expect(bundle).toContainText("Any AI — Universal: AI-ready request handed off to Any AI — Universal");
  await expect(bundle).toContainText(`You: ${SECOND_QUESTION}`);

  await actions.getByRole("button", { name: "Prepare source handoff", exact: true }).click();
  await expect(actions.getByRole("status").filter({ hasText: "No provider request was sent" })).toContainText("no credits were used");
  await expect(page.getByTestId("conversation-area").getByTestId("multi-ai-run").getByRole("status")).toHaveText("Local preparation");
  expect(providerRequests).toBe(0);

  await page.reload();
  await restoreIfOffered(page);
  const restoredRun = page.getByTestId("conversation-area").getByTestId("multi-ai-run");
  await expect(restoredRun.getByRole("status")).toHaveText("Local preparation");
  await restoredRun.locator("summary").click();
  await expect(restoredRun).toContainText("Persisted source handoff · no provider request sent");
  await expect(restoredRun).toContainText(FIRST_QUESTION);
  await expect(restoredRun).toContainText(SECOND_QUESTION);
  await expect(restoredRun).toContainText("No Divergence credits");
  expect(providerRequests).toBe(0);
});
