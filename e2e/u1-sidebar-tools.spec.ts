import { test, expect, type Page } from "./fixtures";

const tools = ["Templates", "Saved Prompts", "Techniques"];
const nav = (page: Page) => page.locator(".leftnav-content");

async function pinThree(page: Page) {
  await nav(page).getByRole("button", { name: "All Tools", exact: true }).click();
  const popup = page.getByRole("dialog", { name: "All tools", exact: true });
  for (const label of tools) await popup.getByRole("button", { name: `Pin ${label}`, exact: true }).click();
  await popup.getByRole("button", { name: "Close tools", exact: true }).click();
}

async function assertThree(page: Page) {
  await expect(nav(page).locator(".leftnav-pinned .leftnav-item")).toHaveText(tools);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1543, height: 1019 });
  await page.goto("/");
  await expect(nav(page)).toBeVisible();
});

test("pins three tools in the order selected", async ({ page }) => {
  await pinThree(page);
  await assertThree(page);
  await page.screenshot({ path: "../../out/shots/U1-sidebar.png" });
});

test("keeps all three pins through autosave and a real reload", async ({ page }) => {
  await pinThree(page);
  await page.waitForTimeout(1200);
  await page.reload();
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  await expect(restore.or(nav(page))).toBeVisible();
  if (await restore.isVisible()) await restore.click();
  await assertThree(page);
});

test("removes a normal primary item and restores it from All Tools", async ({ page }) => {
  await nav(page).getByRole("button", { name: "Remove Projects", exact: true }).click();
  await expect(nav(page).getByRole("button", { name: "Projects", exact: true })).toHaveCount(0);
  await page.waitForTimeout(1200);
  await page.reload();
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  await expect(restore.or(nav(page))).toBeVisible();
  if (await restore.isVisible()) await restore.click();
  await expect(nav(page).getByRole("button", { name: "Projects", exact: true })).toHaveCount(0);
  await nav(page).getByRole("button", { name: "All Tools", exact: true }).click();
  const popup = page.getByRole("dialog", { name: "All tools", exact: true });
  await popup.getByRole("button", { name: "Pin Projects", exact: true }).click();
  await popup.getByRole("button", { name: "Close tools", exact: true }).click();
  await expect(nav(page).getByRole("button", { name: "Projects", exact: true })).toBeVisible();
  await nav(page).getByRole("button", { name: "Projects", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
});

test("protects conversation and settings from removal", async ({ page }) => {
  for (const label of ["Talk to AI", "Settings"]) {
    await expect(nav(page).getByRole("button", { name: label, exact: true })).toBeVisible();
    await expect(nav(page).getByRole("button", { name: `Remove ${label}`, exact: true })).toHaveCount(0);
    await expect(nav(page).getByRole("button", { name: `Unpin ${label}`, exact: true })).toHaveCount(0);
  }
});

test("every tool is pinnable together, duplicates are prevented, each can be removed", async ({ page }) => {
  const labels = ["Templates", "Saved Prompts", "Techniques", "Variables", "Checkpoints", "AI Connections", "Large Jobs"];
  await nav(page).getByRole("button", { name: "All Tools", exact: true }).click();
  const popup = page.getByRole("dialog", { name: "All tools", exact: true });
  for (const label of labels) {
    await popup.getByRole("button", { name: `Pin ${label}`, exact: true }).click();
    await expect(popup.getByRole("button", { name: `Unpin ${label}`, exact: true })).toBeVisible();
  }
  await popup.getByRole("button", { name: "Close tools", exact: true }).click();
  await expect(nav(page).locator(".leftnav-pinned .leftnav-item")).toHaveText(labels);
  for (const label of labels) {
    await nav(page).getByRole("button", { name: `Unpin ${label}`, exact: true }).click();
    await expect(nav(page).locator(".leftnav-pinned .leftnav-item").filter({ hasText: label })).toHaveCount(0);
  }
});
