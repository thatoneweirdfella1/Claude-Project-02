import { test, expect } from "@playwright/test";

test("approved frozen conversation-first frame at canonical viewport", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1543, height: 1019 });
  await page.route("**/api/verify-access", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ requiresPassword: false, ok: true }) }));
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-layout", "gold");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-layout-authority", "frozen-reference-2026-08-10");
  await expect(page.locator("[data-screen='translate']")).toHaveClass(/leftnav-item--active/);
  await expect(page.locator(".quick-tools-tile__button")).toHaveCount(0);
  await expect(page.locator(".accordion-panel.is-open")).toHaveCount(0);
  await expect(page.getByText("12,847", { exact: true })).toHaveCount(0);
  await expect(page.getByText("TS-2024-001247", { exact: true })).toHaveCount(0);
  await expect(page.locator(".frozen-connectors circle")).toHaveCount(4);

  const metrics = await page.evaluate(() => {
    const box = (selector: string) => {
      const node = document.querySelector<HTMLElement>(selector);
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
    };
    return {
      center: box(".col-center"), conversation: box(".conversation-area"), composer: box(".frozen-composer"),
      quickActions: box(".quick-actions"), rightRail: box(".col-right"), firstAccordion: box(".accordion-panel"),
    };
  });
  expect(metrics.center).toMatchObject({ x: 238, y: 60, width: 987, height: 959 });
  expect(metrics.rightRail).toMatchObject({ x: 1243, y: 60, width: 300, height: 959 });
  expect(metrics.quickActions?.height).toBe(26);
  expect(metrics.firstAccordion?.height).toBe(26);
  expect(metrics.conversation!.y).toBeLessThan(metrics.composer!.y);

  await testInfo.attach("frozen-light-1543x1019", { body: await page.screenshot({ animations: "disabled" }), contentType: "image/png" });
});
