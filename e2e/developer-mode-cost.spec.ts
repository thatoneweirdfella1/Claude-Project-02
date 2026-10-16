import { test, expect, type Page } from "./fixtures";
import { installModelMocks } from "./mocks";
import { enableDeveloperMode } from "./credit-helpers";

/* Developer Mode must never skip the cost check. A paid (connected) send in
   Developer Mode has to show the "Confirm AI Cost" dialog, and nothing may
   reach /api/proxy before the person approves it. */

const QUESTION = "what temperature does water boil at, at sea level";
const ANSWER = "Water boils at 100 degrees Celsius, which is 212 degrees Fahrenheit, at sea level.";

async function restoreLastWorkIfPrompted(page: Page) {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  if (await restore.isVisible({ timeout: 2_000 }).catch(() => false)) await restore.click();
}

async function connectedClaudeConfigured(page: Page) {
  await page.route("**/api/provider-status", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ anthropic: true, openai: false, google: false, xai: false, deepseek: false }),
    }),
  );
}

async function chooseConnectedTranslator(page: Page) {
  await page.getByRole("button", { name: "Show Advanced Controls" }).click();
  await page.locator(".advanced-controls__field", { hasText: "Translator Engine" }).locator("select").selectOption("managed-translator");
  await page.getByRole("button", { name: /Advanced Controls/ }).first().click();
}

function watchProxyCalls(page: Page): string[] {
  const calls: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/proxy")) calls.push(request.url());
  });
  return calls;
}

test("Developer Mode still shows the cost check before a paid send, and cancelling sends nothing", async ({ page }) => {
  await connectedClaudeConfigured(page);
  await installModelMocks(page, { answerText: ANSWER });
  const proxyCalls = watchProxyCalls(page);
  await page.goto("/");
  await restoreLastWorkIfPrompted(page);
  await enableDeveloperMode(page);
  await chooseConnectedTranslator(page);

  await page.getByLabel("What's on your mind?").fill(QUESTION);
  await page.locator(".translate-ask-button").click();
  const dialog = page.getByRole("dialog", { name: "Confirm AI Cost" });
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  expect(proxyCalls).toHaveLength(0);

  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.waitForTimeout(1_000);
  expect(proxyCalls).toHaveLength(0);
});

test("Developer Mode: when the money check refuses an approved charge, nothing is sent and the draft stays", async ({ page }) => {
  await connectedClaudeConfigured(page);
  await installModelMocks(page, { answerText: ANSWER });
  const proxyCalls = watchProxyCalls(page);
  await page.goto("/");
  await restoreLastWorkIfPrompted(page);
  await enableDeveloperMode(page);
  await chooseConnectedTranslator(page);

  await page.getByLabel("What's on your mind?").fill(QUESTION);
  await page.locator(".translate-ask-button").click();

  const dialog = page.getByRole("dialog", { name: "Confirm AI Cost" });
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  await dialog.getByRole("button", { name: /^Continue for up to/ }).click();

  // The developer workspace has no funded balance in the money ledger yet, so the
  // reservation is refused. Run 2 (money) decides how Developer Mode tests are paid for.
  await expect(page.getByText("Not sent. Your draft is still here.")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByLabel("What's on your mind?")).toHaveValue(QUESTION);
  await page.waitForTimeout(1_000);
  expect(proxyCalls).toHaveLength(0);
});
