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

/** Browser tests deliberately enter operator-only Developer Mode so existing
    product flows can exercise mocked providers without manufacturing paid
    customer credits. The cost dialog is still confirmed on every action. */
export async function enableDeveloperMode(page: Page): Promise<void> {
  const button = page.getByRole("button", { name: "Developer Mode" });
  await button.waitFor({ state: "visible" });
  await button.click();
}

export async function clickWithCostConfirmation(
  page: Page,
  action: Locator,
): Promise<void> {
  await action.click();
  const dialog = page.getByRole("dialog", { name: "Confirm AI Cost" });
  // Second-pass fix: the real CostConfirm.tsx button reads "Continue for up
  // to $X.XX" (the request's hard maximum), never a bare "Continue" — the
  // previous exact match here has never matched anything real (both call
  // sites in access-gate.spec.ts are inside test.skip() blocks, so this
  // was never exercised).
  await dialog.getByRole("button", { name: /^Continue for up to/ }).click();
}
