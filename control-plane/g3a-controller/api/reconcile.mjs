import { createRuntime } from "../lib/runtime.mjs";
import { bearer, send } from "../lib/http.mjs";
export default async function handler(request, response) {
  try { const { config, core } = createRuntime(); if (bearer(request) !== config.cronSecret) return send(response, 401, { ok: false }); if (config.mode !== "active") return send(response, 200, { ok: true, mode: "observe", actions: [] }); send(response, 200, { ok: true, actions: await core.reconcile(config.repositoryId) }); }
  catch (error) { send(response, 500, { ok: false, error: error.message }); }
}
