import { createHmac, timingSafeEqual } from "node:crypto";

export class GitHubAppError extends Error {}
export function verifyWebhookSignature({ secret, rawBody, signature }) {
  if (!secret || !rawBody || !signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const a = Buffer.from(expected), b = Buffer.from(signature); return a.length === b.length && timingSafeEqual(a, b);
}
export function normalizeGitHubEvent({ eventName, deliveryId, payload }) {
  if (!deliveryId) throw new GitHubAppError("GitHub delivery ID is required");
  const repositoryId = payload?.repository?.id;
  if (!Number.isInteger(repositoryId)) throw new GitHubAppError("Host repository ID is required");
  const common = { deliveryId, eventName, action: payload.action, repositoryId, repositoryFullName: payload.repository.full_name, installationId: payload.installation?.id, actorPrincipal: `github:${payload.sender?.id}` };
  if (eventName === "pull_request") {
    const pr = payload.pull_request;
    if (!pr?.head?.sha || !pr?.base?.sha) throw new GitHubAppError("Host PR SHAs are required");
    return { ...common, candidateSha: pr.head.sha, baseSha: pr.base.sha, targetBranch: pr.base.ref };
  }
  if (eventName === "push") {
    if (!payload.after || !payload.before || !payload.ref) throw new GitHubAppError("Host push identity is required");
    return { ...common, candidateSha: payload.after, baseSha: payload.before, targetBranch: payload.ref.replace("refs/heads/", "") };
  }
  if (["installation", "installation_repositories"].includes(eventName)) return common;
  throw new GitHubAppError(`Unsupported event ${eventName}`);
}
export function authoritativeCheck({ repositoryId, candidateSha, controllerReleaseDigest, validation, audit, decisionState }) {
  const success = validation === "passed" && audit === "Independently verified" && decisionState !== "user decision required";
  const failure = validation === "failed" || audit === "Failed";
  return { name: "DIVERGENCE / authoritative gate", head_sha: candidateSha, status: success || failure ? "completed" : "in_progress", conclusion: success ? "success" : failure ? "failure" : null, external_id: `${repositoryId}:${candidateSha}:${controllerReleaseDigest}`, output: { title: success ? "Accepted automatically" : failure ? "Rejected; correction queued" : "Waiting for automatic controls", summary: `validation=${validation}; audit=${audit}; decision=${decisionState}; controller=${controllerReleaseDigest}` } };
}
export async function handleWebhook({ headers, rawBody, secret, expectedRepositoryId, controller, deliveryStore }) {
  if (!verifyWebhookSignature({ secret, rawBody, signature: headers["x-hub-signature-256"] })) throw new GitHubAppError("Invalid webhook signature");
  const deliveryId = headers["x-github-delivery"];
  if (await deliveryStore.has(deliveryId)) return { duplicate: true };
  const payload = JSON.parse(rawBody), event = normalizeGitHubEvent({ eventName: headers["x-github-event"], deliveryId, payload });
  if (event.repositoryId !== expectedRepositoryId) throw new GitHubAppError("Unexpected repository");
  if (!(await deliveryStore.reserve(deliveryId))) return { duplicate: true };
  try { const result = await controller.onGitHubEvent(event); await deliveryStore.complete(deliveryId); return result; }
  catch (error) { await deliveryStore.fail(deliveryId, String(error?.message || error)); throw error; }
}
