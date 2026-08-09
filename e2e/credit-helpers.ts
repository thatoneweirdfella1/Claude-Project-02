import type { Locator, Page } from "@playwright/test";

/** Browser tests deliberately enter operator-only Developer Mode so existing
    product flows can exercise mocked providers without manufacturing paid
    customer credits. The cost dialog is still confirmed on every action. */
export async function useDeveloperMode(page: Page): Promise<void> {
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
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
}
