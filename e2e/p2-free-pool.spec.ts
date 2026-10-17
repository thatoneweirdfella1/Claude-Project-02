import { test, expect } from "./fixtures";
import { handleProxyRequest } from "../src/services/proxyHandler";
import { resolve } from "node:path";

test("P2: the real pool hands off a mocked limit and names the answering provider on screen", async ({ page }) => {
  const env = Object.fromEntries(["GROQ_API_KEY", "GOOGLE_API_KEY", "OPENROUTER_API_KEY", "OPENAI_API_KEY"].map((name) => [name, crypto.randomUUID()]));
  const calls: string[] = [];
  await page.route("**/api/provider-status*", (route) => route.fulfill({ json: {
    anthropic: true, openai: true, google: true, groq: true, openrouter: true, freePoolAvailable: true,
  } }));
  await page.route("**/api/proxy", async (route) => {
    const response = await handleProxyRequest(new Request(route.request().url(), {
      method: "POST", body: route.request().postData(),
    }), crypto.randomUUID(), async (url) => {
      const host = new URL(String(url)).hostname;
      const id = host.includes("groq") ? "groq" : host.includes("googleapis") ? "google" : "paid";
      calls.push(id);
      return id === "groq"
        ? Response.json({ error: "daily quota exhausted" }, { status: 429 })
        : Response.json({ candidates: [{ content: { parts: [{ text: "Mock free answer from Google." }] } }], usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 4 } });
    }, env);
    await route.fulfill({ status: response.status, contentType: "application/json", body: await response.text() });
  });
  await page.goto("/");
  await page.getByLabel("What's on your mind?").fill("so umm i was wondering, what temperature does water boil at? like at sea level i guess");
  await page.locator(".translate-ask-button").click();
  const review = page.getByRole("dialog", { name: "Review AI-ready request" });
  await expect(review).toBeVisible();
  await review.getByRole("button", { name: "Send to AI", exact: true }).click();
  await expect(page.locator(".message-bubble--assistant").last()).toContainText("Mock free answer from Google.");
  expect(calls).toEqual(["groq", "google"]);
  await page.getByTestId("col-left").getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "AI Connections", exact: true }).click();
  const status = page.getByTestId("free-pool-result");
  await expect(status).toContainText("Google (Gemini)");
  await expect(status).toContainText("Hand-off");
  await expect(status).toContainText("No Divergence credits");
  await page.screenshot({ path: resolve(process.cwd(), "../../out/P2-free-pool.png"), fullPage: true });
});
