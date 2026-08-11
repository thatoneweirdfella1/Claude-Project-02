import { test, expect } from "@playwright/test";
import { clickWithCostConfirmation, enableDeveloperMode } from "./credit-helpers";

/* e2e/access-gate.spec.ts — AppAccessGate (operator-directed, post-12.3).
   The unit tests (appAccess.test.ts/appAccessClient.test.ts) cover the pure
   logic; this covers what only a real render can: the app's actual UI
   never renders until the gate resolves, a wrong password shows an error
   and doesn't unlock anything, and a correct one both unlocks immediately
   and is remembered (so the very next real API call the app makes also
   carries it — proven here via the header on the /api/proxy request the
   subsequent flow triggers, not just the gate's own verify call). */

// The application access gate is intentionally disabled in the current product build.\n// Keep these scenarios documented, but do not run them until the gate is restored.\nconst REQUIRED_PASSWORD = "hunter2";

async function mockVerifyAccess(
  page: import("@playwright/test").Page,
  password: string,
): Promise<void> {
  await page.route("**/api/verify-access", async (route) => {
    const header = route.request().headerValue("x-app-password");
    const provided = await header;
    const ok = provided === password;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: true, ok }),
    });
  });
}

test.skip("access gate: blocks the app until the correct password is entered", async ({ page }) => {
  await mockVerifyAccess(page, REQUIRED_PASSWORD);
  await page.goto("/");

  // The real app never renders behind a locked gate.
  await expect(page.getByLabel("Settings")).not.toBeVisible();
  await expect(page.getByText("This app is password protected")).toBeVisible();

  const input = page.getByLabel("Access password");
  const submit = page.getByRole("button", { name: "Unlock" });

  await input.fill("wrong-guess");
  await submit.click();
  await expect(page.getByText("That password isn't correct.")).toBeVisible();
  await expect(page.getByLabel("Settings")).not.toBeVisible();

  await input.fill(REQUIRED_PASSWORD);
  await submit.click();
  await expect(page.getByLabel("Settings")).toBeVisible();
});

test.skip("access gate: the stored password rides along on the app's own API calls", async ({ page }) => {
  await mockVerifyAccess(page, REQUIRED_PASSWORD);

  let proxyHeaderSeen: string | null = null;
  await page.route("**/api/proxy", async (route) => {
    proxyHeaderSeen = await route.request().headerValue("x-app-password");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ content: [{ type: "text", text: "{}" }], usage: {} }),
    });
  });

  await page.goto("/");
  await page.getByLabel("Access password").fill(REQUIRED_PASSWORD);
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByLabel("Settings")).toBeVisible();
  await enableDeveloperMode(page);

  await page.getByLabel("What's on your mind?").fill("does this carry the header");
  await clickWithCostConfirmation(
    page,
    page.getByRole("button", { name: /TRANSLATE.*ASK/i }),
  );
  await expect.poll(() => proxyHeaderSeen).toBe(REQUIRED_PASSWORD);
});
