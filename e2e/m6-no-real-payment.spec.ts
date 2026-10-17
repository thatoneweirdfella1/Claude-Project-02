import { expect, test } from "./fixtures";
import { installModelMocks } from "./mocks";

test("M6: sandbox subscription and every top-up apply owner credits without a payment or network request", async ({ page }) => {
  await installModelMocks(page, { answerText: "No model work is needed for sandbox checkout." });
  await page.goto("/");
  const restore = page.getByRole("button", { name: "Restore last work", exact: true });
  await expect(restore.or(page.locator(".app-shell"))).toBeVisible();
  if (await restore.isVisible()) await restore.click();
  await page.locator(".leftnav-item").filter({ hasText: "Settings" }).click();
  await page.getByRole("button", { name: "Plan & credits", exact: true }).click();
  await expect(page.getByText("Deterministic sandbox only.", { exact: false })).toBeVisible();
  const requests: string[] = [];
  // Fail closed at the browser boundary if checkout ever starts any request.
  await page.route("**/*", async (route) => { requests.push(new URL(route.request().url()).pathname); await route.abort(); });
  const balance = page.locator(".settings-item").filter({ hasText: "Available Divergence credits" });
  let total = 0;
  const offers = [
    { button: "Start Plus sandbox checkout", paid: 15, credits: 10.5 },
    { button: "Start Pro sandbox checkout", paid: 75, credits: 52.5 },
    { button: "Start Insane sandbox checkout", paid: 200, credits: 140 },
    { button: "Add $5 in sandbox", paid: 5, credits: 3.5 },
    { button: "Add $10 in sandbox", paid: 10, credits: 7 },
    { button: "Add $25 in sandbox", paid: 25, credits: 17.5 },
    { button: "Add $50 in sandbox", paid: 50, credits: 35 },
  ];
  for (const offer of offers) {
    await page.getByRole("button", { name: offer.button, exact: offer.button.startsWith("Start") }).click();
    const dialog = page.getByRole("dialog", { name: "Sandbox checkout pending" });
    await expect(dialog).toContainText(`You pay $${offer.paid}, receive $${offer.credits.toFixed(2)} after 30% markup`);
    await expect(dialog).toContainText("No real payment can occur.");
    await expect(balance).toContainText(`$${total.toFixed(2)}`);
    await dialog.getByRole("button", { name: "Apply verified sandbox callback", exact: true }).click();
    total += offer.credits;
    await expect(page.getByRole("status")).toHaveText("Verified sandbox callback applied exactly once. No real payment was processed.");
    await expect(balance).toContainText(`$${total.toFixed(2)}`);
  }
  expect(requests).toEqual([]);
});
