import type { Locator, Page } from "@playwright/test";

export async function allowLocalAccess(page: Page): Promise<void> {
  await page.route("**/api/verify-access", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: false, ok: true }),
    });
  });
}

/** Browser tests seed the persisted operator state directly. Developer Mode
    is intentionally no longer exposed in the main workspace, so looking for
    the retired button would make the tests enforce obsolete UI. The reload
    exercises the same persisted-state hydration used by a real session. */
export async function enableDeveloperMode(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const request = indexedDB.open("divergence-ai", 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("state")) {
          request.result.createObjectStore("state");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const read = (key: string) => new Promise<Record<string, unknown> | undefined>((resolve, reject) => {
      const tx = db.transaction("state", "readonly");
      const get = tx.objectStore("state").get(key);
      get.onsuccess = () => resolve(get.result as Record<string, unknown> | undefined);
      get.onerror = () => reject(get.error);
    });
    const [account, session] = await Promise.all([read("account"), read("session")]);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("state", "readwrite");
      tx.objectStore("state").put({ ...account, appMode: "developer" }, "account");
      tx.objectStore("state").put({
        ...session,
        translatorEngine: "managed-translator",
        reviewBeforeSend: false,
        stateDetectionMode: "automatic-paid",
      }, "session");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await page.reload();
}

export async function clickWithCostConfirmation(
  page: Page,
  action: Locator,
): Promise<void> {
  await action.click();
  const dialog = page.getByRole("dialog", { name: "Confirm AI Cost" });
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
}
