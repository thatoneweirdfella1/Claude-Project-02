import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, type Page } from "./fixtures";

const menus = [
  { name: "All Tools", button: (p: Page) => p.getByTestId("col-left").getByRole("button", { name: "All Tools", exact: true }), panel: ".leftnav-tools__popup" },
  { name: "Search", button: (p: Page) => p.getByTestId("topbar").getByRole("button", { name: "Search", exact: true }), panel: ".topbar-popover--search" },
  { name: "Notifications", button: (p: Page) => p.getByTestId("topbar").getByRole("button", { name: "Notifications", exact: true }), panel: ".topbar-popover[role='region']" },
  { name: "Profile", button: (p: Page) => p.locator(".topbar-user-menu > button"), panel: ".topbar-popover[role='menu']" },
  { name: "Quick Reference", button: (p: Page) => p.getByTestId("topbar").getByRole("button", { name: "Quick Reference", exact: true }), panel: ".right-rail-reference[aria-label='Quick Reference']" },
  { name: "Help", button: (p: Page) => p.getByTestId("topbar").getByRole("button", { name: "Help", exact: true }), panel: ".right-rail-reference[aria-label='Help']" },
  { name: "System Status", button: (p: Page) => p.getByTestId("system-status"), panel: ".system-status-popover" },
];

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1543, height: 1019 });
  await page.goto("/");
  await expect(page.getByTestId("topbar")).toBeVisible();
});

test("All Tools closes when Search opens, leaving just Search visible", async ({ page }) => {
  await menus[0].button(page).click();
  await expect(page.locator(menus[0].panel)).toBeVisible();
  await menus[1].button(page).click();
  await expect(page.locator(menus[0].panel)).toBeHidden();
  await expect(page.locator(menus[1].panel)).toBeVisible();
  const shots = resolve(process.cwd(), "../../out/shots");
  mkdirSync(shots, { recursive: true });
  await page.screenshot({ path: resolve(shots, "V1-two-menus.png") });
});

test("every ordered pair of shell menus leaves only the second menu open", async ({ page }) => {
  test.setTimeout(90_000);
  for (const first of menus) {
    for (const second of menus) {
      if (first === second) continue;
      await first.button(page).click();
      await expect(page.locator(first.panel), first.name).toBeVisible();
      await second.button(page).click();
      await expect(page.locator(first.panel), first.name + " after " + second.name).toBeHidden();
      await expect(page.locator(second.panel), second.name).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator(second.panel)).toBeHidden();
    }
  }
});

for (const menu of menus) {
  test(menu.name + " closes on the page background and Escape", async ({ page }) => {
    await menu.button(page).click();
    await expect(page.locator(menu.panel)).toBeVisible();
    await page.mouse.click(20, 20);
    await expect(page.locator(menu.panel)).toBeHidden();
    await menu.button(page).click();
    await expect(page.locator(menu.panel)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(menu.panel)).toBeHidden();
  });

  test(menu.name + " opens and closes with its own button twice", async ({ page }) => {
    for (let cycle = 0; cycle < 2; cycle++) {
      await menu.button(page).click();
      await expect(page.locator(menu.panel)).toBeVisible();
      await menu.button(page).click();
      await expect(page.locator(menu.panel)).toBeHidden();
    }
  });
}

test("controls inside Search and All Tools keep their menu open", async ({ page }) => {
  await menus[1].button(page).click();
  const search = page.locator(menus[1].panel);
  await search.locator("input").fill("Settings");
  await search.locator("input").click();
  await expect(search).toBeVisible();
  await expect(search.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
  await menus[0].button(page).click();
  const tools = page.locator(menus[0].panel);
  await tools.getByRole("button", { name: "Pin Variables", exact: true }).click();
  await expect(tools).toBeVisible();
  await expect(tools.getByRole("button", { name: "Unpin Variables", exact: true })).toBeVisible();
});

test("right-rail content is inside its menu and its close button resets the trigger", async ({ page }) => {
  for (const menu of menus.filter((m) => m.name === "Quick Reference" || m.name === "Help")) {
    await menu.button(page).click();
    const panel = page.locator(menu.panel);
    await panel.locator("p").click();
    await expect(panel).toBeVisible();
    await panel.getByRole("button", { name: "Close reference", exact: true }).click();
    await expect(panel).toBeHidden();
    await expect(menu.button(page)).toHaveAttribute("aria-expanded", "false");
    await menu.button(page).click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
  }
});

test("keyboard openings also replace sidebar and top-bar menus", async ({ page }) => {
  await menus[0].button(page).click();
  await page.keyboard.press("Control+k");
  await expect(page.locator(menus[0].panel)).toBeHidden();
  await expect(page.locator(menus[1].panel)).toBeVisible();
  await menus[2].button(page).click();
  await page.keyboard.press("?");
  await expect(page.locator(menus[2].panel)).toBeHidden();
  await expect(page.locator(menus[4].panel)).toBeVisible();
});

