import { transition } from "./ai-control-trusted-transition.mjs";

export class MemoryControllerStore {
  constructor(state) { this.state = structuredClone(state); this.leases = new Map(); this.events = []; this.attestations = []; this.corrections = []; this.queue = []; }
  async getState() { return structuredClone(this.state); }
  async getLease(_repositoryId, taskId) { return structuredClone(this.leases.get(taskId) || null); }
  async compareAndSetLease(_repositoryId, taskId, expected, lease) {
    const current = this.leases.get(taskId) || null;
    if (JSON.stringify(current) !== JSON.stringify(expected)) throw new Error("Lease collision");
    this.leases.set(taskId, structuredClone(lease));
    this.state.tasks[taskId].base_sha = lease.base_sha;
  }
  async replaceLease(_repositoryId, taskId, lease) { this.leases.set(taskId, structuredClone(lease)); this.state.tasks[taskId].base_sha = lease.base_sha; }
  async heartbeatLease(_repositoryId, taskId, principal, now, ttlMs) {
    const lease = this.leases.get(taskId);
    if (!lease || lease.worker_principal !== principal) throw new Error("Lease owner mismatch");
    lease.heartbeat_at = now; lease.expires_at = new Date(Date.parse(now) + ttlMs).toISOString(); return structuredClone(lease);
  }
  async transition(_repositoryId, taskId, to, actor, attestation = null) {
    const current = this.state.tasks[taskId];
    this.state.tasks[taskId] = transition({ task: current, to, actor, attestation, trustedValidation: to === "Accepted", decisionQueue: this.state.decision_queue.filter(x => x.task === taskId) });
    this.events.push({ taskId, from: current.state, to, actor: actor.principal });
  }
  async setCandidate(_repositoryId, taskId, sha, author) { Object.assign(this.state.tasks[taskId], { candidate_sha: sha, author_principal: author }); }
  async enqueueAudit(item) { this.state.audit_queue.push(item.taskId); this.queue.push({ kind: "audit", ...item }); }
  async recordAttestation(item) { this.attestations.push(structuredClone(item)); }
  async createCorrection(attestation) {
    const task = this.state.tasks[attestation.task];
    task.attempt += 1;
    const correction = { correction_id: `${attestation.task}:${task.attempt}`, task: attestation.task, attempt: task.attempt, failed_attestation_id: attestation.attestation_id, failed_candidate_sha: attestation.candidate_sha, defects: attestation.defects, acceptance_tests: attestation.acceptance_tests || attestation.defects, state: "Open" };
    this.corrections.push(correction); return structuredClone(correction);
  }
  async getLatestCorrection(_repositoryId, taskId) { return structuredClone(this.corrections.filter(x => x.task === taskId).at(-1) || null); }
  async enqueueTask(repositoryId, taskId) { this.queue.push({ kind: "task", repositoryId, taskId }); }
  async expireLease(_repositoryId, taskId) { this.leases.delete(taskId); }
  async requeueSameTask(repositoryId, taskId, reason) { this.state.tasks[taskId].state = "Open"; this.queue.push({ kind: "recovery", repositoryId, taskId, reason }); }
}
