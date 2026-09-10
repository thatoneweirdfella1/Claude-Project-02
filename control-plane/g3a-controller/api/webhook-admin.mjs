import { createRuntime } from "../lib/runtime.mjs";
import { bearer, send } from "../lib/http.mjs";

export async function webhookAdminHandler(request, response, runtimeFactory = createRuntime) {
  try {
    const { config, host } = runtimeFactory();
    if (request.method !== "POST" || bearer(request) !== config.bootstrapSecret) return send(response, 401, { ok: false });
    const action = new URL(request.url, "https://controller.invalid").searchParams.get("action");
    if (action === "synchronize-secret") return send(response, 200, { ok: true, ...await host.synchronizeWebhookSecret() });
    if (action === "redeliver-latest-successful-push") return send(response, 202, { ok: true, ...await host.redeliverLatestSuccessfulPush() });
    return send(response, 400, { ok: false, error: "Unsupported maintenance action" });
  } catch (error) {
    return send(response, 500, { ok: false, error: error.message });
  }
}

export default webhookAdminHandler;
