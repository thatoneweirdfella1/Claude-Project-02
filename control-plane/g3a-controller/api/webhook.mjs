import { createRuntime } from "../lib/runtime.mjs";
import { handleWebhook } from "../lib/github-events.mjs";
import { rawBody } from "../lib/http.mjs";
export default {
  async fetch(request) {
    try { const { config, store, controller } = createRuntime(); const body = await rawBody(request); const headers = Object.fromEntries(request.headers.entries()); const result = await handleWebhook({ headers, rawBody: body, secret: config.webhookSecret, expectedRepositoryId: config.repositoryId, controller, deliveryStore: store.deliveryStore(config.repositoryId) }); return Response.json(result); }
    catch (error) { return Response.json({ ok: false, error: error.message }, { status: 400 }); }
  }
};
