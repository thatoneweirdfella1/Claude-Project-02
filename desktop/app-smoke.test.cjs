"use strict";

const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { _electron: electron } = require("@playwright/test");

async function launch(userData) {
  return electron.launch({
    executablePath: require("electron"),
    args: [path.resolve(__dirname), `--user-data-dir=${userData}`],
  });
}

async function waitForRenderer(window) {
  await window.waitForFunction(
    () => (document.querySelector("#root")?.childElementCount ?? 0) > 0,
    undefined,
    { timeout: 15_000 },
  );
}

test("desktop shell survives every navigation route, restores safely, and stays fixed", async () => {
  const userData = mkdtempSync(path.join(tmpdir(), "divergence-app-"));
  let electronApp = await launch(userData);
  const rendererErrors = [];

  try {
    let window = await electronApp.firstWindow();
    window.on("pageerror", (error) => rendererErrors.push(error.message));
    await waitForRenderer(window);
    await window.getByRole("heading", { name: "Welcome Back" }).waitFor({ state: "visible", timeout: 15_000 });

    const windowState = await electronApp.evaluate(({ BrowserWindow }) => {
      const appWindow = BrowserWindow.getAllWindows()[0];
      return {
        resizable: appWindow.isResizable(),
        maximizable: appWindow.isMaximizable(),
        fullscreenable: appWindow.isFullScreenable(),
      };
    });
    assert.deepEqual(windowState, { resizable: false, maximizable: false, fullscreenable: false });

    await window.getByRole("button", { name: "Create a new local account" }).click();
    await window.getByLabel("Display name").fill("Windows Smoke Test");
    await window.getByLabel("Email").fill("smoke@example.com");
    await window.getByLabel("Password").fill("smoke-test-password");
    await window.getByRole("button", { name: "Create Account" }).click();
    await window.locator(".app-shell").waitFor({ state: "visible", timeout: 15_000 });

    const navButtons = window.locator("[data-screen]");
    assert.equal(await navButtons.count(), 9);
    for (let index = 0; index < await navButtons.count(); index += 1) {
      const button = navButtons.nth(index);
      await button.click();
      await window.waitForTimeout(120);
      assert.equal(await window.locator(".app-shell").isVisible(), true);
      const recoveryCount = await window.locator(".app-recovery").count();
      if (recoveryCount > 0) {
        const technicalDetail = await window.locator(".app-recovery code").textContent();
        throw new Error(`navigation failed for ${await button.innerText()}: ${technicalDetail} | renderer errors: ${rendererErrors.join(" || ")}`);
      }
      assert.ok((await window.locator("#root").innerText()).trim().length > 20);
    }

    await window.locator('[data-screen="translate"]').click();
    const accordionHeaders = window.locator(".accordion-panel__header");
    assert.equal(await accordionHeaders.count(), 6);
    for (let index = 0; index < await accordionHeaders.count(); index += 1) {
      const header = accordionHeaders.nth(index);
      await header.click();
      await window.waitForTimeout(70);
      assert.equal(await window.locator(".app-recovery").count(), 0, `accordion failed for ${await header.innerText()}`);
      await header.click();
    }

    const quickTools = window.locator(".quick-tools-tile__button");
    assert.equal(await quickTools.count(), 6);
    for (let index = 0; index < await quickTools.count(); index += 1) {
      const button = quickTools.nth(index);
      await button.click();
      await window.waitForTimeout(70);
      assert.equal(await window.locator(".app-recovery").count(), 0, `quick tool failed for ${await button.innerText()}`);
      await button.click();
    }

    const topbar = window.getByTestId("topbar");
    for (const name of ["Quick Reference", "Search", "Templates", "Notifications", "Help"]) {
      const button = topbar.getByRole("button", { name, exact: true }).first();
      await button.click();
      await window.waitForTimeout(80);
      assert.equal(await window.locator(".app-shell").isVisible(), true, `${name} hid the shell`);
      await button.click();
    }
    const profileButton = topbar.locator(".user-chip");
    await profileButton.click();
    assert.equal(await window.locator(".app-shell").isVisible(), true);
    await profileButton.click();
    await topbar.getByRole("button", { name: "Settings", exact: true }).click();
    assert.equal(await window.locator(".screen-settings").isVisible(), true);

    const background = await window.evaluate(() => window.divergenceDesktop.appearance.getBackground());
    assert.equal(background.dataUrl, null);
    await window.evaluate(() => window.divergenceDesktop.appearance.clearBackground());

    await window.locator('[data-screen="tasks"]').click();
    await window.waitForTimeout(5_300);
    assert.deepEqual(rendererErrors, []);

    await electronApp.close();
    electronApp = await launch(userData);
    window = await electronApp.firstWindow();
    window.on("pageerror", (error) => rendererErrors.push(error.message));
    await waitForRenderer(window);
    await window.locator(".app-shell").waitFor({ state: "visible", timeout: 15_000 });
    assert.equal(await window.locator(".app-recovery").count(), 0);
    assert.deepEqual(rendererErrors, []);

    const closed = electronApp.waitForEvent("close");
    await window.keyboard.press("Escape");
    await closed;
  } finally {
    try { await electronApp.close(); } catch { /* already closed by Escape */ }
    rmSync(userData, { recursive: true, force: true });
  }
});
