"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("divergenceDesktop", {
  platform: process.platform,
  state: {
    load: () => ipcRenderer.invoke("state:load"),
    save: (state) => ipcRenderer.invoke("state:save", state),
  },
  auth: {
    current: () => ipcRenderer.invoke("auth:current"),
    signUp: (input) => ipcRenderer.invoke("auth:signup", input),
    logIn: (input) => ipcRenderer.invoke("auth:login", input),
    logOut: () => ipcRenderer.invoke("auth:logout"),
    listUsers: () => ipcRenderer.invoke("auth:list-users"),
  },
  admin: {
    listUsers: () => ipcRenderer.invoke("admin:list-users"),
    adjustCredits: (userId, amount, note) => ipcRenderer.invoke("admin:adjust-credits", { userId, amount, note }),
    resolvePayment: (userId, requestId, approved) => ipcRenderer.invoke("admin:resolve-payment", { userId, requestId, approved }),
  },
  provider: {
    apiKeyStatus: () => ipcRenderer.invoke("provider:key-status"),
    saveApiKey: (apiKey) => ipcRenderer.invoke("provider:save-key", apiKey),
    clearApiKey: () => ipcRenderer.invoke("provider:clear-key"),
  },
  ai: {
    complete: (request) => ipcRenderer.invoke("ai:complete", request),
  },
  app: {
    version: () => ipcRenderer.invoke("app:version"),
    openDataFolder: () => ipcRenderer.invoke("app:open-data-folder"),
    minimize: () => ipcRenderer.invoke("window:minimize"),
    toggleMaximize: () => ipcRenderer.invoke("window:toggle-maximize"),
    close: () => ipcRenderer.invoke("window:close"),
  },
});
