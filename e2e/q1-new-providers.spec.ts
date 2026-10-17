import { test, expect } from "./fixtures";
import { resolve } from "node:path";

const slots = [
  { provider: "cloudflare", label: "Cloudflare Workers AI", model: "@cf/meta/llama-3.1-8b-instruct",
    variable: "CLOUDFLARE_API_TOKEN", limitedModel: "llama-3.3-70b-versatile", limitedProvider: "groq", limitedVariable: "GROQ_API_KEY" },
  { provider: "huggingface", label: "Hugging Face", model: "meta-llama/Llama-3.3-70B-Instruct",
    variable: "HF_TOKEN", limitedModel: "gemini-flash", limitedProvider: "google", limitedVariable: "GOOGLE_API_KEY" },
] as const;

for (const slot of slots) {
  test(`Q1: normal conversation hands off to ${slot.provider} and shows the answering slot`, async ({ page }) => {
    // Each scenario represents a separate server; do not inherit another file's cooldowns.
    const handlerUrl = new URL("../src/services/proxyHandler.ts", import.meta.url);
    handlerUrl.searchParams.set("testScenario", "Q1-" + slot.provider);
    const { handleProxyRequest } = await import(handlerUrl.href) as typeof import("../src/services/proxyHandler");
    const env = { [slot.variable]: crypto.randomUUID(), [slot.limitedVariable]: crypto.randomUUID(),
      CLOUDFLARE_ACCOUNT_ID: "test-account" };
    const calls: string[] = [];
    await page.route("**/api/provider-status*", (route) => route.fulfill({ json: {
      [slot.provider]: true, [slot.limitedProvider]: true, freePoolAvailable: true,
    } }));
    await page.route("**/api/proxy*", async (route) => {
      expect(new URL(route.request().url()).pathname).toBe("/api/proxy");
      const input = route.request().postDataJSON();
      expect(input.freePool).toBe(true);
      const response = await handleProxyRequest(new Request(route.request().url(), {
        method: "POST", body: JSON.stringify({ ...input, poolModels: [slot.limitedModel, slot.model] }),
      }), undefined, async (url) => {
        const host = new URL(String(url)).hostname;
        const provider = host === "api.groq.com" ? "groq" : host === "generativelanguage.googleapis.com" ? "google"
          : host === "api.cloudflare.com" ? "cloudflare" : host === "router.huggingface.co" ? "huggingface" : "paid";
        calls.push(provider);
        return provider === slot.limitedProvider ? Response.json({ error: "daily quota exhausted" }, { status: 429 })
          : Response.json({ choices: [{ message: { content: "Mock free answer from " + slot.label + "." } }],
            usage: { prompt_tokens: 9, completion_tokens: 4 } });
      }, env);
      await route.fulfill({ status: response.status, contentType: "application/json", body: await response.text() });
    });
    await page.goto("/");
    await page.getByLabel("What's on your mind?").fill("so umm i was wondering, what temperature does water boil at? like at sea level i guess");
    await page.locator(".translate-ask-button").click();
    const review = page.getByRole("dialog", { name: "Review AI-ready request" });
    await review.getByRole("button", { name: "Send to AI", exact: true }).click();
    await expect(page.locator(".message-bubble--assistant").last()).toContainText("Mock free answer from " + slot.label);
    expect(calls).toEqual([slot.limitedProvider, slot.provider]);
    await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
    await page.getByRole("button", { name: "AI Connections", exact: true }).click();
    await expect(page.getByTestId("free-pool-result")).toContainText(slot.label);
    await expect(page.getByTestId("free-pool-result")).toContainText("Hand-off");
    await expect(page.getByTestId("free-pool-result")).toContainText("No Divergence credits");
    await expect(page.getByTestId("provider-status-" + slot.provider)).toContainText("Configured");
    await page.screenshot({ path: resolve(process.cwd(), "../../out/Q1-" + slot.provider + ".png"), fullPage: true });
  });
}
