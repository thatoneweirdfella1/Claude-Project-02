/* R10 URL Context verification — second-pass audit rewrite.
   - User can enter and preview URLs
   - URL preview shows content preview
   - User can confirm or cancel before adding
   - URLs appear in Context Snapshot after confirmation
   - Authentication failures show actionable message ("This page requires login...")
   - Private/unsafe URLs show actionable message ("This looks like a private or internal URL...")
   - Unsupported pages show actionable message ("This page doesn't have text content...")
   - Timeouts show actionable message ("That page took too long to load...")
   - Other errors show safe, friendly message ("Something went wrong loading that page...")
   - Changes persist through reload

   Second-pass fix: every interaction below is a genuine Playwright
   `.click()`/`.fill()` — no `.evaluate()`, `dispatchEvent()`, or
   `force:true`. The first-pass suite used `.evaluate(el => el.click())`
   on every single button, which does not exercise the browser's real
   hit-testing/pointer pipeline. That masked a genuine defect: the
   "Preview"/"Add to context" buttons were positioned ~12px past
   `col-center`'s `overflow:hidden` clip boundary and were unclickable by
   real mouse input at every viewport tested (confirmed with a real
   OS-level `page.mouse` click, not just Playwright's actionability
   check). Fixed in src/styles/composer.css (popover now right-anchored
   instead of left-anchored) and src/components/composer/
   AttachContextControls.tsx (the action buttons were also missing their
   intended CSS classes entirely — unstyled native buttons). */

import { test, expect, type Page } from "@playwright/test";
import { allowLocalAccess } from "./credit-helpers";

async function mockAccountUnconfigured(page: Page): Promise<void> {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false, user: null }),
    });
  });
}

async function afterReload(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  if (await restore.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await restore.click();
  }
  await page.waitForSelector("#root > *", { timeout: 15_000 });
}

async function openUrlForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Add Context/ }).click({ timeout: 10_000 });
  await page.getByRole("menuitem", { name: "URL" }).click({ timeout: 10_000 });
  await expect(page.locator("#attach-url-input")).toBeVisible({ timeout: 5_000 });
}

test.describe("R10 URL Context", () => {
  test.beforeEach(async ({ page }) => {
    await allowLocalAccess(page);
    await mockAccountUnconfigured(page);
    await page.goto("/");
    await afterReload(page);
    await expect(page.getByRole("button", { name: /Add Context/ })).toBeVisible({ timeout: 10_000 });
  });

  test("preview URL before adding to context", async ({ page }) => {
    await page.route("**/api/fetch-url", async (route) => {
      const body = route.request().postDataJSON();
      if (body.url === "https://example.com/article") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            url: "https://example.com/article",
            contentType: "text/html",
            content: "<html><body><main><h1>Article Title</h1><p>This is the article content that should be extracted.</p></main></body></html>",
          }),
        });
        return;
      }
      await route.continue();
    });

    await openUrlForm(page);
    await page.locator("#attach-url-input").fill("https://example.com/article");

    const previewButton = page.getByRole("button", { name: /^Preview$/ });
    await previewButton.click({ timeout: 10_000 });

    await expect(page.locator(".context-manager-preview")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(".context-manager-preview strong")).toContainText("https://example.com/article");
    await expect(page.locator(".context-manager-preview")).toContainText("This is the article content");

    const addButton = page.getByRole("button", { name: "Add to context" });
    await addButton.click({ timeout: 10_000 });

    await expect(page.getByTestId("attach-popover")).toBeHidden({ timeout: 5_000 });

    const contextPanel = page.locator(".accordion-panel").filter({ hasText: "Context Snapshot" });
    await contextPanel.locator("button.accordion-panel__header").click();

    await expect(page.locator(".context-snapshot-panel__row")).toContainText("https://example.com/article");
    await expect(page.locator(".context-snapshot-panel__row")).toContainText("Loaded from URL");
  });

  test("cancel URL preview without adding", async ({ page }) => {
    await page.route("**/api/fetch-url", async (route) => {
      const body = route.request().postDataJSON();
      if (body.url === "https://example.com/test") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            url: "https://example.com/test",
            contentType: "text/html",
            content: "<html><body><p>Test content</p></body></html>",
          }),
        });
        return;
      }
      await route.continue();
    });

    await openUrlForm(page);
    await page.locator("#attach-url-input").fill("https://example.com/test");
    await page.getByRole("button", { name: /^Preview$/ }).click({ timeout: 10_000 });

    await expect(page.locator(".context-manager-preview")).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "Back" }).click({ timeout: 10_000 });

    await expect(page.getByRole("menuitem", { name: "URL" })).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press("Escape");

    const contextPanel = page.locator(".accordion-panel").filter({ hasText: "Context Snapshot" });
    await contextPanel.locator("button.accordion-panel__header").click();

    expect(await page.locator(".context-snapshot-panel__row").count()).toBe(0);
  });

  test("shows actionable error message for authentication failure", async ({ page }) => {
    await page.route("**/api/fetch-url", async (route) => {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "The page responded with 401.", errorCode: "auth_required" }),
      });
    });

    await openUrlForm(page);
    await page.locator("#attach-url-input").fill("https://private.example.com/article");
    await page.getByRole("button", { name: /^Preview$/ }).click({ timeout: 10_000 });

    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toBeVisible({ timeout: 5_000 });
    await expect(errorMessage).toContainText("requires login");
    await expect(errorMessage).toContainText("publicly accessible link");
  });

  test("shows actionable error message for blocked/unsafe URL", async ({ page }) => {
    await page.route("**/api/fetch-url", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "That URL can't be fetched.", errorCode: "blocked_url" }),
      });
    });

    await openUrlForm(page);
    await page.locator("#attach-url-input").fill("http://192.168.1.1/internal-page");
    await page.getByRole("button", { name: /^Preview$/ }).click({ timeout: 10_000 });

    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toBeVisible({ timeout: 5_000 });
    await expect(errorMessage).toContainText("private or internal URL");
    await expect(errorMessage).toContainText("publicly accessible");
  });

  test("shows actionable error message for timeout", async ({ page }) => {
    await page.route("**/api/fetch-url", async (route) => {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "Fetching that page failed: The operation was aborted", errorCode: "timeout" }),
      });
    });

    await openUrlForm(page);
    await page.locator("#attach-url-input").fill("https://slow-example.com/article");
    await page.getByRole("button", { name: /^Preview$/ }).click({ timeout: 10_000 });

    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toBeVisible({ timeout: 5_000 });
    await expect(errorMessage).toContainText("took too long to load");
  });

  test("shows actionable error message for unsupported page (no text content)", async ({ page }) => {
    await page.route("**/api/fetch-url", async (route) => {
      const body = route.request().postDataJSON();
      if (body.url === "https://example.com/pdf") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            url: "https://example.com/pdf",
            contentType: "text/html",
            content: "<html><body><script>only script</script></body></html>",
          }),
        });
        return;
      }
      await route.continue();
    });

    await openUrlForm(page);
    await page.locator("#attach-url-input").fill("https://example.com/pdf");
    await page.getByRole("button", { name: /^Preview$/ }).click({ timeout: 10_000 });

    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toBeVisible({ timeout: 5_000 });
    await expect(errorMessage).toContainText("doesn't have text content");
    await expect(errorMessage).toContainText("PDFs and images");
  });

  test("shows actionable error message for generic errors", async ({ page }) => {
    await page.route("**/api/fetch-url", async (route) => {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "Fetching that page failed: network error", errorCode: "fetch_failed" }),
      });
    });

    await openUrlForm(page);
    await page.locator("#attach-url-input").fill("https://example.com/article");
    await page.getByRole("button", { name: /^Preview$/ }).click({ timeout: 10_000 });

    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toBeVisible({ timeout: 5_000 });
    await expect(errorMessage).toContainText("Couldn't reach that page");
  });

  test("persistence through reload", async ({ page }) => {
    await page.route("**/api/fetch-url", async (route) => {
      const body = route.request().postDataJSON();
      if (body.url === "https://example.com/persistent") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            url: "https://example.com/persistent",
            contentType: "text/html",
            content: "<html><body><p>Persistent URL content</p></body></html>",
          }),
        });
        return;
      }
      await route.continue();
    });

    await openUrlForm(page);
    await page.locator("#attach-url-input").fill("https://example.com/persistent");
    await page.getByRole("button", { name: /^Preview$/ }).click({ timeout: 10_000 });

    await expect(page.locator(".context-manager-preview")).toBeVisible({ timeout: 5_000 });
    await page.getByRole("button", { name: "Add to context" }).click({ timeout: 10_000 });

    await page.keyboard.press("Escape");

    const contextPanel = page.locator(".accordion-panel").filter({ hasText: "Context Snapshot" });
    const panelHeader = contextPanel.locator("button.accordion-panel__header");
    await panelHeader.click();

    await expect(page.locator(".context-snapshot-panel__row")).toContainText("https://example.com/persistent");

    await page.waitForTimeout(1_000);
    await page.reload();
    await afterReload(page);

    await panelHeader.click();

    await expect(page.locator(".context-snapshot-panel__row")).toContainText("https://example.com/persistent");
    await expect(page.locator(".context-snapshot-panel__row")).toContainText("Loaded from URL");
  });
});
