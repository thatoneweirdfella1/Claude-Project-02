import { test, expect, type Page } from "./fixtures";
import { installModelMocks } from "./mocks";
import { enableDeveloperMode } from "./credit-helpers";
import { DeterministicMoneyAuthority } from "../src/services/moneySafety";

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

async function installInsufficientFundsState(page: Page) {
  await page.goto("/");
  const emptyMoneySnapshot = new DeterministicMoneyAuthority({ balanceCents: 0 }).snapshot();
  await page.evaluate(async (moneySnapshot) => {
    const accountOpen = indexedDB.open("divergence-ai", 1);
    accountOpen.onupgradeneeded = () => {
      if (!accountOpen.result.objectStoreNames.contains("state")) accountOpen.result.createObjectStore("state");
    };
    const accountDb = await new Promise<IDBDatabase>((resolve, reject) => {
      accountOpen.onsuccess = () => resolve(accountOpen.result);
      accountOpen.onerror = () => reject(accountOpen.error ?? new Error("Account store open failed"));
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = accountDb.transaction("state", "readwrite");
      const store = transaction.objectStore("state");
      const read = store.get("account");
      read.onsuccess = () => store.put({ ...(read.result ?? {}), creditBalance: 25 }, "account");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Account seed failed"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Account seed aborted"));
    });
    accountDb.close();

    const moneyOpen = indexedDB.open("divergence-layer4", 2);
    moneyOpen.onupgradeneeded = () => {
      for (const name of ["jobs", "recovery", "meta", "conflicts", "workspace", "money"]) {
        if (!moneyOpen.result.objectStoreNames.contains(name)) moneyOpen.result.createObjectStore(name);
      }
    };
    const moneyDb = await new Promise<IDBDatabase>((resolve, reject) => {
      moneyOpen.onsuccess = () => resolve(moneyOpen.result);
      moneyOpen.onerror = () => reject(moneyOpen.error ?? new Error("Money store open failed"));
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = moneyDb.transaction("money", "readwrite");
      transaction.objectStore("money").put(moneySnapshot, "authority");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Money seed failed"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Money seed aborted"));
    });
    moneyDb.close();
  }, emptyMoneySnapshot);
  await page.reload();
}

async function readPersistedAuthorizationState(page: Page) {
  return page.evaluate(async () => {
    const accountOpen = indexedDB.open("divergence-ai", 1);
    const accountDb = await new Promise<IDBDatabase>((resolve, reject) => {
      accountOpen.onsuccess = () => resolve(accountOpen.result);
      accountOpen.onerror = () => reject(accountOpen.error ?? new Error("Account store read failed"));
    });
    const account = await new Promise<{ creditBalance?: number } | undefined>((resolve, reject) => {
      const transaction = accountDb.transaction("state", "readonly");
      const request = transaction.objectStore("state").get("account");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Account read failed"));
    });
    accountDb.close();

    const moneyOpen = indexedDB.open("divergence-layer4", 2);
    const moneyDb = await new Promise<IDBDatabase>((resolve, reject) => {
      moneyOpen.onsuccess = () => resolve(moneyOpen.result);
      moneyOpen.onerror = () => reject(moneyOpen.error ?? new Error("Money store read failed"));
    });
    const money = await new Promise<{ balanceCents: number; reservations: unknown[]; ledger: unknown[] }>((resolve, reject) => {
      const transaction = moneyDb.transaction("money", "readonly");
      const request = transaction.objectStore("money").get("authority");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Money snapshot read failed"));
    });
    moneyDb.close();
    return { account, money };
  });
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
  await installInsufficientFundsState(page);
  await restoreLastWorkIfPrompted(page);
  await enableDeveloperMode(page);
  await chooseConnectedTranslator(page);

  await page.getByLabel("What's on your mind?").fill(QUESTION);
  await page.locator(".translate-ask-button").click();

  const dialog = page.getByRole("dialog", { name: "Confirm AI Cost" });
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  const approve = dialog.getByRole("button", { name: /^Continue for up to/ });
  await expect(approve).toBeEnabled();
  await approve.click();

  // The developer workspace has no funded balance in the money ledger yet, so the
  // reservation is refused. Run 2 (money) decides how Developer Mode tests are paid for.
  await expect(page.getByText("Not sent. Your draft is still here.")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByLabel("What's on your mind?")).toHaveValue(QUESTION);
  await page.waitForTimeout(1_000);
  expect(proxyCalls).toHaveLength(0);
  const state = await readPersistedAuthorizationState(page);
  // M5: the authoritative empty balance replaces the stale account mirror.
  expect(state.account?.creditBalance).toBe(0);
  expect(state.money.balanceCents).toBe(0);
  expect(state.money.reservations).toHaveLength(0);
  expect(state.money.ledger).toHaveLength(0);
});
