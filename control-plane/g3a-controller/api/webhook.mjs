import { createRuntime } from "../lib/runtime.mjs";
import { handleWebhook } from "../lib/github-events.mjs";
import { rawBody } from "../lib/http.mjs";

export default {
  async fetch(request) {
    let rawLength = null;
    try {
      const { config, store, controller } = createRuntime();
      const body = await rawBody(request);
      rawLength = Buffer.byteLength(body);
      const headers = Object.fromEntries(request.headers.entries());
      const result = await handleWebhook({
        headers,
        rawBody: body,
        secret: config.webhookSecret,
        expectedRepositoryId: config.repositoryId,
        controller,
        deliveryStore: store.deliveryStore(config.repositoryId),
      });
      console.log("webhook accepted", {
        event: headers["x-github-event"],
        deliveryId: headers["x-github-delivery"],
        duplicate: result.duplicate === true,
      });
      return Response.json(result);
    } catch (error) {
      console.error("webhook rejected", {
        event: request.headers.get("x-github-event"),
        deliveryId: request.headers.get("x-github-delivery"),
        signaturePresent: Boolean(request.headers.get("x-hub-signature-256")),
        contentType: request.headers.get("content-type"),
        rawLength,
        error: error.message,
      });
      return Response.json({ ok: false, error: error.message }, { status: 400 });
    }
  },
};
