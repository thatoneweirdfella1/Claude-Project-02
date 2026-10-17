import { expect, test, type Page } from "./fixtures";
import { installModelMocks } from "./mocks";

async function restore(page: Page) {
  const button = page.getByRole("button", { name: "Restore last work", exact: true });
  await expect(button.or(page.locator(".app-shell"))).toBeVisible();
  if (await button.isVisible()) await button.click();
}

async function plan(page: Page) {
  await page.locator(".leftnav-item").filter({ hasText: "Settings" }).click();
  await page.getByRole("button", { name: "Plan & credits", exact: true }).click();
}

async function account(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open("divergence-ai", 1);
      open.onsuccess = () => resolve(open.result); open.onerror = () => reject(open.error);
    });
    const value = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const read = db.transaction("state").objectStore("state").get("account");
      read.onsuccess = () => resolve(read.result); read.onerror = () => reject(read.error);
    });
    db.close(); return value;
  });
}

test("M5: a complete debate bills measured use, displays it, and survives reload", async ({ page }, testInfo) => {
  await installModelMocks(page, { answerText: "Measured answer" });
  await page.route("**/api/provider-status", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ anthropic: true, openai: true }) }));
  await page.route("**/api/account", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, user: null }) }));
  const models: string[] = [];
  await page.route("**/api/proxy", async (route) => {
    const body = route.request().postDataJSON() as { model: string };
    models.push(body.model);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ content: [{ type: "text", text: "Claude measured argument" }], usage: { input_tokens: 500, output_tokens: 1000 } }) });
  });
  await page.route("**/api/proxy-openai", async (route) => {
    const body = route.request().postDataJSON() as { model: string };
    models.push(body.model);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: "Partner measured argument", usage: { inputTokens: 500, outputTokens: 1000 } }) });
  });
  await page.goto("/"); await restore(page);
  await page.getByLabel("What's on your mind?").fill("What practical plan should we build?");
  await page.locator(".translate-ask-button").click();
  await page.getByRole("dialog", { name: "State change suggested" }).getByRole("button", { name: "Accept & Continue", exact: true }).click();
  await page.getByRole("dialog", { name: "Review AI-ready request" }).getByRole("button", { name: "Copy only", exact: true }).click();
  await plan(page);
  await page.getByRole("button", { name: "Start Plus sandbox checkout", exact: true }).click();
  await page.getByRole("button", { name: "Apply verified sandbox callback", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("No real payment was processed");
  await page.locator(".leftnav-item").filter({ hasText: "Talk to AI" }).click();
  await page.getByRole("button", { name: /MULTI-AI ACTIONS/i }).click();
  await page.getByRole("button", { name: "Start debate", exact: true }).click();
  const confirm = page.getByRole("dialog", { name: "Confirm AI Cost" });
  await expect(confirm).toBeVisible();
  const estimatedText = await confirm.locator(".cost-confirm__amount").innerText();
  await confirm.getByRole("button", { name: /Continue for up to \$0.08/ }).click();
  await expect(page.getByTestId("debate-view")).toContainText("Partner measured argument");
  await expect.poll(async () => (await account(page)).creditBalance).toBe(10.47);
  expect(models.sort()).toEqual(["claude-sonnet-5", "gpt-5.5"]);
  const saved = await account(page);
  const records = saved.creditAuthorizations as Array<{ estimatedCost: number; actualCost: number; billedCost: number; models: unknown[] }>;
  expect(records).toHaveLength(1);
  expect(records[0].actualCost).toBe(0.03);
  expect(records[0].billedCost).toBe(0.03);
  expect(records[0].estimatedCost).not.toBe(0.03);
  expect(estimatedText).toContain(records[0].estimatedCost.toFixed(4));
  const usage = saved.autoSelectUsageLogs as Array<{ estimatedCost: number; actualCost: number; billedCost: number }>;
  expect(usage).toHaveLength(1);
  expect(usage[0]).toMatchObject({ estimatedCost: records[0].estimatedCost, actualCost: 0.03, billedCost: 0.03 });
  await plan(page);
  await expect(page.locator(".settings-item").filter({ hasText: "settled" })).toContainText("actual $0.03");
  await page.locator(".settings-item").filter({ hasText: "settled" }).screenshot({ path: testInfo.outputPath("M5-measured-receipt.png") });
  // Simulate losing the account projection after the authoritative charge
  // was committed. Startup must repair it without dispatching again.
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open("divergence-ai", 1);
      open.onsuccess = () => resolve(open.result); open.onerror = () => reject(open.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("state", "readwrite"); const store = tx.objectStore("state");
      const read = store.get("account");
      read.onsuccess = () => {
        const old = read.result;
        store.put({ ...old, creditBalance: 10.5, moneyMirrorCursor: 0,
          creditLedger: old.creditLedger.filter((entry: { kind: string }) => entry.kind !== "api-call"),
          creditAuthorizations: old.creditAuthorizations.map((entry: object) => ({ ...entry, status: "measured", billedCost: null })),
        }, "account");
      };
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    }); db.close();
  });
  await page.reload(); await restore(page); await plan(page);
  await expect(page.locator(".settings-item").filter({ hasText: "Available Divergence credits" })).toContainText("$10.47");
  expect((await account(page)).creditBalance).toBe(10.47);
  expect(((await account(page)).creditLedger as Array<{ kind: string }>).filter((entry) => entry.kind === "api-call")).toHaveLength(1);
  expect(models).toHaveLength(2);
});

for (const measuredUsage of [true, false]) {
test(`M5: the connected main pipeline ${measuredUsage ? "settles measured use" : "keeps missing usage pending"}`, async ({ page }) => {
  await installModelMocks(page, { answerText: "A measured main pipeline answer." });
  if (!measuredUsage) await page.route("**/api/proxy", async (route) => {
    if (!(route.request().postDataJSON() as { stream?: boolean }).stream) { await route.fallback(); return; }
    await route.fulfill({ status: 200, contentType: "text/event-stream", body: 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A measured main pipeline answer."}}\n\ndata: [DONE]\n\n' });
  });
  await page.route("**/api/provider-status", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ anthropic: true }) }));
  await page.route("**/api/account", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, user: null }) }));
  await page.goto("/"); await restore(page); await plan(page);
  await page.getByRole("button", { name: "Start Plus sandbox checkout", exact: true }).click();
  await page.getByRole("button", { name: "Apply verified sandbox callback", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("No real payment was processed");
  await page.locator(".leftnav-item").filter({ hasText: "Talk to AI" }).click();
  await page.getByRole("button", { name: "Show Advanced Controls" }).click();
  await page.locator(".advanced-controls__field", { hasText: "Translator Engine" }).locator("select").selectOption("managed-translator");
  await page.getByRole("button", { name: /Advanced Controls/ }).first().click();
  await page.getByLabel("What's on your mind?").fill("what temperature does water boil at, at sea level");
  await page.locator(".translate-ask-button").click();
  await page.getByRole("dialog", { name: "Confirm AI Cost" }).getByRole("button", { name: /Continue for up to/ }).click();
  await page.getByRole("dialog", { name: "State change suggested" }).getByRole("button", { name: "Accept & Continue", exact: true }).click();
  await page.getByRole("dialog", { name: "Review AI-ready request" }).getByRole("button", { name: "Send to AI", exact: true }).click();
  await expect(page.getByTestId("conversation-area")).toContainText("A measured main pipeline answer.");
  await expect.poll(async () => ((await account(page)).creditAuthorizations as Array<{ status: string }>)[0]?.status).toBe(measuredUsage ? "settled" : "pending-unknown");
  await expect.poll(async () => (await account(page)).creditBalance).toBe(measuredUsage ? 10.49 : 10.5);
  const saved = await account(page);
  const records = saved.creditAuthorizations as Array<{ status: string; estimatedCost: number; actualCost: number; billedCost: number; actualModels: string[] }>;
  expect(records).toHaveLength(1);
  expect(records[0].status).toBe(measuredUsage ? "settled" : "pending-unknown");
  expect(records[0].billedCost).toBe(measuredUsage ? 0.01 : null);
  if (measuredUsage) {
    expect(records[0].actualCost).toBeGreaterThan(0.0012);
    expect(records[0].actualCost).toBeLessThan(0.002);
  } else expect(records[0].actualCost).toBeNull();
  expect(records[0].actualCost).not.toBe(records[0].estimatedCost);
  expect(records[0].actualModels.sort()).toEqual(["claude-haiku-4-5", "claude-sonnet-5"]);
});
}
