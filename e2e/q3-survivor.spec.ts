import { test, expect } from "./fixtures";
import { resolve } from "node:path";

const providers = [
  { id: "groq", label: "Groq" }, { id: "google", label: "Google (Gemini)" },
  { id: "cloudflare", label: "Cloudflare Workers AI" }, { id: "huggingface", label: "Hugging Face" },
  { id: "openrouter", label: "OpenRouter" },
];
for (const survivor of providers) {
  test(`Q3: the normal conversation can answer with only ${survivor.id} surviving`, async ({ page }) => {
    const handlerUrl = new URL("../src/services/proxyHandler.ts", import.meta.url);
    handlerUrl.searchParams.set("testScenario", "Q3-survivor-" + survivor.id);
    const { handleProxyRequest } = await import(handlerUrl.href) as typeof import("../src/services/proxyHandler");
    const env = Object.fromEntries(["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY",
      "GROQ_API_KEY", "GOOGLE_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"]
      .map((name) => [name, crypto.randomUUID()]));
    const calls: string[] = [];
    await page.route("**/api/provider-status*", (route) => route.fulfill({ json: {
      ...Object.fromEntries(providers.map((provider) => [provider.id, true])), freePoolAvailable: true,
    } }));
    await page.route("**/api/proxy*", async (route) => {
      expect(new URL(route.request().url()).pathname).toBe("/api/proxy");
      const body = route.request().postDataJSON();
      expect(body.freePool).toBe(true);
      const freePoolBudgets = providers.filter((provider) => provider.id !== survivor.id)
        .map((provider) => ({ provider: provider.id, exhaustedAt: Date.now(), resetAt: Number.MAX_SAFE_INTEGER }));
      const response = await handleProxyRequest(new Request(route.request().url(), { method: "POST",
        body: JSON.stringify({ ...body, freePoolBudgets, model: "claude-opus-4-8", fallbackProvider: "openai", paidFallbackEnabled: true }),
      }), env.ANTHROPIC_API_KEY, async (url) => {
        const host = new URL(String(url)).hostname;
        const id = host === "api.groq.com" ? "groq" : host === "generativelanguage.googleapis.com" ? "google"
          : host === "openrouter.ai" ? "openrouter" : host === "api.cloudflare.com" ? "cloudflare"
            : host === "router.huggingface.co" ? "huggingface" : "paid";
        calls.push(id);
        return Response.json(id === "google"
          ? { candidates: [{ content: { parts: [{ text: "Mock survivor answer: " + survivor.label }] } }], usageMetadata: { promptTokenCount: 6, candidatesTokenCount: 3 } }
          : { choices: [{ message: { content: "Mock survivor answer: " + survivor.label } }], usage: { prompt_tokens: 6, completion_tokens: 3 } });
      }, env);
      await route.fulfill({ status: response.status, contentType: "application/json", body: await response.text() });
    });
    await page.goto("/");
    await page.getByLabel("What's on your mind?").fill("so umm i was wondering, what temperature does water boil at? like at sea level i guess");
    await page.locator(".translate-ask-button").click();
    const review = page.getByRole("dialog", { name: "Review AI-ready request" });
    await review.getByRole("button", { name: "Send to AI", exact: true }).click();
    await expect(page.locator(".message-bubble--assistant").last()).toContainText("Mock survivor answer: " + survivor.label);
    expect(calls).toEqual([survivor.id]);
    await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
    await page.getByRole("button", { name: "AI Connections", exact: true }).click();
    await expect(page.getByTestId("free-pool-result")).toContainText(survivor.label);
    await expect(page.getByTestId("free-pool-result")).toContainText("No Divergence credits");
    await page.screenshot({ path: resolve(process.cwd(), "../../out/Q3-survivor-" + survivor.id + ".png"), fullPage: true });
  });
}
