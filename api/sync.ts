/// <reference types="node" />
import {
  authenticatedAccount,
  compareAndSetRemoteRecord,
  deleteRemoteRecord,
  getRemoteRecord,
  requestIsSameOrigin,
  storageConfigured,
} from "./_lib/durableAccount.js";

export const config = { runtime: "edge" };
const MAX_BODY_BYTES = 10_000_000;

function json(value: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "cache-control": "no-store", "content-type": "application/json", ...headers },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (!storageConfigured()) return json({ error: "Durable account storage is not configured." }, 503);
  const account = await authenticatedAccount(request);
  if (!account) return json({ error: "Unauthorized" }, 401);

  if (request.method === "GET") {
    const raw = await getRemoteRecord(account.id);
    if (!raw) return json({ error: "No remote copy yet." }, 404);
    return new Response(raw, {
      status: 200,
      headers: { "cache-control": "no-store", "content-type": "application/json" },
    });
  }

  if (!requestIsSameOrigin(request)) return json({ error: "Cross-origin sync mutation rejected." }, 403);

  if (request.method === "DELETE") {
    if (request.headers.get("x-confirm-purge") !== "purge-my-data") return json({ error: "Explicit purge confirmation required." }, 400);
    await deleteRemoteRecord(account.id);
    return json({ ok: true });
  }

  if (request.method !== "PUT") return json({ error: "Method not allowed" }, 405, { allow: "GET, PUT, DELETE" });
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY_BYTES) return json({ error: "Dataset is too large." }, 413);
  const expected = Number(request.headers.get("if-match"));
  if (!Number.isInteger(expected) || expected < 0) return json({ error: "A valid base revision is required." }, 428);

  let body: { dataset?: { kind?: string; schemaVersion?: number; checksum?: string } };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: "Dataset is too large." }, 413);
    body = JSON.parse(raw) as typeof body;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!body.dataset || body.dataset.kind !== "divergence-local-dataset" ||
      body.dataset.schemaVersion !== 2 || typeof body.dataset.checksum !== "string") {
    return json({ error: "Invalid durable dataset." }, 400);
  }

  const record = {
    revision: expected + 1,
    ownerId: account.id,
    updatedAt: Date.now(),
    dataset: body.dataset,
    checksum: body.dataset.checksum,
  };
  if (!await compareAndSetRemoteRecord(account.id, expected, JSON.stringify(record))) {
    const current = await getRemoteRecord(account.id);
    return current
      ? new Response(current, {
          status: 409,
          headers: { "cache-control": "no-store", "content-type": "application/json" },
        })
      : json({ error: "Revision conflict." }, 409);
  }
  return json(record);
}
