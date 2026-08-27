/* R10 URL Context verification
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
 */

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

test.describe("R10 URL Context", () => {
  test.beforeEach(async ({ page }) => {
    await allowLocalAccess(page);
    await mockAccountUnconfigured(page);
    await page.goto("/");
    await page.waitForSelector("#root > *", { timeout: 15_000 });
    // Wait for Add Context button to be visible
    await page.waitForSelector("button:has-text('Add Context')");
  });

  test("preview URL before adding to context", async ({ page }) => {
    // Mock the /api/fetch-url endpoint to return a successful response
    await page.route("**/api/fetch-url", async (route) => {
      if (route.request().method() === "POST") {
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
      }
      await route.continue();
    });

    // Open Add Context menu
    const addContextButton = page.locator("button:has-text('Add Context')");
    await addContextButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Click URL option
    await page.click("text=URL");

    // Enter URL
    const urlInput = page.locator("#attach-url-input");
    await urlInput.fill("https://example.com/article");

    // Click Preview (using evaluate to work around pointer-event interception)
    const previewButton = page.locator(".attach-context-controls__url-actions button[type='submit']");
    await previewButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Wait for preview to load
    await page.waitForSelector(".context-manager-preview");

    // Verify preview shows content
    await expect(page.locator(".context-manager-preview strong")).toContainText("https://example.com/article");
    await expect(page.locator(".context-manager-preview")).toContainText("This is the article content");

    // Click "Add to context" button
    const addButton = page.locator(".context-manager-preview button:has-text('Add to context')");
    await addButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Verify it closes and goes back to menu
    await page.waitForSelector(".attach-context-controls__popover-row");

    // Close popover
    await page.keyboard.press("Escape");

    // Expand Context Snapshot to verify it was added
    const contextPanel = page.locator(".accordion-panel").filter({ hasText: "Context Snapshot" });
    const panelHeader = contextPanel.locator("button.accordion-panel__header");
    await panelHeader.click();

    // Check that URL appears in context snapshot
    await expect(page.locator(".context-snapshot-panel__row")).toContainText("https://example.com/article");
    await expect(page.locator(".context-snapshot-panel__row")).toContainText("Loaded from URL");
  });

  test("cancel URL preview without adding", async ({ page }) => {
    // Mock the /api/fetch-url endpoint
    await page.route("**/api/fetch-url", async (route) => {
      if (route.request().method() === "POST") {
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
      }
      await route.continue();
    });

    // Open Add Context menu
    const addContextButton = page.locator("button:has-text('Add Context')");
    await addContextButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Click URL option
    await page.click("text=URL");

    // Enter URL
    const urlInput = page.locator("#attach-url-input");
    await urlInput.fill("https://example.com/test");

    // Click Preview (using evaluate to work around pointer-event interception)
    const previewButton = page.locator(".attach-context-controls__url-actions button[type='submit']");
    await previewButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Wait for preview to load
    await page.waitForSelector(".context-manager-preview");

    // Click Back button without adding (using evaluate to work around pointer-event interception)
    const backButton = page.locator(".attach-context-controls__url-actions button:has-text('Back')");
    await backButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Should be back at URL form (not menu)
    await expect(page.locator("#attach-url-input")).toBeVisible();

    // Close popover
    await page.keyboard.press("Escape");

    // Expand Context Snapshot to verify nothing was added
    const contextPanel = page.locator(".accordion-panel").filter({ hasText: "Context Snapshot" });
    const panelHeader = contextPanel.locator("button.accordion-panel__header");
    await panelHeader.click();

    // Context should be empty or not contain the URL
    const rows = page.locator(".context-snapshot-panel__row");
    const rowCount = await rows.count();
    expect(rowCount).toBe(0);
  });

  test("shows actionable error message for authentication failure", async ({ page }) => {
    // Mock /api/fetch-url to return 401
    await page.route("**/api/fetch-url", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({
            error: "The page responded with 401.",
            errorCode: "auth_required",
          }),
        });
        return;
      }
      await route.continue();
    });

    // Open Add Context menu
    const addContextButton = page.locator("button:has-text('Add Context')");
    await addContextButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Click URL option
    await page.click("text=URL");

    // Enter URL
    const urlInput = page.locator("#attach-url-input");
    await urlInput.fill("https://private.example.com/article");

    // Click Preview (using evaluate to work around pointer-event interception)
    const previewButton = page.locator(".attach-context-controls__url-actions button[type='submit']");
    await previewButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Wait for error message
    await page.waitForSelector("[role='alert']");

    // Verify error message is actionable (not "401 error")
    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toContainText("requires login");
    await expect(errorMessage).toContainText("publicly accessible link");
  });

  test("shows actionable error message for blocked/unsafe URL", async ({ page }) => {
    // Mock /api/fetch-url to return blocked_url error
    await page.route("**/api/fetch-url", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: "That URL can't be fetched.",
            errorCode: "blocked_url",
          }),
        });
        return;
      }
      await route.continue();
    });

    // Open Add Context menu
    const addContextButton = page.locator("button:has-text('Add Context')");
    await addContextButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Click URL option
    await page.click("text=URL");

    // Enter URL (this would be a private IP in real life, but we're just testing error message)
    const urlInput = page.locator("#attach-url-input");
    await urlInput.fill("http://192.168.1.1/internal-page");

    // Click Preview (using evaluate to work around pointer-event interception)
    const previewButton = page.locator(".attach-context-controls__url-actions button[type='submit']");
    await previewButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Wait for error message
    await page.waitForSelector("[role='alert']");

    // Verify error message mentions private/internal URL
    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toContainText("private or internal URL");
    await expect(errorMessage).toContainText("publicly accessible");
  });

  test("shows actionable error message for timeout", async ({ page }) => {
    // Mock /api/fetch-url to return timeout error
    await page.route("**/api/fetch-url", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Fetching that page failed: The operation was aborted",
            errorCode: "timeout",
          }),
        });
        return;
      }
      await route.continue();
    });

    // Open Add Context menu
    const addContextButton = page.locator("button:has-text('Add Context')");
    await addContextButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Click URL option
    await page.click("text=URL");

    // Enter URL
    const urlInput = page.locator("#attach-url-input");
    await urlInput.fill("https://slow-example.com/article");

    // Click Preview (using evaluate to work around pointer-event interception)
    const previewButton = page.locator(".attach-context-controls__url-actions button[type='submit']");
    await previewButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Wait for error message
    await page.waitForSelector("[role='alert']");

    // Verify error message mentions timeout
    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toContainText("took too long to load");
  });

  test("shows actionable error message for unsupported page (no text content)", async ({ page }) => {
    // Mock /api/fetch-url to return a page with no readable text
    await page.route("**/api/fetch-url", async (route) => {
      if (route.request().method() === "POST") {
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
      }
      await route.continue();
    });

    // Open Add Context menu
    const addContextButton = page.locator("button:has-text('Add Context')");
    await addContextButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Click URL option
    await page.click("text=URL");

    // Enter URL
    const urlInput = page.locator("#attach-url-input");
    await urlInput.fill("https://example.com/pdf");

    // Click Preview (using evaluate to work around pointer-event interception)
    const previewButton = page.locator(".attach-context-controls__url-actions button[type='submit']");
    await previewButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Wait for error message
    await page.waitForSelector("[role='alert']");

    // Verify error message mentions no text content
    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toContainText("doesn't have text content");
    await expect(errorMessage).toContainText("PDFs and images");
  });

  test("shows actionable error message for generic errors", async ({ page }) => {
    // Mock /api/fetch-url to return a generic error
    await page.route("**/api/fetch-url", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Fetching that page failed: network error",
            errorCode: "fetch_failed",
          }),
        });
        return;
      }
      await route.continue();
    });

    // Open Add Context menu
    const addContextButton = page.locator("button:has-text('Add Context')");
    await addContextButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Click URL option
    await page.click("text=URL");

    // Enter URL
    const urlInput = page.locator("#attach-url-input");
    await urlInput.fill("https://example.com/article");

    // Click Preview (using evaluate to work around pointer-event interception)
    const previewButton = page.locator(".attach-context-controls__url-actions button[type='submit']");
    await previewButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Wait for error message
    await page.waitForSelector("[role='alert']");

    // Verify error message is friendly and doesn't blame user
    const errorMessage = page.locator("[role='alert']");
    await expect(errorMessage).toContainText("Couldn't reach that page");
  });

  test("persistence through reload", async ({ page }) => {
    // Mock the /api/fetch-url endpoint
    await page.route("**/api/fetch-url", async (route) => {
      if (route.request().method() === "POST") {
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
      }
      await route.continue();
    });

    // Open Add Context menu
    const addContextButton = page.locator("button:has-text('Add Context')");
    await addContextButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Click URL option
    await page.click("text=URL");

    // Enter URL
    const urlInput = page.locator("#attach-url-input");
    await urlInput.fill("https://example.com/persistent");

    // Click Preview (using evaluate to work around pointer-event interception)
    const previewButton = page.locator(".attach-context-controls__url-actions button[type='submit']");
    await previewButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Wait for preview
    await page.waitForSelector(".context-manager-preview");

    // Add to context
    const addButton = page.locator(".context-manager-preview button:has-text('Add to context')");
    await addButton.evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
    });

    // Close popover
    await page.keyboard.press("Escape");

    // Expand Context Snapshot to verify it was added
    const contextPanel = page.locator(".accordion-panel").filter({ hasText: "Context Snapshot" });
    const panelHeader = contextPanel.locator("button.accordion-panel__header");
    await panelHeader.click();

    // Verify URL is there
    await expect(page.locator(".context-snapshot-panel__row")).toContainText("https://example.com/persistent");

    // Wait a bit for autosave
    await page.waitForTimeout(1_000);

    // Reload the page
    await page.reload();
    await afterReload(page);

    // Expand the Context Snapshot panel again after reload
    await panelHeader.click();

    // Check that the URL is still there
    await expect(page.locator(".context-snapshot-panel__row")).toContainText("https://example.com/persistent");
    await expect(page.locator(".context-snapshot-panel__row")).toContainText("Loaded from URL");
  });
});
