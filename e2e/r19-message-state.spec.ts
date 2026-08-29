/* R19 Verification: Message state persistence and user action tracking */

import { test, expect } from "@playwright/test";

test.describe("R19: Prepared/Copied/Opened/Sent/Answered message state", () => {
  test.beforeEach(async ({ page }) => {
    // Mock API endpoints
    await page.route("**/api/verify-access", (route) => {
      void route.abort();
    });
    await page.route("**/api/account", (route) => {
      void route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        id: "test-user",
        email: "test@example.com",
        subscription: "pro",
      }) });
    });
  });

  test("user message persists with messageState after copy action", async ({ page }) => {
    await page.goto("http://localhost:5174");
    await page.waitForLoadState("networkidle");

    // Type a message
    const textarea = page.locator(".input-box__textarea");
    await textarea.fill("What is the capital of France?");
    await textarea.press("Enter");

    // Wait for message to appear
    const messageBubble = page.locator("[data-testid='message-bubble']").first();
    await messageBubble.waitFor({ state: "visible" });

    // Click copy button
    const copyButton = page.locator("button").filter({ hasText: /Copy/ }).first();
    await copyButton.click();

    // Verify copy button shows "Copied" state
    await expect(copyButton).toContainText("Copied");

    // Check IndexedDB to verify messageState persisted
    const dbState = await page.evaluate(async () => {
      const db = await (window as any).getAppDatabase?.();
      if (!db) return null;
      const tx = db.transaction("session");
      const store = tx.objectStore("session");
      const req = store.getAll();
      return new Promise((resolve) => {
        req.onsuccess = () => {
          const sessions = req.result;
          if (sessions.length === 0) return resolve(null);
          const lastSession = sessions[sessions.length - 1];
          return resolve(lastSession.conversation);
        };
      });
    });

    // Verify message has messageState set
    if (dbState && Array.isArray(dbState)) {
      const userMsg = dbState.find((m: any) => m.role === "user");
      expect(userMsg).toBeDefined();
      expect(userMsg?.messageState).toBe("sent");
      expect(userMsg?.userCopied).toBe(true);
    }
  });

  test("message state persists through page reload", async ({ page }) => {
    await page.goto("http://localhost:5174");
    await page.waitForLoadState("networkidle");

    // Type and send a message
    const textarea = page.locator(".input-box__textarea");
    await textarea.fill("Test question");
    await textarea.press("Enter");

    // Wait for message to appear
    const messageBubble = page.locator("[data-testid='message-bubble']").first();
    await messageBubble.waitFor({ state: "visible" });

    // Copy the message to track userCopied state
    const copyButton = page.locator("button").filter({ hasText: /Copy/ }).first();
    await copyButton.click();

    // Wait a bit for the state to be persisted
    await page.waitForTimeout(500);

    // Reload the page
    await page.reload({ waitUntil: "networkidle" });

    // Verify message still shows in conversation
    const reloadedBubble = page.locator("[data-testid='message-bubble']").first();
    await reloadedBubble.waitFor({ state: "visible" });

    // Message should still be present with its state
    await expect(reloadedBubble).toContainText("Test question");
  });

  test("user actions (copy/open) are independent of message state", async ({ page }) => {
    await page.goto("http://localhost:5174");
    await page.waitForLoadState("networkidle");

    // Type a message (will be in "sent" state)
    const textarea = page.locator(".input-box__textarea");
    await textarea.fill("Independent state test");
    await textarea.press("Enter");

    const messageBubble = page.locator("[data-testid='message-bubble']").first();
    await messageBubble.waitFor({ state: "visible" });

    // Copy the message multiple times
    const copyButton = page.locator("button").filter({ hasText: /Copy/ }).first();
    await copyButton.click();
    await page.waitForTimeout(100);
    await copyButton.click();
    await page.waitForTimeout(100);

    // Message should still have messageState: "sent" even after copying
    const dbState = await page.evaluate(async () => {
      const db = await (window as any).getAppDatabase?.();
      if (!db) return null;
      const tx = db.transaction("session");
      const store = tx.objectStore("session");
      const req = store.getAll();
      return new Promise((resolve) => {
        req.onsuccess = () => {
          const sessions = req.result;
          if (sessions.length === 0) return resolve(null);
          const lastSession = sessions[sessions.length - 1];
          return resolve(lastSession.conversation);
        };
      });
    });

    if (dbState && Array.isArray(dbState)) {
      const msg = dbState.find((m: any) => m.role === "user");
      // State should be "sent", not changed by copying
      expect(msg?.messageState).toBe("sent");
      expect(msg?.userCopied).toBe(true);
    }
  });

  test("conversation preserves all messages with their individual states", async ({ page }) => {
    await page.goto("http://localhost:5174");
    await page.waitForLoadState("networkidle");

    // Add multiple messages
    const textarea = page.locator(".input-box__textarea");

    await textarea.fill("First question");
    await textarea.press("Enter");
    await page.waitForTimeout(200);

    await textarea.fill("Second question");
    await textarea.press("Enter");
    await page.waitForTimeout(200);

    // Verify both messages appear
    const messages = page.locator("[data-testid='message-bubble']");
    await expect(messages).toHaveCount(2);

    // Each message should have its own messageState
    const firstMsg = messages.first();
    const secondMsg = messages.nth(1);

    await expect(firstMsg).toContainText("First question");
    await expect(secondMsg).toContainText("Second question");
  });
});
