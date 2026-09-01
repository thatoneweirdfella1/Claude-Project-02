import { expect, test, type Page } from "@playwright/test";
import { allowLocalAccess } from "./credit-helpers";

async function restoreIfOffered(page: Page): Promise<void> {
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  const app = page.locator("#root > *").first();
  await expect(restore.or(app)).toBeVisible();
  if (await restore.isVisible()) await restore.click();
  await expect(app).toBeVisible();
}

test("R25: exact route verification fails closed and preserves manual handoff", async ({ page }) => {
  await allowLocalAccess(page);
  await page.route("**/api/account", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, user: null }) });
  });

  const checkedRoutes: string[] = [];
  let exactRouteVerified = false;
  await page.route("**/api/provider-status?**", async (route) => {
    const url = new URL(route.request().url());
    const providerId = url.searchParams.get("provider");
    const modelId = url.searchParams.get("model");
    const executionRoute = url.searchParams.get("route");
    checkedRoutes.push(`${providerId}|${modelId}|${executionRoute}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        anthropic: true,
        routeStatus: {
          providerId,
          modelId,
          route: executionRoute,
          configured: true,
          authenticated: exactRouteVerified,
          healthy: exactRouteVerified,
          verifiedAt: exactRouteVerified ? "2026-09-01T00:00:00Z" : null,
        },
      }),
    });
  });

  let providerCalls = 0;
  await page.route("**/api/proxy", async (route) => {
    providerCalls += 1;
    await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "must not be called" }) });
  });

  await page.goto("/");
  await restoreIfOffered(page);

  const summary = page.getByTestId("route-readiness-summary");
  await expect(summary).toContainText("Local preparation");
  await expect(summary).not.toContainText("Ready for");

  await page.getByRole("button", { name: "Any AI — Universal", exact: true }).click();
  await page.getByRole("dialog", { name: "Choose destination AI" }).getByRole("button", { name: /Claude/ }).click();
  await page.getByRole("dialog", { name: "Choose destination AI" }).getByRole("button", { name: /Sonnet/ }).click();

  await expect(summary).toContainText("anthropic · claude-sonnet-5 is configured but not verified healthy on /api/proxy");
  await expect(summary).toContainText("manual handoff");
  expect(checkedRoutes).toContain("anthropic|claude-sonnet-5|/api/proxy");

  exactRouteVerified = true;
  await page.getByRole("button", { name: "Claude · Sonnet", exact: true }).click();
  await page.getByRole("dialog", { name: "Choose destination AI" }).getByRole("button", { name: /Claude/ }).click();
  await page.getByRole("dialog", { name: "Choose destination AI" }).getByRole("button", { name: /Haiku/ }).click();
  await expect(summary).toContainText("anthropic · claude-haiku-4-5 verified and ready on /api/proxy");
  await expect(summary).toContainText("Exact provider, model, route, authentication, and health verified");

  exactRouteVerified = false;
  await page.getByRole("button", { name: "Claude · Haiku", exact: true }).click();
  await page.getByRole("dialog", { name: "Choose destination AI" }).getByRole("button", { name: /Claude/ }).click();
  await page.getByRole("dialog", { name: "Choose destination AI" }).getByRole("button", { name: /Sonnet/ }).click();
  await expect(summary).toContainText("configured but not verified healthy");

  await page.getByRole("button", { name: /Show Advanced Controls/ }).click();
  await page.getByLabel("Translator Engine").selectOption("destination-one-pass");
  await page.getByRole("button", { name: /Show Advanced Controls/ }).click();
  await page.getByLabel("What's on your mind?").fill("Explain the safest rollout plan.");
  await page.locator(".translate-ask-button").click();
  await page.getByRole("dialog", { name: "State change suggested" })
    .getByRole("button", { name: "Accept & Continue", exact: true }).click();

  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await expect(review).toBeVisible();
  await expect(review.getByRole("button", { name: "Copy only", exact: true })).toBeVisible();
  await expect(review.getByRole("button", { name: /^Send/ })).toHaveCount(0);
  expect(providerCalls).toBe(0);
  expect(checkedRoutes.filter((entry) => entry === "anthropic|claude-sonnet-5|/api/proxy").length).toBeGreaterThanOrEqual(2);
});
