import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { authoritativeCheck, GitHubAppError, handleWebhook, normalizeGitHubEvent, verifyWebhookSignature } from "./ai-control-github-app.mjs";

const sha = "a".repeat(40), base = "b".repeat(40), secret = "test-secret";
const sign = body => `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

test("webhook signature is timing-safe and exact", () => {
  const body = "{}"; assert.equal(verifyWebhookSignature({ secret, rawBody: body, signature: sign(body) }), true);
  assert.equal(verifyWebhookSignature({ secret, rawBody: body + "x", signature: sign(body) }), false);
});

test("PR identity and SHAs come from host payload", () => {
  const event = normalizeGitHubEvent({ eventName: "pull_request", deliveryId: "d", payload: { action: "synchronize", repository: { id: 1272469738, full_name: "thatoneweirdfella1/Claude-Project-02" }, sender: { id: 9 }, pull_request: { head: { sha }, base: { sha: base, ref: "divergence/reliability-v1" } } } });
  assert.equal(event.candidateSha, sha); assert.equal(event.baseSha, base); assert.equal(event.actorPrincipal, "github:9");
});

test("aggregate check succeeds without routine human acceptance", () => {
  const check = authoritativeCheck({ repositoryId: 1, candidateSha: sha, controllerReleaseDigest: "release", validation: "passed", audit: "Independently verified", decisionState: "none" });
  assert.equal(check.conclusion, "success"); assert.equal(check.name, "DIVERGENCE / authoritative gate");
});

test("failed audit produces failure check", () => {
  const check = authoritativeCheck({ repositoryId: 1, candidateSha: sha, controllerReleaseDigest: "release", validation: "passed", audit: "Failed", decisionState: "none" });
  assert.equal(check.conclusion, "failure");
});

test("material unresolved product decision remains pending", () => {
  const check = authoritativeCheck({ repositoryId: 1, candidateSha: sha, controllerReleaseDigest: "release", validation: "passed", audit: "Independently verified", decisionState: "user decision required" });
  assert.equal(check.status, "in_progress"); assert.equal(check.conclusion, null);
});

test("handler rejects wrong repository before controller", async () => {
  const payload = JSON.stringify({ action: "opened", repository: { id: 2, full_name: "wrong/repo" }, sender: { id: 9 }, pull_request: { head: { sha }, base: { sha: base, ref: "x" } } });
  const headers = { "x-hub-signature-256": sign(payload), "x-github-delivery": "d", "x-github-event": "pull_request" };
  const deliveryStore = { has: async () => false };
  await assert.rejects(handleWebhook({ headers, rawBody: payload, secret, expectedRepositoryId: 1, controller: {}, deliveryStore }), GitHubAppError);
});

test("duplicate delivery is ignored exactly once", async () => {
  const body = JSON.stringify({ repository: { id: 1 }, before: base, after: sha, ref: "refs/heads/divergence/reliability-staging", sender: { id: 9 } });
  const result = await handleWebhook({ headers: { "x-hub-signature-256": sign(body), "x-github-delivery": "same", "x-github-event": "push" }, rawBody: body, secret, expectedRepositoryId: 1, controller: {}, deliveryStore: { has: async () => true } });
  assert.deepEqual(result, { duplicate: true });
});
