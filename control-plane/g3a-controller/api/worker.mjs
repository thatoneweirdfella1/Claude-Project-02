import { randomUUID } from "node:crypto";
import { createRuntime } from "../lib/runtime.mjs";
import { bearer, rawBody, send } from "../lib/http.mjs";
export default async function handler(request, response) {
  try {
    const { config, core, host } = createRuntime(), token = bearer(request), input = JSON.parse(await rawBody(request));
    const isAuthor = token === config.author.token, isAuditor = token === config.auditor.token;
    if (!isAuthor && !isAuditor) return send(response, 401, { ok: false });
    if (input.action === "heartbeat" && isAuthor) return send(response, 200, { ok: true, lease: await core.heartbeat(config.repositoryId, input.task, config.author.principal) });
    if (input.action === "self-check" && isAuthor) { await core.submitSelfCheck(config.repositoryId, input.task, input.candidate_sha, { principal: config.author.principal, authenticated: true }); return send(response, 200, { ok: true, audit_queued: true }); }
    if (input.action === "audit" && isAuditor) {
      const unsigned = { attestation_id: randomUUID(), repository_id: config.repositoryId, task: input.task, candidate_sha: input.candidate_sha, auditor_principal: config.auditor.principal, verdict: input.verdict, defects: input.defects || [], acceptance_tests: input.acceptance_tests || [], observed_at: new Date().toISOString() };
      const attestation = { ...unsigned, host_signature: host.signAttestation(unsigned) }; return send(response, 200, { ok: true, result: await core.receiveAudit(attestation) });
    }
    return send(response, 400, { ok: false, error: "Action not permitted for authenticated principal" });
  } catch (error) { send(response, 400, { ok: false, error: error.message }); }
}
