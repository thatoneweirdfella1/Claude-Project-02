import { test, expect } from "./fixtures";
import { handleProxyRequest } from "../src/services/proxyHandler";
import { resolve } from "node:path";

test("S3 mocked free team exposes shared text, both conflicting claims and changes", async ({ page }) => {
  // Explicit fixture environment; machine/deployment keys cannot affect this mock.
  const names = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "NVIDIA_API_KEY"];
  const env = Object.fromEntries(names.map((name) => [name, ""]));
  for (const name of ["GROQ_API_KEY", "GOOGLE_API_KEY", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"]) env[name] = crypto.randomUUID();
  const calls = new Map<string, number>();
  let paidCalls = 0;
  let teamEnabled = false;
  await page.route("**/api/provider-status*", (route) => route.fulfill({ json: {
    groq: teamEnabled, google: teamEnabled, cloudflare: teamEnabled, openai: teamEnabled, freePoolAvailable: teamEnabled,
  } }));
  await page.route("**/api/proxy-*", (route) => { paidCalls += 1; return route.abort(); });
  await page.route("**/api/proxy", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.freePool).toBe(true);
    const response = await handleProxyRequest(new Request(route.request().url(), { method: "POST", body: route.request().postData() }), undefined, async (url) => {
      const host = new URL(String(url)).hostname;
      const provider = host === "api.groq.com" ? "groq" : host === "generativelanguage.googleapis.com" ? "google" : host === "api.cloudflare.com" ? "cloudflare" : "paid";
      if (provider === "paid") { paidCalls += 1; return Response.json({}, { status: 500 }); }
      const round = (calls.get(provider) ?? 0) + 1; calls.set(provider, round);
      const claim = provider === "google" && round === 2 ? "Mock claim: do not adopt option A." : "Mock claim: adopt option A.";
      const text = "Mock shared claim: compare the evidence.\n\n" + claim;
      return Response.json(provider === "google" ? { candidates: [{ content: { parts: [{ text }] } }] } : { choices: [{ message: { content: text } }] });
    }, env);
    await route.fulfill({ status: response.status, contentType: "application/json", body: await response.text() });
  });
  await page.goto("/");
  await page.getByLabel("What's on your mind?").fill("SYNTHETIC_QUESTION");
  await page.locator(".translate-ask-button").click();
  await page.getByRole("dialog", { name: "Review AI-ready request" }).getByRole("button", { name: "Copy only", exact: true }).click();
  teamEnabled = true;
  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  await page.getByRole("button", { name: "Start free team", exact: true }).click();
  const view = page.getByTestId("team-view");
  await expect(view.getByRole("heading", { name: "What they agreed on", exact: true })).toBeVisible();
  const agreement = view.locator('[data-team-part="agreement"]');
  for (const name of ["Groq", "Gemini", "Cloudflare"]) await expect(agreement).toContainText(name);
  await expect(agreement).toContainText("Mock shared claim: compare the evidence.");
  const disagreement = view.locator('[data-team-part="disagreement"]');
  await expect(disagreement).toContainText("Mock claim: adopt option A.");
  await expect(disagreement).toContainText("Mock claim: do not adopt option A.");
  await expect(view.locator('[data-team-part="changed"]')).toContainText("Gemini");
  expect([...calls.entries()].sort()).toEqual([["cloudflare", 2], ["google", 2], ["groq", 2]]);
  expect(paidCalls).toBe(0);
  expect(await view.locator("details").count()).toBe(0);
  await page.setViewportSize({ width: 1440, height: 1400 });
  await view.screenshot({ path: resolve(process.cwd(), "../../out/S3-team-merge.png") });
});
