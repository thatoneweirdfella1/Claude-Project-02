import { createRuntime } from "../lib/runtime.mjs";
import { handleWebhook } from "../lib/github-events.mjs";
import { rawBody, send } from "../lib/http.mjs";
export default async function handler(request, response) {
  try { const { config, store, controller } = createRuntime(); const body = await rawBody(request); const result = await handleWebhook({ headers: request.headers, rawBody: body, secret: config.webhookSecret, expectedRepositoryId: config.repositoryId, controller, deliveryStore: store.deliveryStore(config.repositoryId) }); send(response, 200, result); }
  catch (error) { send(response, 400, { ok: false, error: error.message }); }
}
