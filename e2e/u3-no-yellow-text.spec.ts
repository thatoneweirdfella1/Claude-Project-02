import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "./fixtures";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: named headings are ordinary while money and brand retain gold`, async ({ page }) => {
    const phase = process.env.DIVERGENCE_SHOT_PHASE ?? "after";
    const out = resolve(process.cwd(), "../../out");
    mkdirSync(resolve(out, "shots"), { recursive: true });
    mkdirSync(resolve(out, "measurements"), { recursive: true });
    await page.setViewportSize({ width: 1543, height: 1019 });
    await page.goto("/");
    await page.locator(".leftnav-content").getByRole("button", { name: "Settings", exact: true }).click();
    await page.getByRole("button", { name: "Appearance", exact: true }).click();
    await page.locator(".appearance-settings").getByRole("button", { name: theme === "light" ? "Light" : "Dark", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "Account", exact: true }).click();
    const ordinary = await page.getByRole("heading", { name: "Account", exact: true }).evaluate((el) => getComputedStyle(el).color);
    const gold = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--accent-gold, #e6bf68)";
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await page.getByRole("button", { name: "Personal Optimization", exact: true }).click();
    const title = page.locator(".optimization-panel__title");
    await expect(title).toBeVisible();
    const optimization = await title.evaluate((el) => ({ wrapper: getComputedStyle(el).color, text: getComputedStyle(el.querySelector("h3")!).color }));
    await page.getByTestId("col-center").screenshot({ path: resolve(out, `shots/U3-${theme}-optimization-${phase}.png`) });

    await page.getByRole("button", { name: "Plan & credits", exact: true }).click();
    const creditsPanel = page.locator(".top-up-panel").filter({ hasText: "One-time sandbox credits" });
    const creditsTitle = creditsPanel.locator(":scope > div").first();
    await expect(creditsTitle).toContainText("One-time sandbox credits");
    const plan = await page.locator(".subscription-ui").evaluate((el) => ({
      ordinary: getComputedStyle(el.querySelector("h3")!).color,
      target: getComputedStyle([...el.querySelectorAll(".top-up-panel > div:first-child")].find((node) => node.textContent?.includes("One-time sandbox credits"))!).color,
      paidControls: getComputedStyle([...el.querySelectorAll(".top-up-panel > div:first-child")].find((node) => node.textContent?.includes("Paid-route controls"))!.querySelector("strong")!).color,
      paidControlsIcon: getComputedStyle([...el.querySelectorAll(".top-up-panel > div:first-child")].find((node) => node.textContent?.includes("Paid-route controls"))!.querySelector("svg")!).color,
      paidControlsWrapper: getComputedStyle([...el.querySelectorAll(".top-up-panel > div:first-child")].find((node) => node.textContent?.includes("Paid-route controls"))!).color,
      prices: [...el.querySelectorAll(".tier-card__price")].map((node) => ({ text: node.textContent, color: getComputedStyle(node).color })),
      current: getComputedStyle(el.querySelector(".subscription-ui__current")!).color,
    }));
    await creditsTitle.scrollIntoViewIfNeeded();
    await page.getByTestId("col-center").screenshot({ path: resolve(out, `shots/U3-${theme}-plan-${phase}.png`) });

    // Some money components are conditional or absent from the frozen shell.
    // Render style probes for their real selectors, without enabling a paid path.
    const money = await page.evaluate(() => {
      const host = document.createElement("div");
      host.style.cssText = "position:fixed;left:-10000px;top:0";
      host.innerHTML = '<span class="credit-counter"><strong>Credits</strong></span><span class="cost-confirm__amount">Amount</span><span class="tier-card__price">Price</span><span class="subscription-ui__current">Current</span><span class="subscription-ui__pending">Pending</span>';
      document.body.append(host);
      const selectors = [".credit-counter strong", ".cost-confirm__amount", ".tier-card__price", ".subscription-ui__current", ".subscription-ui__pending"];
      const result = selectors.map((selector) => ({ selector, color: getComputedStyle(host.querySelector(selector)!).color }));
      host.remove();
      return result;
    });
    const brand = await page.locator('[data-testid="logo"] .logo-mark').getAttribute("src");
    const result = { theme, phase, ordinary, gold, optimization, plan, money, brand };
    writeFileSync(resolve(out, `measurements/U3-${theme}-${phase}.json`), JSON.stringify(result, null, 2) + "\n", "utf8");
    console.log(`U3 COLORS ${JSON.stringify(result)}`);

    expect.soft(optimization.wrapper).not.toBe(gold);
    expect.soft(optimization.wrapper).toBe(ordinary);
    expect.soft(optimization.text).not.toBe(gold);
    expect.soft(optimization.text).toBe(ordinary);
    expect.soft(plan.target).not.toBe(gold);
    expect.soft(plan.target).toBe(plan.ordinary);
    expect.soft(plan.ordinary).toBe(ordinary);
    expect.soft(plan.paidControls).toBe(ordinary);
    expect.soft(plan.paidControlsIcon).toBe(gold);
    expect.soft(plan.paidControlsWrapper).toBe(gold);
    expect.soft(plan.current).toBe(gold);
    expect(plan.prices.length).toBeGreaterThan(0);
    for (const price of plan.prices) expect.soft(price.color, price.text ?? "price").toBe(gold);
    for (const item of money) expect.soft(item.color, item.selector).toBe(gold);
    expect(brand).toBe("/logo-mark-gold.png");
  });
}
