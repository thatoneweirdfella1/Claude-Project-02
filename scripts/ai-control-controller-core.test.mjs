import test from "node:test";
import assert from "node:assert/strict";
import { AutonomyController, ControllerError } from "./ai-control-controller-core.mjs";
import { MemoryControllerStore } from "./ai-control-controller-memory-store.mjs";

const sha = "a".repeat(40);
const state = () => ({ decision_queue: [], audit_queue: [], tasks: {
  A: { state: "Open", attempt: 1, dependencies: [], candidate_sha: null, author_principal: null, allowed_paths: ["x"] },
  B: { state: "Open", attempt: 1, dependencies: ["A"], candidate_sha: null, author_principal: null, allowed_paths: ["y"] }
}});

function fixture() {
  const store = new MemoryControllerStore(state());
  const calls = [];
  const host = { getRemoteTruth: async repositoryId => ({ repository_id: repositoryId, staging_sha: sha }), verifyAttestation: async () => true, runTrustedValidation: async () => ({ passed: true }), publishCheck: async x => calls.push(["check", x]) };
  const workers = { launchAuthor: async x => calls.push(["author", x]), selectDistinctAuditor: async () => ({ principal: "auditor:b", authenticated: true }), launchAuditor: async x => calls.push(["auditor", x]), selectCorrectionWorker: async () => ({ principal: "author:c", authenticated: true }), launchCorrection: async x => calls.push(["correction", x]) };
  const controller = new AutonomyController({ store, host, workers, clock: () => new Date("2026-09-08T10:00:00Z") });
  return { controller, store, host, workers, calls };
}

test("controller refuses dependent work before prerequisite acceptance", async () => {
  const { controller } = fixture();
  await assert.rejects(controller.acquire(1, "B", { principal: "author:a", authenticated: true }), /dependencies/);
});

test("self-check automatically assigns distinct auditor", async () => {
  const { controller, store, calls } = fixture();
  const author = { principal: "author:a", authenticated: true };
  await controller.acquire(1, "A", author);
  await store.transition(1, "A", "In progress", author);
  await controller.submitSelfCheck(1, "A", sha, author);
  assert.equal((await store.getState()).tasks.A.state, "Awaiting independent audit");
  assert.ok(calls.some(([kind]) => kind === "auditor"));
});

test("verified audit automatically accepts and unlocks dependent", async () => {
  const { controller, store } = fixture();
  const author = { principal: "author:a", authenticated: true };
  await controller.acquire(1, "A", author); await store.transition(1, "A", "In progress", author); await controller.submitSelfCheck(1, "A", sha, author);
  const result = await controller.receiveAudit({ attestation_id: "att", repository_id: 1, task: "A", candidate_sha: sha, auditor_principal: "auditor:b", verdict: "Independently verified", host_signature: "sig" });
  assert.equal(result.action, "accepted"); assert.deepEqual(result.unlocked, ["B"]);
});

test("failed audit automatically launches retained correction", async () => {
  const { controller, store, calls } = fixture();
  const author = { principal: "author:a", authenticated: true };
  await controller.acquire(1, "A", author); await store.transition(1, "A", "In progress", author); await controller.submitSelfCheck(1, "A", sha, author);
  const result = await controller.receiveAudit({ attestation_id: "bad", repository_id: 1, task: "A", candidate_sha: sha, auditor_principal: "auditor:b", verdict: "Failed", defects: ["broken"], host_signature: "sig" });
  assert.equal(result.action, "correction-launched"); assert.ok(calls.some(([kind]) => kind === "correction")); assert.equal(store.attestations[0].verdict, "Failed");
});

test("correction self-check automatically receives another distinct audit", async () => {
  const { controller, store, calls } = fixture();
  const author = { principal: "author:a", authenticated: true };
  await controller.acquire(1, "A", author); await store.transition(1, "A", "In progress", author); await controller.submitSelfCheck(1, "A", sha, author);
  await controller.receiveAudit({ attestation_id: "bad", repository_id: 1, task: "A", candidate_sha: sha, auditor_principal: "auditor:b", verdict: "Failed", defects: ["broken"], host_signature: "sig" });
  const correction = { principal: "author:c", authenticated: true };
  await controller.submitSelfCheck(1, "A", sha, correction);
  assert.equal((await store.getState()).tasks.A.state, "Awaiting independent audit");
  assert.equal((await store.getState()).tasks.A.author_principal, "author:c");
  assert.ok(calls.filter(([kind]) => kind === "auditor").length >= 2);
});

test("unverified audit is rejected", async () => {
  const { controller, host } = fixture(); host.verifyAttestation = async () => false;
  await assert.rejects(controller.receiveAudit({ repository_id: 1 }), ControllerError);
});
