import { randomUUID } from "node:crypto";
import { transition } from "./transition.mjs";

const json = value => JSON.stringify(value);
const parse = value => value == null ? null : JSON.parse(value);

export class DurableControllerStore {
  constructor(redis, { clock = () => new Date(), retryLimit = 5 } = {}) { this.redis = redis; this.clock = clock; this.retryLimit = retryLimit; }
  key(repositoryId, type, suffix = "") { return `g3a:${repositoryId}:${type}${suffix ? `:${suffix}` : ""}`; }

  async initialize(repositoryId, bootstrap) {
    if (bootstrap?.bootstrap_version !== "2.0" || Number(bootstrap?.repository_id) !== Number(repositoryId) || !bootstrap?.state || !Array.isArray(bootstrap?.retained_history)) throw new Error("Invalid bootstrap package");
    const stateKey = this.key(repositoryId, "state"), historyKey = this.key(repositoryId, "history"), metadataKey = this.key(repositoryId, "bootstrap");
    const script = "if redis.call('EXISTS',KEYS[1])==1 then return 0 end; redis.call('SET',KEYS[1],ARGV[1]); redis.call('SET',KEYS[2],ARGV[2]); for i=3,#ARGV do redis.call('RPUSH',KEYS[3],ARGV[i]) end; return 1";
    const args = ["EVAL", script, "3", stateKey, metadataKey, historyKey, json(bootstrap.state), json({ bootstrap_version: bootstrap.bootstrap_version, source_commit: bootstrap.source_commit, source_tree: bootstrap.source_tree }), ...bootstrap.retained_history.map(json)];
    const result = await this.redis.command(...args);
    return Number(result) === 1;
  }
  async getState(repositoryId) { return parse(await this.redis.command("GET", this.key(repositoryId, "state"))); }
  async getLease(repositoryId, taskId) { return parse(await this.redis.command("GET", this.key(repositoryId, "lease", taskId))); }

  async compareAndSetLease(repositoryId, taskId, expected, lease) {
    const key = this.key(repositoryId, "lease", taskId), ttl = Math.max(1, Date.parse(lease.expires_at) - this.clock().getTime());
    const script = "local c=redis.call('GET',KEYS[1]); if (c or '') ~= ARGV[1] then return 0 end; redis.call('SET',KEYS[1],ARGV[2],'PX',ARGV[3]); return 1";
    const ok = await this.redis.command("EVAL", script, "1", key, expected ? json(expected) : "", json(lease), String(ttl));
    if (Number(ok) !== 1) throw new Error("Lease collision");
    await this.#mutate(repositoryId, state => { state.tasks[taskId].base_sha = lease.base_sha; return state; }, { type: "lease-acquired", task: taskId, lease_id: lease.lease_id });
  }

  async replaceLease(repositoryId, taskId, lease) {
    const ttl = Math.max(1, Date.parse(lease.expires_at) - this.clock().getTime());
    await this.redis.command("SET", this.key(repositoryId, "lease", taskId), json(lease), "PX", String(ttl));
    await this.#mutate(repositoryId, state => { state.tasks[taskId].base_sha = lease.base_sha; return state; }, { type: "lease-replaced", task: taskId, lease_id: lease.lease_id });
  }

  async heartbeatLease(repositoryId, taskId, principal, now, ttlMs) {
    const key = this.key(repositoryId, "lease", taskId);
    const script = "local v=redis.call('GET',KEYS[1]); if not v then return nil end; local l=cjson.decode(v); if l.worker_principal~=ARGV[1] then return false end; l.heartbeat_at=ARGV[2]; l.expires_at=ARGV[3]; local n=cjson.encode(l); redis.call('SET',KEYS[1],n,'PX',ARGV[4]); return n";
    const expires = new Date(Date.parse(now) + ttlMs).toISOString();
    const value = await this.redis.command("EVAL", script, "1", key, principal, now, expires, String(ttlMs));
    if (!value) throw new Error("Lease owner mismatch or expired lease"); return parse(value);
  }

  async transition(repositoryId, taskId, to, actor, attestation = null) {
    await this.#mutate(repositoryId, state => { state.tasks[taskId] = transition({ task: state.tasks[taskId], to, actor, attestation, trustedValidation: to === "Accepted", decisionQueue: state.decision_queue.filter(x => x.task === taskId) }); return state; }, { type: "transition", task: taskId, to, actor: actor.principal, candidate_sha: attestation?.candidate_sha || null });
  }

  async setCandidate(repositoryId, taskId, sha, author) { await this.#mutate(repositoryId, state => { Object.assign(state.tasks[taskId], { candidate_sha: sha, author_principal: author }); return state; }, { type: "candidate", task: taskId, candidate_sha: sha, actor: author }); }
  async enqueueAudit(item) { await this.enqueueJob(item.repositoryId, "audit", item, `${item.taskId}:${item.candidateSha}`); await this.#mutate(item.repositoryId, state => { if (!state.audit_queue.includes(item.taskId)) state.audit_queue.push(item.taskId); return state; }, { type: "audit-queued", task: item.taskId, candidate_sha: item.candidateSha }); }
  async enqueueTask(repositoryId, taskId) { return this.enqueueJob(repositoryId, "task", { repositoryId, taskId }, taskId); }
  async recordAttestation(item) { await this.redis.command("RPUSH", this.key(item.repository_id, "attestations"), json(item)); }

  async createCorrection(attestation) {
    let correction;
    await this.#mutate(attestation.repository_id, state => { const task = state.tasks[attestation.task]; task.attempt += 1; correction = { correction_id: `${attestation.task}:${task.attempt}`, repository_id: attestation.repository_id, task: attestation.task, attempt: task.attempt, failed_attestation_id: attestation.attestation_id, failed_candidate_sha: attestation.candidate_sha, defects: attestation.defects, acceptance_tests: attestation.acceptance_tests || attestation.defects, state: "Open" }; return state; }, { type: "correction-created", task: attestation.task, failed_attestation_id: attestation.attestation_id });
    await this.redis.command("RPUSH", this.key(attestation.repository_id, "corrections", attestation.task), json(correction)); return correction;
  }
  async getLatestCorrection(repositoryId, taskId) { return parse(await this.redis.command("LINDEX", this.key(repositoryId, "corrections", taskId), "-1")); }
  async expireLease(repositoryId, taskId, reason) { await this.redis.command("DEL", this.key(repositoryId, "lease", taskId)); await this.redis.command("RPUSH", this.key(repositoryId, "history"), json({ event_id: randomUUID(), at: this.clock().toISOString(), type: "lease-expired", task: taskId, reason })); }
  async requeueSameTask(repositoryId, taskId, reason) { await this.#mutate(repositoryId, state => { state.tasks[taskId].state = "Open"; return state; }, { type: "requeued", task: taskId, reason }); await this.enqueueJob(repositoryId, "recovery", { repositoryId, taskId, reason }, `${taskId}:${reason}`); }

  async enqueueJob(repositoryId, kind, payload, idempotencyKey) {
    const id = `${kind}:${idempotencyKey}`, jobKey = this.key(repositoryId, "job", id), queue = this.key(repositoryId, "queue");
    const job = { id, kind, payload, attempts: 0, status: "queued", available_at: this.clock().getTime() };
    const script = "if redis.call('EXISTS',KEYS[1])==1 then return 0 end; redis.call('SET',KEYS[1],ARGV[1]); redis.call('ZADD',KEYS[2],ARGV[2],ARGV[3]); return 1";
    return this.redis.command("EVAL", script, "2", jobKey, queue, json(job), String(job.available_at), id);
  }

  async claimDueJob(repositoryId) {
    const queue = this.key(repositoryId, "queue"), prefix = `${this.key(repositoryId, "job")}:`;
    const script = "local x=redis.call('ZRANGEBYSCORE',KEYS[1],'-inf',ARGV[1],'LIMIT',0,1); if #x==0 then return nil end; redis.call('ZREM',KEYS[1],x[1]); return redis.call('GET',ARGV[2]..x[1])";
    return parse(await this.redis.command("EVAL", script, "1", queue, String(this.clock().getTime()), prefix));
  }

  async finishJob(repositoryId, job) { job.status = "complete"; await this.redis.command("SET", this.key(repositoryId, "job", job.id), json(job)); }
  async failJob(repositoryId, job, error) {
    job.attempts += 1; job.last_error = String(error);
    if (job.attempts >= this.retryLimit) { await this.redis.command("RPUSH", this.key(repositoryId, "dead"), json({ ...job, status: "dead" })); job.attempts = 0; job.status = "queued"; job.available_at = this.clock().getTime() + 300_000; await this.redis.command("SET", this.key(repositoryId, "job", job.id), json(job)); await this.redis.command("ZADD", this.key(repositoryId, "queue"), String(job.available_at), job.id); return "dead-lettered-and-requeued"; }
    job.status = "queued"; job.available_at = this.clock().getTime() + Math.min(60_000, 1000 * 2 ** job.attempts);
    await this.redis.command("SET", this.key(repositoryId, "job", job.id), json(job)); await this.redis.command("ZADD", this.key(repositoryId, "queue"), String(job.available_at), job.id); return "retry";
  }

  deliveryStore(repositoryId) {
    return { has: async id => Boolean(await this.redis.command("EXISTS", this.key(repositoryId, "delivery", id))), reserve: async id => (await this.redis.command("SET", this.key(repositoryId, "delivery", id), json({ status: "reserved", at: this.clock().toISOString() }), "NX", "EX", "604800")) === "OK", complete: async id => this.redis.command("SET", this.key(repositoryId, "delivery", id), json({ status: "complete", at: this.clock().toISOString() }), "EX", "604800"), fail: async (id, error) => this.redis.command("SET", this.key(repositoryId, "delivery", id), json({ status: "failed", error, at: this.clock().toISOString() }), "EX", "604800") };
  }

  async #mutate(repositoryId, mutate, event) {
    const stateKey = this.key(repositoryId, "state"), historyKey = this.key(repositoryId, "history"), lockKey = this.key(repositoryId, "state-lock"), token = randomUUID();
    const locked = await this.redis.command("SET", lockKey, token, "NX", "PX", "10000"); if (!locked) throw new Error("State mutation collision");
    try {
      const current = parse(await this.redis.command("GET", stateKey)); if (!current) throw new Error("Controller state is not initialized");
      const next = mutate(current), record = { event_id: randomUUID(), at: this.clock().toISOString(), repository_id: repositoryId, ...event };
      const script = "if redis.call('GET',KEYS[1])~=ARGV[1] then return 0 end; redis.call('SET',KEYS[2],ARGV[2]); redis.call('RPUSH',KEYS[3],ARGV[3]); redis.call('DEL',KEYS[1]); return 1";
      if (Number(await this.redis.command("EVAL", script, "3", lockKey, stateKey, historyKey, token, json(next), json(record))) !== 1) throw new Error("State lock lost");
    } catch (error) { await this.redis.command("EVAL", "if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) end return 0", "1", lockKey, token); throw error; }
  }
}
