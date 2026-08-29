import { expect, test, type Page } from "@playwright/test";

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
  await page.getByRole("button", { name: /Preview Plus|Preview Pro|Preview Insane/ }).first().click();
  await expect(page.getByRole("dialog", { name: "Payment preview" })).toContainText("No checkout was created");
  await page.getByRole("button", { name: "Close preview" }).click();

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
  for (const tab of ["Active", "Saved", "Archived", "Trash"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    if (tab !== "Trash") await expect(page.getByRole("button", { name: tab, exact: true })).toHaveAttribute("aria-current", "page");
  }

  await page.getByRole("button", { name: "Projects", exact: true }).click();
  for (const tab of ["Overview", "Tasks", "Resources", "Integrations"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await expect(page.getByRole("button", { name: tab, exact: true })).toHaveAttribute("aria-current", "page");
  }
  await page.getByRole("button", { name: "Open AI Connections" }).click();
  await expect(page.getByRole("button", { name: "AI Connections", exact: true })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: "Personal Optimization", exact: true }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(10);
  await page.getByRole("checkbox", { name: /Prevent and Reduce Overwhelm/ }).check();
  await page.getByRole("button", { name: "Personalize My Divergence" }).click();
  await expect(page.getByRole("status")).toContainText("no eligible conversations");

  await page.getByRole("button", { name: "All Tools", exact: true }).click();
  await page.getByRole("button", { name: "Large Jobs", exact: true }).click();
  await page.getByRole("button", { name: "Plan a large job", exact: true }).click();
  await expect(page.getByRole("region", { name: "Large job requirements" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Start remains unavailable/ })).toBeDisabled();

  await page.getByRole("button", { name: "Talk to AI", exact: true }).click();
  const composer = page.getByLabel("What's on your mind?");
  await composer.fill("Question");
  await composer.press("?");
  await expect(composer).toHaveValue("Question?");

  const developerMode = page.getByRole("button", { name: "Developer Mode", exact: false });
  if (await developerMode.isEnabled()) {
    await developerMode.click();
    await expect(page.getByLabel("Developer testing controls")).toBeVisible();
    await page.getByRole("button", { name: /Developer Lab/ }).click();
    await expect(page.getByText("Use this lab to test pricing", { exact: false })).toBeVisible();
  } else {
    await expect(developerMode).toHaveAttribute("title", "Developer Mode is operator-only");
  }
});
