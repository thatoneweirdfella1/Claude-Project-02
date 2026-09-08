import state from "../bootstrap-state.json" with { type: "json" };
import { createRuntime } from "../lib/runtime.mjs";
import { bearer, send } from "../lib/http.mjs";
export default async function handler(request, response) {
  try { const { config, store } = createRuntime(); if (request.method !== "POST" || bearer(request) !== config.bootstrapSecret) return send(response, 401, { ok: false }); const created = await store.initialize(config.repositoryId, state); send(response, 200, { ok: true, created: Boolean(created), repository_id: config.repositoryId }); }
  catch (error) { send(response, 500, { ok: false, error: error.message }); }
}
