import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, type Locator } from "./fixtures";

async function measure(menu: Locator) {
  return menu.evaluate((root) => {
    type Color = [number, number, number, number];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const rgba = (value: string): Color => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const p = ctx.getImageData(0, 0, 1, 1).data;
      return [p[0], p[1], p[2], p[3] / 255];
    };
    const over = (a: Color, b: Color): Color => {
      const alpha = a[3] + b[3] * (1 - a[3]);
      if (!alpha) return [0, 0, 0, 0];
      return [0, 1, 2].map((i) => (a[i] * a[3] + b[i] * b[3] * (1 - a[3])) / alpha).concat(alpha) as Color;
    };
    const luminance = (c: Color) => c.slice(0, 3).map((n) => {
      const s = n / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
    const reading = (el: HTMLElement, text: string, pseudo?: string) => {
      const style = getComputedStyle(el, pseudo);
      let bg: Color = [0, 0, 0, 0];
      const layers: string[] = [];
      for (let node: HTMLElement | null = el; node; node = node.parentElement) {
        const s = getComputedStyle(node);
        if (s.backgroundImage !== "none") throw new Error(`Background image requires pixel measurement: ${node.className}`);
        layers.push(`${node.tagName}.${node.className}: ${s.backgroundColor}`);
        bg = over(bg, rgba(s.backgroundColor));
        if (bg[3] >= 0.999) break;
      }
      if (bg[3] < 0.999) throw new Error("No opaque background resolved; do not guess the marble color");
      const fg = rgba(style.color);
      let opacity = Number(style.opacity);
      for (let node = pseudo ? el : el.parentElement; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
      fg[3] *= opacity;
      const painted = over(fg, bg);
      const light = Math.max(luminance(painted), luminance(bg));
      const dark = Math.min(luminance(painted), luminance(bg));
      return { text, color: style.color, background: bg.slice(0, 3).map(Math.round).join(","), ratio: Number(((light + 0.05) / (dark + 0.05)).toFixed(4)), layers };
    };
    const results: ReturnType<typeof reading>[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent?.trim();
      const el = walker.currentNode.parentElement;
      if (text && el && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden") results.push(reading(el, text));
    }
    for (const input of root.querySelectorAll<HTMLInputElement>("input")) {
      results.push(reading(input, input.value || `Placeholder: ${input.placeholder}`, input.value ? undefined : "::placeholder"));
    }
    return results;
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: actual profile, notifications and search text meets contrast`, async ({ page }) => {
    const phase = process.env.DIVERGENCE_SHOT_PHASE ?? "after";
    const out = resolve(process.cwd(), "../../out");
    mkdirSync(resolve(out, "measurements"), { recursive: true });
    mkdirSync(resolve(out, "shots"), { recursive: true });
    await page.setViewportSize({ width: 1543, height: 1019 });
    await page.goto("/");
    await page.locator(".leftnav-content").getByRole("button", { name: "Settings", exact: true }).click();
    await page.getByRole("button", { name: "Appearance", exact: true }).click();
    await page.locator(".appearance-settings").getByRole("button", { name: theme === "light" ? "Light" : "Dark", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.locator(".leftnav-content").getByRole("button", { name: "Talk to AI", exact: true }).click();
    const all: { menu: string; state: string; text: string; color: string; background: string; ratio: number; layers: string[] }[] = [];
    for (const [name, selector] of [
      ["Profile", '.topbar-popover[role="menu"]'],
      ["Notifications", '.topbar-popover[role="region"]'],
      ["Search", '.topbar-popover[role="search"]'],
    ]) {
      await page.getByTestId("topbar").getByRole("button", { name, exact: true }).click();
      const menu = page.locator(selector);
      await expect(menu).toBeVisible();
      await page.mouse.move(10, 10);
      all.push(...(await measure(menu)).map((r) => ({ menu: name, state: "default", ...r })));
      await menu.screenshot({ path: resolve(out, `shots/U2-${theme}-${name.toLowerCase()}-${phase}.png`) });
      for (const button of await menu.getByRole("button").all()) {
        await button.hover();
        // Let the existing color transition settle before reading its background.
        await page.waitForTimeout(180);
        const text = (await button.innerText()).trim();
        all.push(...(await measure(menu)).filter((r) => r.text === text).map((r) => ({ menu: name, state: "hover", ...r })));
      }
      if (name === "Search") {
        await menu.locator("input").fill("Settings");
        all.push(...(await measure(menu)).map((r) => ({ menu: name, state: "typed", ...r })));
      }
      await page.keyboard.press("Escape");
    }
    writeFileSync(resolve(out, `measurements/U2-${theme}-${phase}.json`), JSON.stringify(all, null, 2) + "\n", "utf8");
    console.log(`U2 MEASUREMENTS ${theme} ${phase} ${JSON.stringify(all)}`);
    expect(all.length).toBeGreaterThan(0);
    for (const r of all) expect.soft(r.ratio, `${theme} ${r.menu} ${r.state}: ${r.text} (${r.color} on ${r.background})`).toBeGreaterThanOrEqual(4.5);
  });
}
