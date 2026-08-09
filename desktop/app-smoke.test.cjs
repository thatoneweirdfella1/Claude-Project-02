"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { _electron: electron } = require("@playwright/test");

test("the file-based Electron renderer mounts the local account screen", async () => {
  const executablePath = require("electron");
  const electronApp = await electron.launch({
    executablePath,
    args: [path.resolve(__dirname)],
  });

  try {
    const window = await electronApp.firstWindow();
    await window.waitForFunction(
      () => (document.querySelector("#root")?.childElementCount ?? 0) > 0,
      undefined,
      { timeout: 15_000 },
    );
    await window.getByRole("heading", { name: "Welcome Back" }).waitFor({
      state: "visible",
      timeout: 15_000,
    });
    assert.match(await window.locator("body").innerText(), /Create a new local account/);
  } finally {
    await electronApp.close();
  }
});
