"use strict";

const { app, BrowserWindow, ipcMain, safeStorage, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { createDesktopDatabase } = require("./db.cjs");

let database;
let mainWindow;

function writeCrashLog(error) {
  try {
    const line = `[${new Date().toISOString()}] ${error?.stack || error}\n`;
    fs.appendFileSync(path.join(app.getPath("userData"), "crash.log"), line, "utf8");
  } catch { /* Last-resort logger must never cause a second crash. */ }
}

function encryptedApiKey() {
  const stored = database.getSetting("anthropic_api_key");
  if (!stored) return process.env.ANTHROPIC_API_KEY || "";
  if (!safeStorage.isEncryptionAvailable()) throw new Error("Secure key storage is unavailable on this system.");
  return safeStorage.decryptString(Buffer.from(stored, "base64"));
}

async function completeWithAnthropic(request) {
  const apiKey = encryptedApiKey();
  if (!apiKey) throw new Error("Add an Anthropic API key in Settings before running AI actions.");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: request.model,
      max_tokens: request.maxTokens || 4096,
      system: request.system || undefined,
      messages: request.messages,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || `Provider request failed (${response.status}).`);
  return {
    text: (body.content || []).filter((block) => block.type === "text").map((block) => block.text || "").join(""),
    usage: {
      inputTokens: body.usage?.input_tokens || 0,
      outputTokens: body.usage?.output_tokens || 0,
    },
  };
}

function registerIpc() {
  ipcMain.handle("state:load", () => database.loadState());
  ipcMain.handle("state:save", (_event, state) => database.saveState(state));
  ipcMain.handle("auth:current", () => database.currentUser());
  ipcMain.handle("auth:signup", (_event, input) => database.signUp(input));
  ipcMain.handle("auth:login", (_event, input) => database.logIn(input));
  ipcMain.handle("auth:logout", () => database.logOut());
  ipcMain.handle("auth:list-users", () => database.listUsers());
  ipcMain.handle("admin:list-users", () => database.listUsers());
  ipcMain.handle("admin:adjust-credits", (_event, input) => database.adjustUserCredits(input.userId, input.amount, input.note));
  ipcMain.handle("admin:resolve-payment", (_event, input) => database.resolveUserPayment(input.userId, input.requestId, input.approved));
  ipcMain.handle("provider:key-status", () => ({ configured: Boolean(database.getSetting("anthropic_api_key") || process.env.ANTHROPIC_API_KEY), source: database.getSetting("anthropic_api_key") ? "secure-storage" : process.env.ANTHROPIC_API_KEY ? "environment" : "none" }));
  ipcMain.handle("provider:save-key", (_event, apiKey) => {
    if (!safeStorage.isEncryptionAvailable()) throw new Error("Secure key storage is unavailable. Set ANTHROPIC_API_KEY before launching instead.");
    const value = String(apiKey || "").trim();
    if (!value.startsWith("sk-ant-")) throw new Error("That does not look like an Anthropic API key.");
    database.setSetting("anthropic_api_key", safeStorage.encryptString(value).toString("base64"));
  });
  ipcMain.handle("provider:clear-key", () => database.deleteSetting("anthropic_api_key"));
  ipcMain.handle("ai:complete", (_event, request) => completeWithAnthropic(request));
  ipcMain.handle("app:version", () => app.getVersion());
  ipcMain.handle("app:open-data-folder", () => shell.openPath(app.getPath("userData")));
  ipcMain.handle("window:minimize", () => mainWindow?.minimize());
  ipcMain.handle("window:toggle-maximize", () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize();
  });
  ipcMain.handle("window:close", () => mainWindow?.close());
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1545,
    height: 1024,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: "#050606",
    frame: false,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const current = mainWindow.webContents.getURL();
    if (url !== current && /^https?:/i.test(url)) { event.preventDefault(); void shell.openExternal(url); }
  });
  const devArg = process.argv.find((arg) => arg.startsWith("--dev-url="));
  if (devArg) mainWindow.loadURL(devArg.slice("--dev-url=".length));
  else if (app.isPackaged) mainWindow.loadFile(path.join(process.resourcesPath, "renderer", "index.html"));
  else mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  process.on("uncaughtException", writeCrashLog);
  process.on("unhandledRejection", writeCrashLog);
  app.whenReady().then(() => {
    database = createDesktopDatabase(path.join(app.getPath("userData"), "divergence.sqlite"));
    registerIpc();
    createWindow();
  }).catch(writeCrashLog);
  app.on("second-instance", () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); } });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  app.on("before-quit", () => database?.close());
}
