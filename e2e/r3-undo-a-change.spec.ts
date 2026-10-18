import { test, expect, type Page } from "./fixtures";
import { resolve } from "node:path";

async function openPersonalOptimization(page: Page) {
  await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Personal Optimization", exact: true }).click();
}

test("R3: applied changes explain themselves, affect the real request, and undo survives reload", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1400 });
  const remoteRequests: string[] = [];
  const providerCalls: string[] = [];
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
      remoteRequests.push(url.origin);
      await route.abort();
    } else await route.fallback();
  });
  await page.route("**/api/provider-status*", (route) => route.fulfill({ json: { freePoolAvailable: false } }));
  await page.route("**/api/proxy*", async (route) => {
    providerCalls.push(route.request().url());
    await route.abort();
  });
  // Seed the real IndexedDB before the application's module runs, once only.
  // Reloads after undo use actual persisted application writes, never this seed.
  let seeded = false;
  await page.route(/\/assets\/index-[^/]+\.js$/, async (route) => {
    if (!seeded) {
      seeded = true;
      await page.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((done, fail) => {
          const request = indexedDB.open("divergence-ai", 1);
          request.onupgradeneeded = () => request.result.createObjectStore("state");
          request.onsuccess = () => done(request.result);
          request.onerror = () => fail(request.error);
        });
        await new Promise<void>((done, fail) => {
          const tx = db.transaction("state", "readwrite");
          tx.objectStore("state").put({ theme: "light", layout: "gold",
            learnedPreferences: { routing: {}, technique: {} }, optimizationRuns: [],
            optimizationProfile: { enabled: false, selectedGoals: [], minimumEvidence: 3, lastRunAt: null },
            sessions: Array.from({ length: 3 }, (_, index) => ({
              id: `synthetic-session-${index}`, createdAt: index, archived: true,
              model: "auto", directness: 2, techniques: ["auto-detect"], context: [], variables: {},
              conversation: [{ id: `synthetic-message-${index}`, role: "user", content: "overwhelm", timestamp: index }],
            })),
          }, "account");
          tx.oncomplete = () => done();
          tx.onerror = () => fail(tx.error);
        });
        db.close();
      });
    }
    await route.fallback();
  });
  await page.goto("/");
  await expect(page.getByTestId("topbar")).toBeVisible();
  await openPersonalOptimization(page);
  await page.getByRole("checkbox", { name: /Off|On/ }).check();
  await page.getByRole("checkbox", { name: "Reduce Overwhelm" }).check();
  await page.getByRole("button", { name: "Preview analysis state" }).click();
  await expect(page.getByRole("status").first()).toContainText("Scanned 3 saved sessions");
  await page.getByRole("button", { name: "Apply previewed changes" }).click();
  const history = page.getByRole("region", { name: "Applied optimization changes" });
  const simplify = history.locator('[data-optimization-target="simplify"]');
  await expect(simplify).toContainText("Prioritize lower cognitive load.");
  await expect(simplify).toContainText("3 examples");
  await expect(simplify).toContainText("0 → 1");
  await expect(simplify).toContainText("Current weight: 1");
  await history.screenshot({ path: resolve(process.cwd(), "../../out/screenshots/R3-applied-history.png") });

  // Exercise the production free/handoff seam added by R2, with no provider.
  await page.getByRole("button", { name: "Talk to AI", exact: true }).first().click();
  await page.getByLabel("What's on your mind?").fill("neutral");
  await page.locator(".translate-ask-button").click();
  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await expect(review.getByRole("textbox", { name: "AI-ready request", exact: true })).toHaveValue(/Use: .*simplify/);
  await review.getByRole("button", { name: "Back", exact: true }).click();

  await openPersonalOptimization(page);
  await simplify.getByRole("button", { name: "Undo simplify", exact: true }).click();
  await expect(simplify).toContainText("Undone");
  await expect(simplify).toContainText("Current weight: 0");
  await expect(history.locator('[data-optimization-target="detailed"]')).toContainText("Current weight: -1");
  await expect(page.getByRole("status").last()).toContainText("saved");
  await page.reload();
  await page.getByRole("button", { name: "Restore last work", exact: true }).click();
  await openPersonalOptimization(page);
  await expect(simplify).toContainText("Undone");
  await expect(simplify).toContainText("Current weight: 0");
  await expect(simplify).toContainText("Prioritize lower cognitive load.");
  await history.screenshot({ path: resolve(process.cwd(), "../../out/screenshots/R3-undone-after-reload.png") });
  await page.getByRole("button", { name: "Talk to AI", exact: true }).first().click();
  await page.getByLabel("What's on your mind?").fill("neutral");
  await page.locator(".translate-ask-button").click();
  const restoredRequest = review.getByRole("textbox", { name: "AI-ready request", exact: true });
  await expect(restoredRequest).toBeVisible();
  await expect(restoredRequest).not.toHaveValue(/Use: .*simplify/);
  expect(providerCalls).toEqual([]);
  expect(remoteRequests).toEqual([]);
});
