import { test, expect } from "@playwright/test";

test("frozen light reference audit at the approved logical canvas", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1600, height: 1024 });
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
    "approved-gold-1600x1024-v2",
  );

  await expect(page.locator("[data-screen='translate']")).toHaveClass(/leftnav-item--active/);
  await expect(page.locator(".quick-tools-tile__button")).toHaveCount(0);
  await expect(page.locator(".accordion-panel.is-open")).toHaveCount(1);
  await expect(page.getByText("Context Snapshot", { exact: true })).toBeVisible();
  await expect(page.locator(".frozen-connectors circle")).toHaveCount(4);

  const metrics = await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>(".app-shell")!.getBoundingClientRect();
    const matrix = new DOMMatrixReadOnly(getComputedStyle(document.querySelector<HTMLElement>(".app-shell")!).transform);
    const scale = matrix.a;
    const measure = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {
        x: Math.round((box.x - shell.x) / scale),
        y: Math.round((box.y - shell.y) / scale),
        width: Math.round(box.width / scale),
        height: Math.round(box.height / scale),
      };
    };
    return {
      center: measure(".col-center"),
      heading: measure(".frozen-workspace-heading"),
      composer: measure(".frozen-composer"),
      quickActions: measure(".quick-actions"),
      translation: measure(".conversation-area"),
      rightRail: measure(".col-right"),
      firstAccordion: measure(".accordion-panel"),
    };
  });
  console.log(`FROZEN_METRICS ${JSON.stringify(metrics)}`);
  expect(metrics.center).toMatchObject({ x: 302, y: 84, width: 826, height: 928 });
  expect(metrics.heading).toMatchObject({ x: 318, y: 100, width: 794, height: 44 });
  expect(metrics.translation).toMatchObject({ x: 318, y: 152, width: 794, height: 420 });
  expect(metrics.composer).toMatchObject({ x: 318, y: 580, width: 794, height: 350 });
  expect(metrics.quickActions).toMatchObject({ x: 318, y: 972, width: 794, height: 26 });
  expect(metrics.rightRail).toMatchObject({ x: 1252, y: 84, width: 348, height: 928 });

  await testInfo.attach("approved-light-1600x1024", {
    body: await page.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
});
