/* R19 Verification: Message state persistence and user action tracking */

import { test, expect, type Page } from "./fixtures";
import type { ConversationMessage } from "../src/stores/types";
import { installModelMocks } from "./mocks";

// persistence.ts saves the session record under state/session in this database.
// Missing data must fail the polling assertion below, never skip an assertion.
async function readSavedConversation(page: Page): Promise<ConversationMessage[] | null> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("divergence-ai", 1);
      request.onupgradeneeded = () => {
        request.transaction?.abort();
        reject(new Error("The application's persisted database is missing"));
      };
      request.onerror = () => reject(request.error ?? new Error("Cannot open the persisted database"));
      request.onsuccess = () => resolve(request.result);
    });
    try {
      return await new Promise<ConversationMessage[] | null>((resolve, reject) => {
        const transaction = db.transaction("state", "readonly");
        const request = transaction.objectStore("state").get("session");
        request.onerror = () => reject(request.error ?? new Error("Cannot read the persisted session"));
        transaction.onabort = () => reject(transaction.error ?? new Error("Persisted session read aborted"));
        request.onsuccess = () => {
          const record = request.result as { conversation?: unknown } | undefined;
          resolve(Array.isArray(record?.conversation) ? record.conversation as ConversationMessage[] : null);
        };
      });
    } finally {
      db.close();
    }
  });
}

async function requireSavedConversation(page: Page, length: number): Promise<ConversationMessage[]> {
  await expect.poll(async () => (await readSavedConversation(page))?.length ?? -1, {
    message: "The actual persisted conversation must exist with every message",
  }).toBe(length);
  const messages = await readSavedConversation(page);
  if (!Array.isArray(messages)) throw new Error("Persisted conversation could not be read");
  return messages;
}

async function prepareHandoff(page: Page, question: string) {
  await page.getByLabel("What's on your mind?").fill(question);
  await page.locator(".translate-ask-button").click();
  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await expect(review).toBeVisible();
  await review.getByRole("button", { name: "Copy only", exact: true }).click();
  await expect(page.locator(".message-bubble--user").last()).toContainText(question);
}

async function importAnswer(page: Page, text: string) {
  await page.getByRole("button", { name: "Import Response", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Import Response" });
  await dialog.getByLabel("Source label").fill("Local test fixture");
  await dialog.getByLabel("Pasted response").fill(text);
  await dialog.getByRole("button", { name: "Confirm import", exact: true }).click();
  const answer = page.locator(".message-bubble--imported").last();
  await expect(answer).toContainText(text);
  return answer;
}

test.describe("R19: Prepared/Copied/Opened/Sent/Answered message state", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await installModelMocks(page, { answerText: "Unused on the local handoff route." });
  });

  test("user message persists with messageState after copy action", async ({ page }) => {
    await page.goto("/");
    await prepareHandoff(page, "What is the capital of France?");
    const answer = await importAnswer(page, "The capital of France is Paris.");
    await page.bringToFront();
    const copyButton = answer.getByRole("button", { name: /^(Copy|Copied)$/ });
    await copyButton.click();
    await expect(copyButton).toContainText("Copied");
    await requireSavedConversation(page, 3);
    await expect.poll(async () => (await readSavedConversation(page))
      ?.find((message) => message.messageKind === "imported")?.userCopied).toBe(true);
    const saved = await requireSavedConversation(page, 3);
    // 551667f deliberately records manual handoffs as prepared, never sent.
    expect(saved.find((message) => message.role === "user")).toMatchObject({
      content: "What is the capital of France?", messageState: "prepared",
    });
    expect(saved.find((message) => message.messageKind === "handoff")).toMatchObject({
      messageState: "imported", userCopied: true, userOpened: false,
    });
    expect(saved.find((message) => message.messageKind === "imported")).toMatchObject({
      messageState: "imported", userCopied: true, content: "The capital of France is Paris.",
    });
  });

  test("message state persists through page reload", async ({ page }) => {
    await page.goto("/");
    await prepareHandoff(page, "Test question");
    const answer = await importAnswer(page, "A locally imported answer for the reload test.");
    await page.bringToFront();
    const copyButton = answer.getByRole("button", { name: /^(Copy|Copied)$/ });
    await copyButton.click();
    await expect(copyButton).toContainText("Copied");
    await expect.poll(async () => (await readSavedConversation(page))
      ?.find((message) => message.messageKind === "imported")?.userCopied).toBe(true);
    const beforeReload = await requireSavedConversation(page, 3);

    await page.reload();
    await page.getByRole("button", { name: "Restore last work", exact: true }).click();
    await expect(page.locator(".message-bubble--user").first()).toContainText("Test question");
    await expect(page.locator(".message-bubble--imported")).toContainText("A locally imported answer for the reload test.");
    const afterReload = await requireSavedConversation(page, 3);
    expect(afterReload).toEqual(beforeReload);
  });

  test("user actions (copy/open) are independent of message state", async ({ page }) => {
    await page.goto("/");
    await prepareHandoff(page, "Independent state test");
    const answer = await importAnswer(page, "An imported answer whose state must survive repeated copying.");
    const beforeCopy = await requireSavedConversation(page, 3);
    await page.bringToFront();
    const copyButton = answer.getByRole("button", { name: /^(Copy|Copied)$/ });
    for (let copy = 0; copy < 2; copy += 1) {
      await copyButton.click();
      await expect(copyButton).toContainText("Copied");
    }
    await expect.poll(async () => (await readSavedConversation(page))
      ?.find((message) => message.messageKind === "imported")?.userCopied).toBe(true);
    const afterCopy = await requireSavedConversation(page, 3);
    expect(afterCopy.map(({ id, messageState }) => ({ id, messageState })))
      .toEqual(beforeCopy.map(({ id, messageState }) => ({ id, messageState })));
    expect(afterCopy.find((message) => message.messageKind === "imported")).toMatchObject({
      messageState: "imported", userCopied: true,
    });

    // Observe the Open action without navigating to any external provider.
    await page.evaluate(() => {
      const attempts: string[] = [];
      (window as typeof window & { r19OpenAttempts: string[] }).r19OpenAttempts = attempts;
      window.open = (url?: string | URL) => { attempts.push(String(url)); return window; };
    });
    await page.getByLabel("What's on your mind?").fill("Open action stays prepared");
    await page.locator(".translate-ask-button").click();
    const review = page.getByRole("dialog", { name: "Review AI-ready request" });
    await review.getByRole("button", { name: "Copy & Choose AI", exact: true }).click();
    await review.getByLabel("Choose AI to open").getByRole("button", { name: /^ChatGPT/ }).click();
    await review.getByRole("button", { name: /^Copy & Open ChatGPT/ }).click();
    await expect.poll(() => page.evaluate(() =>
      (window as typeof window & { r19OpenAttempts: string[] }).r19OpenAttempts))
      .toEqual(["https://chatgpt.com/"]);
    const afterOpen = await requireSavedConversation(page, 5);
    expect(afterOpen.slice(0, 3).map(({ id, messageState }) => ({ id, messageState })))
      .toEqual(afterCopy.map(({ id, messageState }) => ({ id, messageState })));
    expect(afterOpen[3]).toMatchObject({ role: "user", content: "Open action stays prepared", messageState: "prepared" });
    expect(afterOpen[4]).toMatchObject({ messageKind: "handoff", messageState: "prepared", userCopied: true, userOpened: true });
  });

  test("conversation preserves all messages with their individual states", async ({ page }) => {
    await page.goto("/");
    await prepareHandoff(page, "First question");
    await prepareHandoff(page, "Second question");

    const userMessages = page.locator(".message-bubble--user");
    await expect(userMessages).toHaveCount(2);
    await expect(userMessages.first()).toContainText("First question");
    await expect(userMessages.nth(1)).toContainText("Second question");
    await expect(page.locator(".message-bubble--handoff")).toHaveCount(2);
    await expect(page.getByTestId("message-bubble")).toHaveCount(4);

    const saved = await requireSavedConversation(page, 4);
    expect(new Set(saved.map((message) => message.id)).size).toBe(4);
    expect(saved).toEqual([
      expect.objectContaining({ role: "user", content: "First question", messageState: "prepared" }),
      expect.objectContaining({ role: "assistant", messageKind: "handoff", messageState: "prepared", userCopied: true, userOpened: false }),
      expect.objectContaining({ role: "user", content: "Second question", messageState: "prepared" }),
      expect.objectContaining({ role: "assistant", messageKind: "handoff", messageState: "prepared", userCopied: true, userOpened: false }),
    ]);
    expect(saved[1].preparedRequest).toContain("First question");
    expect(saved[3].preparedRequest).toContain("Second question");
  });
});
