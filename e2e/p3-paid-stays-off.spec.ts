import { test, expect } from "./fixtures";
import { resolve } from "node:path";

test("P3: exhausted free requests and retries stay local with paid fallback and paid model overrides", async ({ page }) => {
  const handlerUrl = new URL("../src/services/proxyHandler.ts", import.meta.url);
  handlerUrl.searchParams.set("testScenario", "Q3-all-exhausted");
  const { handleProxyRequest } = await import(handlerUrl.href) as typeof import("../src/services/proxyHandler");
  const env = Object.fromEntries(["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"].map((name) => [name, crypto.randomUUID()]));
  let paidCalls = 0;
  let freeCalls = 0;
  await page.route("**/api/provider-status*", (route) => route.fulfill({ json: {
    anthropic: true, openai: true, google: true, groq: true, openrouter: true, huggingface: true, cloudflare: true, xai: true, deepseek: true, freePoolAvailable: true,
  } }));
  await page.route("**/api/proxy*", async (route) => {
    if (new URL(route.request().url()).pathname !== "/api/proxy") {
      paidCalls += 1;
      await route.fulfill({ status: 500, json: {} });
      return;
    }
    const body = { ...route.request().postDataJSON(), model: "claude-opus-4-8", provider: "anthropic", fallbackProvider: "openai", paidFallbackEnabled: true };
    const response = await handleProxyRequest(new Request(route.request().url(), { method: "POST", body: JSON.stringify(body) }), env.ANTHROPIC_API_KEY, async (url) => {
      const host = new URL(String(url)).hostname;
      if (["api.groq.com", "generativelanguage.googleapis.com", "openrouter.ai", "router.huggingface.co", "api.cloudflare.com"].includes(host)) freeCalls += 1;
      else paidCalls += 1;
      return Response.json({ error: "daily quota exhausted" }, { status: 429 });
    }, env);
    await route.fulfill({ status: response.status, contentType: "application/json", body: await response.text() });
  });
  await page.goto("/");
  await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "AI Connections", exact: true }).click();
  await page.getByLabel("Paid fallback", { exact: true }).check();
  await page.getByTestId("col-left").getByRole("button", { name: /talk to ai/i }).click();
  await page.getByLabel("What's on your mind?").fill("so umm i was wondering, what temperature does water boil at? like at sea level i guess");
  let attemptsAfterExhaustion = 0;
  for (let retry = 0; retry < 3; retry += 1) {
    await page.locator(".translate-ask-button").click();
    const review = page.getByRole("dialog", { name: "Review AI-ready request" });
    await review.getByRole("button", { name: "Send to AI", exact: true }).click();
    await expect(review.getByRole("button", { name: "Copy only", exact: true })).toBeVisible();
    expect(paidCalls).toBe(0);
    if (retry === 0) { expect(freeCalls).toBe(5); attemptsAfterExhaustion = freeCalls; }
    else expect(freeCalls).toBe(attemptsAfterExhaustion);
    await review.getByRole("button", { name: "Back", exact: true }).click();
  }
  await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "AI Connections", exact: true }).click();
  await expect(page.getByTestId("free-pool-result")).toContainText("No free provider");
  await expect(page.getByTestId("free-pool-result")).toContainText("local no-charge");
  await page.screenshot({ path: resolve(process.cwd(), "../../out/P3-paid-stays-off.png"), fullPage: true });
});
