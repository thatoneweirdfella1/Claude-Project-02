import test from "node:test";
import assert from "node:assert/strict";
import { DurableControllerStore } from "../lib/durable-store.mjs";
import { DurableWorkers, WorkerConfigurationError } from "../lib/workers.mjs";
import { validateHostChange } from "../lib/trusted-validator.mjs";
import { rawBody } from "../lib/http.mjs";

class FakeRedis {
  constructor() { this.data = new Map(); this.lists = new Map(); this.zsets = new Map(); }
  async command(op, ...args) {
    op = op.toUpperCase();
    if (op === "GET") return this.data.get(args[0]) ?? null;
    if (op === "SET") { const [key, value, ...flags] = args; if (flags.includes("NX") && this.data.has(key)) return null; this.data.set(key, value); return "OK"; }
    if (op === "EXISTS") return this.data.has(args[0]) ? 1 : 0;
    if (op === "DEL") return this.data.delete(args[0]) ? 1 : 0;
    if (op === "RPUSH") { const list = this.lists.get(args[0]) || []; list.push(args[1]); this.lists.set(args[0], list); return list.length; }
    if (op === "LINDEX") { const list = this.lists.get(args[0]) || []; return list.at(Number(args[1])); }
    if (op === "ZADD") { const z = this.zsets.get(args[0]) || new Map(); z.set(args[2], Number(args[1])); this.zsets.set(args[0], z); return 1; }
    if (op !== "EVAL") throw new Error(`Unsupported ${op}`);
    const [script, keyCount, ...rest] = args, count = Number(keyCount), keys = rest.slice(0, count), argv = rest.slice(count);
    if (script.startsWith("local c=")) { const current = this.data.get(keys[0]) || ""; if (current !== argv[0]) return 0; this.data.set(keys[0], argv[1]); return 1; }
    if (script.startsWith("if redis.call('EXISTS',KEYS[1])==1 then return 0 end; redis.call('SET',KEYS[1],ARGV[1]); redis.call('SET',KEYS[2],ARGV[2])")) { if (this.data.has(keys[0])) return 0; this.data.set(keys[0], argv[0]); this.data.set(keys[1], argv[1]); this.lists.set(keys[2], argv.slice(2)); return 1; }
    if (script.startsWith("if redis.call('EXISTS'")) { if (this.data.has(keys[0])) return 0; this.data.set(keys[0], argv[0]); const z = this.zsets.get(keys[1]) || new Map(); z.set(argv[2], Number(argv[1])); this.zsets.set(keys[1], z); return 1; }
    if (script.startsWith("local x=redis.call('ZRANGEBYSCORE'")) { const z = this.zsets.get(keys[0]) || new Map(); const due = [...z].filter(([, score]) => score <= Number(argv[0])).sort((a,b) => a[1]-b[1])[0]; if (!due) return null; z.delete(due[0]); return this.data.get(argv[1] + due[0]) || null; }
    if (script.includes("l.worker_principal")) { const lease = JSON.parse(this.data.get(keys[0]) || "null"); if (!lease || lease.worker_principal !== argv[0]) return null; lease.heartbeat_at = argv[1]; lease.expires_at = argv[2]; const value = JSON.stringify(lease); this.data.set(keys[0], value); return value; }
    if (script.includes("redis.call('SET',KEYS[2],ARGV[2])")) { if (this.data.get(keys[0]) !== argv[0]) return 0; this.data.set(keys[1], argv[1]); const list = this.lists.get(keys[2]) || []; list.push(argv[2]); this.lists.set(keys[2], list); this.data.delete(keys[0]); return 1; }
    if (script.includes("redis.call('DEL',KEYS[1])")) { if (this.data.get(keys[0]) === argv[0]) return this.data.delete(keys[0]) ? 1 : 0; return 0; }
    throw new Error("Unsupported script");
  }
}

const sha = "a".repeat(40), base = "b".repeat(40), repositoryId = 1272469738;
const initialState = () => ({ schema_version: "1.0", repository_id: repositoryId, active_task: "A", decision_queue: [], audit_queue: [], tasks: { A: { state: "Open", attempt: 1, dependencies: [], base_sha: base, candidate_sha: null, author_principal: null, allowed_paths: ["docs/ai-control/**"] } } });
const initial = () => ({ bootstrap_version: "2.0", repository_id: repositoryId, source_commit: base, source_tree: sha, state: initialState(), retained_history: [{ event_id: "seed", type: "migration-seed" }] });

test("web handler preserves exact JSON bytes for GitHub signature verification", async () => {
  const body = '{\n  "repository": { "id": 1272469738 },\n  "ref": "refs/heads/divergence/reliability-staging"\n}\n';
  const request = new Request("https://controller.invalid/api/webhook", { method: "POST", headers: { "content-type": "application/json" }, body });
  assert.equal(await rawBody(request), body);
});

test("bootstrap is atomic, retains migration history, and never overwrites durable state", async () => {
  const redis = new FakeRedis(), store = new DurableControllerStore(redis), seed = initial();
  assert.equal(await store.initialize(repositoryId, seed), true);
  assert.deepEqual(await store.getState(repositoryId), seed.state);
  assert.equal(redis.lists.get(`g3a:${repositoryId}:history`).length, 1);
  const replacement = initial(); replacement.state.tasks.A.state = "Failed";
  assert.equal(await store.initialize(repositoryId, replacement), false);
  assert.equal((await store.getState(repositoryId)).tasks.A.state, "Open");
  await assert.rejects(store.initialize(repositoryId, { ...seed, bootstrap_version: "1.0" }), /Invalid bootstrap/);
});

test("durable lease acquisition is atomic and heartbeat is owner-bound", async () => {
  const store = new DurableControllerStore(new FakeRedis(), { clock: () => new Date("2026-09-08T20:00:00Z") }); await store.initialize(repositoryId, initial());
  const lease = { lease_id: "l1", repository_id: repositoryId, task: "A", attempt: 1, worker_principal: "author:a", base_sha: base, issued_at: "2026-09-08T20:00:00Z", heartbeat_at: "2026-09-08T20:00:00Z", expires_at: "2026-09-08T20:15:00Z", allowed_paths: ["docs/ai-control/**"] };
  await store.compareAndSetLease(repositoryId, "A", null, lease);
  await assert.rejects(store.compareAndSetLease(repositoryId, "A", null, { ...lease, lease_id: "l2" }), /collision/);
  await assert.rejects(store.heartbeatLease(repositoryId, "A", "intruder", lease.heartbeat_at, 1000), /owner/);
  assert.equal((await store.heartbeatLease(repositoryId, "A", "author:a", "2026-09-08T20:01:00Z", 60_000)).expires_at, "2026-09-08T20:02:00.000Z");
});

test("delivery reservation and queued jobs are idempotent", async () => {
  const store = new DurableControllerStore(new FakeRedis(), { clock: () => new Date("2026-09-08T20:00:00Z") }); await store.initialize(repositoryId, initial());
  const deliveries = store.deliveryStore(repositoryId); assert.equal(await deliveries.reserve("same"), true); assert.equal(await deliveries.reserve("same"), false);
  assert.equal(Number(await store.enqueueJob(repositoryId, "audit", { taskId: "A" }, `A:${sha}`)), 1); assert.equal(Number(await store.enqueueJob(repositoryId, "audit", { taskId: "A" }, `A:${sha}`)), 0);
  assert.equal((await store.claimDueJob(repositoryId)).kind, "audit");
});

test("retry ceiling retains dead-letter evidence and requeues same job", async () => {
  const clock = { now: Date.parse("2026-09-08T20:00:00Z") }, store = new DurableControllerStore(new FakeRedis(), { clock: () => new Date(clock.now), retryLimit: 2 }); await store.initialize(repositoryId, initial());
  await store.enqueueJob(repositoryId, "author", { taskId: "A" }, "A:1"); const job = await store.claimDueJob(repositoryId);
  assert.equal(await store.failJob(repositoryId, job, "usage lost"), "retry"); job.attempts = 1;
  assert.equal(await store.failJob(repositoryId, job, "usage lost again"), "dead-lettered-and-requeued");
});

test("author and auditor cannot share principal or credential", () => {
  const store = {};
  assert.throws(() => new DurableWorkers({ store, repositoryId, author: { principal: "same", token: "a" }, auditor: { principal: "same", token: "b" } }), WorkerConfigurationError);
  assert.throws(() => new DurableWorkers({ store, repositoryId, author: { principal: "a", token: "same" }, auditor: { principal: "b", token: "same" } }), WorkerConfigurationError);
});

test("trusted validator binds host repository and exact remote SHA", async () => {
  const github = async path => path === `/repositories/${repositoryId}` ? { id: repositoryId, full_name: "thatoneweirdfella1/Claude-Project-02" } : path.includes("git/ref") ? { object: { sha } } : { status: "ahead", files: [{ filename: "docs/ai-control/HANDOFF.md", status: "modified" }] };
  const result = await validateHostChange({ github, repositoryId, repositoryFullName: "thatoneweirdfella1/Claude-Project-02", stagingBranch: "divergence/reliability-staging", baseSha: base, candidateSha: sha, allowedPaths: ["docs/ai-control/**"] });
  assert.equal(result.passed, true); assert.equal(result.observed_staging_sha, sha);
});

test("candidate validator edits cannot widen deployed policy", async () => {
  const github = async path => path === `/repositories/${repositoryId}` ? { id: repositoryId, full_name: "thatoneweirdfella1/Claude-Project-02" } : path.includes("git/ref") ? { object: { sha } } : { status: "ahead", files: [{ filename: "scripts/ai-course-control.mjs", status: "modified" }, { filename: "src/App.tsx", status: "modified" }] };
  const result = await validateHostChange({ github, repositoryId, repositoryFullName: "thatoneweirdfella1/Claude-Project-02", stagingBranch: "divergence/reliability-staging", baseSha: base, candidateSha: sha, allowedPaths: ["scripts/ai-course-control.mjs"] });
  assert.equal(result.passed, false); assert.ok(result.failures.includes("out-of-scope:src/App.tsx"));
});
