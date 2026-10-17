import { readFile } from "node:fs/promises";
import { test, expect, type Page } from "./fixtures";
import { installModelMocks } from "./mocks";

async function fixture(page: Page, withDebate = true) {
  await page.setViewportSize({ width: 1543, height: 1019 });
  await installModelMocks(page, { answerText: "Unused on the saved-session export route." });
  // Seed the real persisted session on a blank same-origin page, before
  // mounting the app, so autosave cannot race the fixture write.
  await page.route("http://localhost:5175/", (route) => route.fulfill({ contentType: "text/html", body: "<html></html>" }), { times: 1 });
  await page.goto("/");
  await page.evaluate(async (hasDebate) => {
    const open = indexedDB.open("divergence-ai", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("state");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("state", "readwrite");
      tx.objectStore("state").put({
        sessionId: "u4-fixture", sessionCreatedAt: 1, sessionTitle: "U4 fixture",
        conversation: [
          { id: "m1", role: "user", content: "Conversation question", timestamp: 1 },
          { id: "m2", role: "assistant", content: "Conversation answer", timestamp: 2 },
        ],
        multiAiRuns: hasDebate ? [{
          id: "debate-1", sourceMessageIds: ["m2"], createdAt: 3,
          question: "Debate question", status: "complete",
          participants: [
            { label: "Claude", provider: "anthropic", model: "claude-sonnet-5", status: "ok", text: "First debate view" },
            { label: "GPT-5.5", provider: "openai", model: "gpt-5.5", status: "ok", text: "Second debate view" },
          ], totalEstimatedCost: 0, totalActualCost: null,
        }] : [],
      }, "session");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, withDebate);
  await page.goto("/");
  await page.getByRole("button", { name: "Restore last work", exact: true }).click();
  await expect(page.locator(".message-bubble--assistant")).toContainText("Conversation answer");
}

test("Export both downloads the conversation and ordered attributed debate", async ({ page }) => {
  await fixture(page);
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "Download and export" });
  await expect(modal).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page.mouse.click(10, 10);
  await expect(modal).toBeHidden();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await modal.getByRole("radio", { name: "Both", exact: true }).check();
  await expect(modal).toBeVisible();
  // The conversation panel clips descendants: the chooser's title and
  // actions must be fully visible without scrolling that panel.
  for (const control of [modal.locator(".download-modal__title"),
    modal.getByRole("button", { name: "Close download dialog", exact: true }),
    modal.getByRole("button", { name: "Download", exact: true }),
    modal.getByRole("button", { name: "Copy to clipboard", exact: true })]) {
    await expect(control).toBeInViewport({ ratio: 1 });
  }
  await page.screenshot({ path: "../../out/shots/U4-export.png" });
  const pending = page.waitForEvent("download");
  await modal.getByRole("button", { name: "Download", exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toMatch(/\.md$/);
  const file = await download.path();
  expect(file).not.toBeNull();
  const output = await readFile(file!, "utf8");
  expect(output).toContain("## Conversation");
  expect(output).toContain("Conversation question");
  expect(output).toContain("Conversation answer");
  expect(output).toContain("## Debate");
  expect(output).toContain("CLAUDE [anthropic");
  expect(output).toContain("GPT-5.5 [openai");
  expect(output.indexOf("First debate view")).toBeLessThan(output.indexOf("Second debate view"));
});

test("debate popup carries a Markdown attachment into the conversation and survives reload", async ({ page }) => {
  await fixture(page);
  await page.getByTestId("multi-ai-run").locator("summary").click();
  await page.getByRole("button", { name: "Open debate", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Debate transcript", exact: true });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Open debate", exact: true }).click();
  await page.mouse.click(10, 10);
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Open debate", exact: true }).click();
  await dialog.getByRole("button", { name: "Carry debate into conversation", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText("Debate attached as Markdown.");
  await dialog.getByRole("button", { name: "Close debate", exact: true }).click();
  const attachment = page.getByRole("button", { name: /debate-debate-1\.md/ }).first();
  await expect(attachment).toBeVisible();
  await attachment.click();
  const preview = page.getByRole("dialog", { name: "Preview debate-debate-1.md", exact: true });
  await expect(preview).toContainText("## Debate");
  await expect(preview).toContainText("First debate view");
  await expect(preview).toContainText("Second debate view");
  await expect(preview).not.toContainText("Conversation answer");
  await page.waitForTimeout(1200);
  await page.reload();
  await page.getByRole("button", { name: "Restore last work", exact: true }).click();
  await expect(attachment).toBeVisible();
});

test("no debate keeps both debate choices visible, disabled, and explained", async ({ page }) => {
  await fixture(page, false);
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "Download and export" });
  await expect(modal.getByRole("radio", { name: "Just the debate", exact: true })).toBeDisabled();
  await expect(modal.getByRole("radio", { name: "Both", exact: true })).toBeDisabled();
  await expect(modal).toContainText("No debate in this conversation yet.");
});

test("existing single-answer Markdown save remains the default and excludes debate", async ({ page }) => {
  await fixture(page);
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "Download and export" });
  const pending = page.waitForEvent("download");
  await modal.getByRole("button", { name: "Download", exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("divergence-export.md");
  const output = await readFile((await download.path())!, "utf8");
  expect(output).toBe("# Divergence.AI Export\n\n## Answer\n\nConversation answer\n");
});
