import { createRuntime } from "../lib/runtime.mjs";
import { send } from "../lib/http.mjs";
export default async function handler(_request, response) {
  try { const { config, store } = createRuntime(); const initialized = Boolean(await store.getState(config.repositoryId)); send(response, 200, { ok: true, mode: config.mode, repository_id: config.repositoryId, release: config.releaseDigest, durable_state_initialized: initialized, authoritative_enforcement_active: config.mode === "active" }); }
  catch (error) { send(response, 503, { ok: false, error: error.message, authoritative_enforcement_active: false }); }
}
