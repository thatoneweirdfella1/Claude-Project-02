import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, type Locator } from "./fixtures";
import { installModelMocks } from "./mocks";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: words use ordinary colors while money and icons retain gold`, async ({ page }) => {
    test.setTimeout(90_000);
    const phase = process.env.DIVERGENCE_SHOT_PHASE ?? "after";
    const out = resolve(process.cwd(), "../../out");
    mkdirSync(resolve(out, "shots"), { recursive: true });
    mkdirSync(resolve(out, "measurements"), { recursive: true });
    await page.setViewportSize({ width: 1543, height: 1019 });
    await installModelMocks(page, { answerText: "No model request is needed for color checks." });
    await page.goto("/");
    await page.getByTestId("visibility-gear").click();
    await page.getByTestId("theme-toggle").getByRole("radio", { name: theme === "light" ? "Light" : "Dark", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const palette = await page.evaluate(() => {
      const probe = document.createElement("span");
      document.body.append(probe);
      const color = (value: string) => {
        probe.style.color = value;
        return getComputedStyle(probe).color;
      };
      const result = { ordinary: color("var(--frozen-text)"), muted: color("var(--frozen-muted)"), gold: color("var(--accent-gold, #e6bf68)"), frozenGold: color("var(--frozen-gold-bright)") };
      probe.remove();
      return result;
    });
    const words: { name: string; actual: string; expected: string }[] = [];
    const icons: typeof words = [];
    const read = async (name: string, node: Locator, expected = palette.ordinary, target = words) => {
      await expect(node, name).toBeVisible();
      target.push({ name, actual: await node.evaluate((el) => getComputedStyle(el).color), expected });
    };
    const shot = async (name: string, node: Locator) => {
      await node.screenshot({ path: resolve(out, `shots/V2-${theme}-${name}-${phase}.png`), animations: "disabled" });
    };

    for (const name of ["Quick Reference", "Search", "Templates", "Notifications", "Help", "Settings", "Profile"]) {
      const button = page.getByTestId("topbar").getByRole("button", { name, exact: true });
      const normal = palette.ordinary;
      await read(`Top bar: ${name}`, button, normal);
      await read(`Top bar icon: ${name}`, button.locator("svg").first(), theme === "dark" ? palette.frozenGold : normal, icons);
    }
    await shot("topbar", page.getByTestId("topbar"));
    await read("What's on your mind?", page.locator(".frozen-composer__heading h2"));
    await read("Conversation", page.locator(".conversation-area__heading h2"));
    await shot("composer-heading", page.locator(".frozen-composer__heading"));
    await shot("conversation-heading", page.locator(".conversation-area__heading"));
    // Enable Send by typing locally; never send, purchase or call a provider.
    await page.locator(".frozen-composer textarea").fill("Color preview only");
    await read("Send", page.getByRole("button", { name: "Send", exact: true }));
    await read("Send icon", page.locator(".translate-ask-button svg"), theme === "dark" ? palette.frozenGold : palette.ordinary, icons);
    await shot("send", page.locator(".translate-ask-button"));

    await page.getByTestId("visibility-gear").click();
    await page.getByRole("checkbox", { name: "Quick Tools", exact: true }).check();
    await page.keyboard.press("Escape");
    await read("Quick Tools", page.locator(".quick-tools__header-label"));
    await read("Quick Tools icon", page.locator(".quick-tools__header > svg"), theme === "dark" ? palette.frozenGold : palette.ordinary, icons);
    await shot("quick-tools", page.locator(".quick-tools__header"));

    await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
    await page.getByRole("button", { name: "Plan & credits", exact: true }).click();
    const paid = page.locator(".top-up-panel").filter({ hasText: "Paid-route controls" });
    await read("Paid-route controls", paid.locator(":scope > div:first-child strong"));
    await read("Paid-route controls icon", paid.locator(":scope > div:first-child svg"), palette.gold, icons);
    await shot("paid-route-controls", paid);
    const oneTime = page.locator(".top-up-panel").filter({ hasText: "One-time sandbox credits" });
    await read("Existing ordinary one-time credits heading", oneTime.locator(":scope > div:first-child strong"));
    const prices = await page.locator(".tier-card__price").evaluateAll((nodes) => nodes.map((el) => ({ text: el.textContent, color: getComputedStyle(el).color })));
    const plan = await page.locator(".subscription-ui__current").evaluate((el) => getComputedStyle(el).color);
    const brand = await page.locator('[data-testid="logo"] .logo-mark').getAttribute("src");

    // These selectors have no mounted component in the current shell. Show
    // explicit CSS fixtures, not invented screenshots of a production screen.
    await page.evaluate(() => {
      const host = document.createElement("section");
      host.id = "v2-legacy-fixture";
      host.style.cssText = "position:fixed;left:48px;top:48px;width:650px;padding:24px;z-index:30000;background:var(--frozen-overlay-solid);color:var(--frozen-text);border:1px solid var(--frozen-border)";
      host.innerHTML = '<p>CSS fixtures: selectors not mounted in the current app</p><p>.quick-actions__header</p><div class="quick-actions__header">Quick Actions</div><p>.reference-quality h4</p><div class="reference-quality"><h4>Response quality</h4></div><p>Unmounted SubscriptionUI: Buy Credits</p><div class="top-up-panel"><div><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/></svg><strong>Buy Credits</strong></div></div>';
      document.body.append(host);
    });
    const legacy = page.locator("#v2-legacy-fixture");
    await read("Legacy Quick Actions heading", legacy.locator(".quick-actions__header"));
    await read("Legacy response quality heading", legacy.locator(".reference-quality h4"));
    await read("Legacy Buy Credits heading", legacy.locator(".top-up-panel strong"));
    await read("Legacy Buy Credits icon", legacy.locator(".top-up-panel svg"), palette.gold, icons);
    await shot("legacy-word-selectors", legacy);
    await legacy.evaluate((el) => el.remove());

    // Conditional/unused money selectors stay testable without enabling any
    // financial path. The real tier prices and current plan were read above.
    const money = await page.evaluate(() => {
      const host = document.createElement("div");
      host.style.cssText = "position:fixed;left:-10000px;top:0";
      host.innerHTML = '<span class="credit-counter"><strong>$12.00</strong></span><span class="cost-confirm__amount">$0.05</span><span class="subscription-ui__pending">Payment pending</span><span class="topbar-popover__account-summary"><span>Plus</span></span><span class="conversation-area__heading"><strong>Badge</strong></span>';
      document.body.append(host);
      const selectors = [".credit-counter strong", ".cost-confirm__amount", ".subscription-ui__pending", ".topbar-popover__account-summary span", ".conversation-area__heading strong"];
      const result = selectors.map((selector) => ({ selector, color: getComputedStyle(host.querySelector(selector)!).color }));
      host.remove();
      return result;
    });
    const result = { theme, phase, palette, words, icons, prices, plan, brand, money };
    writeFileSync(resolve(out, `measurements/V2-${theme}-${phase}.json`), JSON.stringify(result, null, 2) + "\n", "utf8");
    console.log(`V2 COLORS ${JSON.stringify(result)}`);
    for (const item of words) expect.soft(item.actual, item.name).toBe(item.expected);
    for (const item of icons) expect.soft(item.actual, item.name).toBe(item.expected);
    expect(prices.length).toBeGreaterThan(0);
    for (const price of prices) expect.soft(price.color, price.text ?? "price").toBe(palette.gold);
    expect.soft(plan).toBe(palette.gold);
    expect(brand).toBe("/logo-mark-gold.png");
    for (const item of money) expect.soft(item.color, item.selector).toBe(item.selector.includes("conversation-area") ? (theme === "dark" ? palette.frozenGold : palette.ordinary) : palette.gold);
  });
}
