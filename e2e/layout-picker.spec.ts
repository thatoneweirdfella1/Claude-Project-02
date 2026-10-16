import { test, expect } from "./fixtures";
import { installModelMocks } from "./mocks";

test("the approved frozen layout supersedes every obsolete layout choice", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1543, height: 1019 });
  await page.route("**/api/verify-access", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: false, ok: true }),
    });
  });

  await installModelMocks(page, { answerText: "Unused on the local handoff route." });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-layout-authority",
    "frozen-reference-1600x1024",
  );
  await expect(page.locator('[data-testid="logo"] .logo-mark')).toHaveAttribute(
    "src",
    "/logo-mark-gold.png",
  );

  // The empty conversation has no BrainMark. Create a local handoff so the
  // avatar assertion below exercises the real component rather than an empty list.
  await page.getByLabel("What's on your mind?").fill("What temperature does water boil at, at sea level?");
  await page.locator(".translate-ask-button").click();
  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await expect(review).toBeVisible();
  await review.getByRole("button", { name: "Copy only", exact: true }).click();
  await expect(page.locator(".message-bubble--assistant").first()).toBeVisible();

  await page.getByTestId("visibility-gear").click();
  const menu = page.getByTestId("visibility-popover");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("radiogroup", { name: "Layout", exact: true })).toHaveCount(0);
  await expect(menu.getByRole("radio", { name: "Original", exact: true })).toHaveCount(0);
  await expect(menu.getByRole("radio", { name: "Gold", exact: true })).toHaveCount(0);
  await expect(menu.getByRole("radiogroup", { name: "Theme", exact: true })).toBeVisible();
  const marks = page.locator("img.brain-mark");
  expect(await marks.count()).toBeGreaterThan(0);
  for (const mark of await marks.all()) {
    await expect(mark).toHaveAttribute("src", "/logo-mark-gold.png");
  }
  await page.screenshot({ path: testInfo.outputPath("gear-menu-open.png") });

  await page.reload();
  await page.getByRole("button", { name: "Restore last work", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
});
