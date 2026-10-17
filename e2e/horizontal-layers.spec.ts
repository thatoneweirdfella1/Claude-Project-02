import { expect, test, type Page } from "./fixtures";

async function openApp(page: Page) {
  await page.route("**/api/verify-access", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ requiresPassword: false, ok: true }) }));
  await page.goto("/");
  await expect(page.getByTestId("topbar")).toBeVisible();
}

test("L1: every canonical whole-site destination is reachable", async ({ page }) => {
  await openApp(page);

  for (const [label, heading] of [
    ["Talk to AI", "Talk to AI"], ["Sessions", "Sessions"], ["Saved Tools", "Saved Tools"],
    ["Projects", "Projects"], ["Insights", "Insights"], ["Settings", "Settings"],
  ] as const) {
    await page.getByRole("button", { name: label, exact: true }).first().click();
    await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
  }

  for (const [tool, heading] of [
    ["Templates", "Saved Tools"], ["Saved Prompts", "Saved Tools"], ["Techniques", "Techniques"],
    ["Variables", "Variables"], ["Checkpoints", "Checkpoints"], ["AI Connections", "Settings"],
    ["Large Jobs", "Large Jobs"],
  ] as const) {
    await page.getByRole("button", { name: "All Tools", exact: true }).click();
    await page.getByRole("dialog", { name: "All tools" }).getByRole("button", { name: tool, exact: true }).click();
    await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
  }

  await page.getByRole("button", { name: "Trash", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Trash", exact: true })).toBeVisible();
  await expect(page.locator(".screen:visible")).not.toBeEmpty();
});

test("L2: global navigation controls react honestly", async ({ page }) => {
  await openApp(page);

  await page.getByRole("button", { name: "Quick Reference", exact: true }).click();
  await expect(page.getByRole("region", { name: "Quick Reference" })).toBeVisible();
  await page.getByRole("button", { name: "Close reference" }).click();

  await page.keyboard.press("Control+k");
  const search = page.getByPlaceholder("Search sessions, Saved Tools, Projects, and Settings");
  await expect(search).toBeFocused();
  await search.fill("Variables");
  await page.getByRole("button", { name: "Variables", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Variables", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Notifications", exact: true }).click();
  await expect(page.getByText("No notifications. New notices will link to their exact destination here.")).toBeVisible();

  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page.getByRole("menu").getByRole("button", { name: "Keyboard shortcuts", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Keyboard Shortcuts" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Keyboard Shortcuts" })).toHaveCount(0);
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page.getByRole("menu").getByRole("button", { name: "Account and plan", exact: true }).click();
  await expect(page.getByRole("button", { name: "Plan & credits", exact: true })).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Start Plus sandbox checkout", exact: true }).click();
  const checkout = page.getByRole("dialog").filter({ hasText: "No real payment can occur" });
  await expect(checkout).toContainText("No balance or entitlement changes");
  await checkout.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(checkout).toHaveCount(0);

  await page.getByRole("button", { name: "All Tools", exact: true }).click();
  await page.getByLabel("Search All Tools").fill("Large");
  await expect(page.getByRole("dialog", { name: "All tools" }).getByRole("button", { name: "Large Jobs", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "All tools" }).getByRole("button", { name: "Templates", exact: true })).toHaveCount(0);
  await page.getByLabel("Pin Large Jobs").click();
  await page.getByLabel("Close tools").click();
  await expect(page.getByRole("button", { name: "Large Jobs", exact: true })).toBeVisible();
  await page.getByLabel("Unpin Large Jobs").click();

  await page.getByTestId("system-status").click();
  await expect(page.getByText("No external AI provider is connected. No remote call or payment will be claimed.")).toBeVisible();
  await page.getByRole("button", { name: "Open connection settings" }).click();
  await expect(page.getByRole("button", { name: "AI Connections", exact: true })).toHaveAttribute("aria-current", "page");
});

test("L2: screen tabs, safe unavailable states, and typing protection react", async ({ page }) => {
  await openApp(page);

  await page.getByRole("button", { name: "Sessions", exact: true }).click();
  const center = page.getByTestId("col-center");
  for (const tab of ["Active", "Saved", "Archived", "Trash"]) {
    await center.getByRole("button", { name: tab, exact: true }).click();
    if (tab !== "Trash") await expect(center.getByRole("button", { name: tab, exact: true })).toHaveAttribute("aria-current", "page");
  }

  await page.getByRole("button", { name: "Projects", exact: true }).click();
  for (const tab of ["Overview", "Tasks", "Resources", "Integrations"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await expect(page.getByRole("button", { name: tab, exact: true })).toHaveAttribute("aria-current", "page");
  }
  await page.getByRole("button", { name: "Open AI Connections" }).click();
  await expect(page.getByRole("button", { name: "AI Connections", exact: true })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: "Personal Optimization", exact: true }).click();
  await page.getByRole("checkbox", { name: /Off|On/ }).check();
  await page.getByRole("checkbox", { name: "Reduce Overwhelm" }).check();
  await page.getByRole("button", { name: "Preview analysis state" }).click();
  await expect(page.getByRole("status")).toContainText("No conversation was processed");

  await page.getByRole("button", { name: "All Tools", exact: true }).click();
  await page.getByRole("button", { name: "Large Jobs", exact: true }).click();
  const proxyCalls: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/proxy")) proxyCalls.push(request.url());
  });
  const prepareJob = page.getByRole("button", { name: "Prepare synthetic job", exact: true });
  await expect(prepareJob).toBeDisabled();
  await page.getByLabel("Synthetic job source items").fill("First local item\nSecond local item\nThird local item");
  await page.getByLabel("Items per batch").fill("2");
  await prepareJob.click();
  const job = page.getByRole("region", { name: "Synthetic job progress", exact: true });
  await expect(job).toContainText("0 of 2 batches complete");
  await expect(job).toContainText("No provider is connected and no credits can be spent.");
  const runBatch = job.getByRole("button", { name: "Run next local batch", exact: true });
  await job.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(runBatch).toBeDisabled();
  await job.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(runBatch).toBeEnabled();
  await runBatch.click();
  await expect(job).toContainText("1 of 2 batches complete");
  await runBatch.click();
  await expect(job).toContainText("2 of 2 batches complete");
  await expect(runBatch).toBeDisabled();
  expect(proxyCalls).toHaveLength(0);

  await page.getByRole("button", { name: "Talk to AI", exact: true }).click();
  const composer = page.getByLabel("What's on your mind?");
  await composer.fill("Question");
  await composer.press("?");
  await expect(composer).toHaveValue("Question?");
});

test("L2: Developer Mode exposes its testing controls and opens the lab", async ({ page }) => {
  await openApp(page);
  const developerMode = page.getByRole("button", { name: "Developer Mode", exact: false });
  if (await developerMode.isEnabled()) {
    await developerMode.click();
    await expect(developerMode).toHaveClass(/is-active/);
    test.fail(true, "KNOWN ISSUE: Developer Mode advertises testing controls hidden by the frozen shell (J2/J9)");
    await expect(page.getByLabel("Developer testing controls")).toBeVisible();
    await page.getByRole("button", { name: /Developer Lab/ }).click();
    await expect(page.getByText("Use this lab to test pricing", { exact: false })).toBeVisible();
  } else {
    await expect(developerMode).toHaveAttribute("title", "Developer Mode is operator-only");
  }
});
