import { expect, test, type Page } from "@playwright/test";
import { allowLocalAccess } from "./credit-helpers";

async function restoreIfOffered(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  const app = page.locator("#root > *").first();
  await expect(restore.or(app)).toBeVisible();
  if (await restore.isVisible()) await restore.click();
  await expect(app).toBeVisible();
}

test("R26: connect guidance, exact verification, invalid/revoked, disconnect, refresh, and reconnect are truthful", async ({ page }) => {
  await allowLocalAccess(page);
  await page.route("**/api/account", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, user: null }) });
  });
  let openAiResult: "verified" | "invalid" | "revoked" = "verified";
  const exactChecks: string[] = [];
  let configurationRefreshes = 0;
  await page.route("**/api/provider-status*", async (route) => {
    const url = new URL(route.request().url());
    const providerId = url.searchParams.get("provider");
    if (!providerId) {
      configurationRefreshes += 1;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ anthropic: false, openai: true, google: false, xai: false, deepseek: false }) });
      return;
    }
    const modelId = url.searchParams.get("model");
    const executionRoute = url.searchParams.get("route");
    exactChecks.push(`${providerId}|${modelId}|${executionRoute}`);
    const verified = providerId === "openai" && openAiResult === "verified";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ routeStatus: {
        providerId, modelId, route: executionRoute, configured: providerId === "openai",
        authenticated: verified, healthy: verified,
        verifiedAt: verified ? "2026-09-01T00:00:00Z" : null,
        failureReason: providerId === "openai" && !verified ? openAiResult : "unavailable",
      } }),
    });
  });
  let providerCalls = 0;
  await page.route("**/api/proxy*", async (route) => {
    providerCalls += 1;
    await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
  });

  await page.goto("/");
  await restoreIfOffered(page);
  await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "AI Connections", exact: true }).click();
  const panel = page.getByTestId("provider-connections-panel");
  await expect(panel).toBeVisible();

  const openai = panel.locator("li").filter({ hasText: "OpenAI" });
  await expect(openai).toContainText("gpt-5.5 · /api/proxy-openai");
  await expect(openai).toContainText("Configured — not yet verified");
  await openai.getByRole("button", { name: "Verify exact route", exact: true }).click();
  await expect(openai).toContainText("Verified healthy · 2026-09-01T00:00:00Z");
  expect(exactChecks).toContain("openai|gpt-5.5|/api/proxy-openai");

  openAiResult = "invalid";
  await openai.getByRole("button", { name: "Verify again", exact: true }).click();
  await expect(openai).toContainText("Invalid authentication");
  openAiResult = "revoked";
  await openai.getByRole("button", { name: "Verify again", exact: true }).click();
  await expect(openai).toContainText("Revoked — verification failed");

  const anthropic = panel.locator("li").filter({ hasText: "Anthropic (Claude)" });
  await expect(anthropic).toContainText("Not configured");
  await anthropic.getByRole("button", { name: "Connect instructions", exact: true }).click();
  await expect(anthropic.getByRole("status")).toContainText("Configure ANTHROPIC_API_KEY in the server deployment");
  await expect(anthropic.getByRole("status")).toContainText("does not request, create, display, or store provider credentials or OAuth applications");

  await openai.getByRole("button", { name: "Disconnect", exact: true }).click();
  await expect(openai).toContainText("Disconnected locally");
  await expect(panel.getByRole("status").filter({ hasText: "OpenAI disconnect saved" })).toBeVisible();
  await page.reload();
  await restoreIfOffered(page);
  await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "AI Connections", exact: true }).click();
  const restoredOpenAi = page.getByTestId("provider-connections-panel").locator("li").filter({ hasText: "OpenAI" });
  await expect(restoredOpenAi).toContainText("Disconnected locally");

  openAiResult = "verified";
  await restoredOpenAi.getByRole("button", { name: "Reconnect & verify", exact: true }).click();
  await expect(restoredOpenAi).toContainText("Verified healthy");
  const refreshesBefore = configurationRefreshes;
  await page.getByTestId("provider-connections-refresh").click();
  await expect.poll(() => configurationRefreshes).toBeGreaterThan(refreshesBefore);
  await expect(restoredOpenAi).toContainText("Configured — not yet verified");
  expect(providerCalls).toBe(0);
});
