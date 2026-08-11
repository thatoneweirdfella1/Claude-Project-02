import { test, expect } from "@playwright/test";

test("frozen light reference audit at the canonical viewport", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1543, height: 1019 });
  await page.route("**/api/verify-access", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: false, ok: true }),
    });
  });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-layout-authority",
    "frozen-reference-2026-08-10",
  );

  const developerMode = page.getByRole("button", { name: /Developer Mode/ });
  if (await developerMode.isEnabled()) await developerMode.click();

  await expect(page.locator("[data-screen='translate']")).toHaveClass(/leftnav-item--active/);
  await expect(page.locator(".quick-tools-tile__button")).toHaveCount(6);
  await expect(page.locator(".accordion-panel.is-open")).toHaveCount(3);
  await expect(page.getByText("12,847", { exact: true })).toBeVisible();
  await expect(page.getByText("TS-2024-001247", { exact: true })).toBeVisible();
  await expect(page.locator(".frozen-connectors circle")).toHaveCount(4);

  const metrics = await page.evaluate(() => {
    const measure = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        padding: style.padding,
        margin: style.margin,
        left: style.left,
        transform: style.transform,
      };
    };
    return {
      center: measure(".col-center"),
      modeBar: measure(".workspace-mode-bar"),
      composer: measure(".frozen-composer"),
      quickActions: measure(".quick-actions"),
      translation: measure(".conversation-area"),
      rightRail: measure(".col-right"),
      firstAccordion: measure(".accordion-panel"),
    };
  });
  console.log(`FROZEN_METRICS ${JSON.stringify(metrics)}`);
  expect(metrics.center).toMatchObject({ x: 293, y: 86, width: 798, height: 933 });
  expect(metrics.modeBar).toMatchObject({ x: 294, y: 87, width: 776, height: 84 });
  expect(metrics.composer).toMatchObject({ x: 294, y: 171, width: 794, height: 312 });
  expect(metrics.quickActions).toMatchObject({ x: 294, width: 794, height: 110 });
  expect(metrics.translation).toMatchObject({ x: 294, width: 794 });
  expect(metrics.rightRail).toMatchObject({ x: 1211, y: 86, width: 332, height: 933 });

  await testInfo.attach("frozen-light-1543x1019", {
    body: await page.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
});
