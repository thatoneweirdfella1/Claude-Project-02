import test from "node:test";
import assert from "node:assert/strict";
import { TransitionError, recoveryAction, transition, unlockableTasks } from "./ai-control-trusted-transition.mjs";

const sha = "a".repeat(40);
const author = { principal: "worker:a", authenticated: true };
const auditor = { principal: "worker:b", authenticated: true };
const baseTask = { state: "Self-check passed", author_principal: author.principal, candidate_sha: sha, dependencies: [] };

test("self-check automatically enters audit queue state", () => {
  assert.equal(transition({ task: baseTask, to: "Awaiting independent audit", actor: author }).state, "Awaiting independent audit");
});

test("author cannot independently verify own work", () => {
  const task = { ...baseTask, state: "Awaiting independent audit" };
  assert.throws(() => transition({ task, to: "Independently verified", actor: author, attestation: { candidate_sha: sha, auditor_principal: author.principal, verdict: "Independently verified", host_signature: "sig" } }), TransitionError);
});

test("distinct signed auditor can independently verify exact SHA", () => {
  const task = { ...baseTask, state: "Awaiting independent audit" };
  const attestation = { candidate_sha: sha, auditor_principal: auditor.principal, verdict: "Independently verified", host_signature: "sig" };
  assert.equal(transition({ task, to: "Independently verified", actor: auditor, attestation }).state, "Independently verified");
});

test("automatic acceptance needs trusted validation but no routine human approval", () => {
  const task = { ...baseTask, state: "Independently verified" };
  assert.throws(() => transition({ task, to: "Accepted", actor: auditor }), /Trusted validation/);
  assert.equal(transition({ task, to: "Accepted", actor: auditor, trustedValidation: true }).state, "Accepted");
});

test("material unresolved product decision blocks only acceptance", () => {
  const task = { ...baseTask, state: "Independently verified" };
  assert.throws(() => transition({ task, to: "Accepted", actor: auditor, trustedValidation: true, decisionQueue: ["D1"] }), /product decision/);
});

test("failed audit requires correction rather than erasing failure", () => {
  const failed = { ...baseTask, state: "Failed" };
  assert.equal(transition({ task: failed, to: "Correction in progress", actor: author }).state, "Correction in progress");
  assert.throws(() => transition({ task: failed, to: "Accepted", actor: author, trustedValidation: true }), /forbidden/);
});

test("dependents unlock only after every dependency is Accepted", () => {
  const tasks = { A: { state: "Independently verified", dependencies: [] }, B: { state: "Open", dependencies: ["A"] } };
  assert.deepEqual(unlockableTasks(tasks), []);
  tasks.A.state = "Accepted";
  assert.deepEqual(unlockableTasks(tasks), ["B"]);
});

test("stale and expired leases requeue the same task", () => {
  const lease = { base_sha: sha, expires_at: "2026-09-08T10:00:00Z" };
  assert.equal(recoveryAction({ lease, remoteSha: "b".repeat(40), now: "2026-09-08T09:00:00Z" }), "reject-stale-and-requeue");
  assert.equal(recoveryAction({ lease, remoteSha: sha, now: "2026-09-08T11:00:00Z" }), "expire-lease-and-requeue-same-task");
});
