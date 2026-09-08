import { createHash, randomUUID } from "node:crypto";
import { recoveryAction, transition, unlockableTasks } from "./ai-control-trusted-transition.mjs";

export class ControllerError extends Error {}

export function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export class AutonomyController {
  constructor({ store, host, workers, clock = () => new Date(), policyVersion = "g3a-1" }) {
    if (!store || !host || !workers) throw new ControllerError("store, host, and workers are required");
    this.store = store;
    this.host = host;
    this.workers = workers;
    this.clock = clock;
    this.policyVersion = policyVersion;
  }

  async observe(repositoryId) {
    const state = await this.store.getState(repositoryId);
    const remote = await this.host.getRemoteTruth(repositoryId);
    if (!state || !remote) throw new ControllerError("Canonical state and remote truth are required");
    return { state, remote };
  }

  async acquire(repositoryId, taskId, worker) {
    const { state, remote } = await this.observe(repositoryId);
    const task = state.tasks[taskId];
    if (!task || task.state !== "Open") throw new ControllerError("Task is not open");
    if (!unlockableTasks(state.tasks).includes(taskId)) throw new ControllerError("Task dependencies are not accepted");
    if (!worker?.principal || !worker?.authenticated) throw new ControllerError("Authenticated worker is required");
    const now = this.clock();
    const lease = {
      lease_id: randomUUID(), repository_id: repositoryId, task: taskId, attempt: task.attempt,
      worker_principal: worker.principal, base_sha: remote.staging_sha,
      issued_at: now.toISOString(), heartbeat_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 15 * 60_000).toISOString(), allowed_paths: task.allowed_paths
    };
    await this.store.compareAndSetLease(repositoryId, taskId, null, lease);
    await this.store.transition(repositoryId, taskId, "Leased", { principal: "controller", authenticated: true });
    await this.workers.launchAuthor({ repositoryId, taskId, lease });
    return lease;
  }

  async submitSelfCheck(repositoryId, taskId, candidateSha, author) {
    const state = await this.store.getState(repositoryId);
    const task = state.tasks[taskId];
    const lease = await this.store.getLease(repositoryId, taskId);
    if (!lease || lease.worker_principal !== author.principal) throw new ControllerError("Author does not own the active lease");
    const remote = await this.host.getRemoteTruth(repositoryId);
    if (remote.staging_sha !== candidateSha) throw new ControllerError("Candidate is not the remote staging head");
    await this.store.setCandidate(repositoryId, taskId, candidateSha, author.principal);
    await this.store.transition(repositoryId, taskId, "Self-check passed", author);
    await this.store.transition(repositoryId, taskId, "Awaiting independent audit", author);
    const auditor = await this.workers.selectDistinctAuditor({ excludePrincipal: author.principal });
    if (!auditor || auditor.principal === author.principal) throw new ControllerError("Distinct authenticated auditor unavailable");
    await this.store.enqueueAudit({ repositoryId, taskId, candidateSha, authorPrincipal: author.principal, auditorPrincipal: auditor.principal });
    await this.workers.launchAuditor({ repositoryId, taskId, candidateSha, auditor });
  }

  async receiveAudit(attestation) {
    if (!(await this.host.verifyAttestation(attestation))) throw new ControllerError("Audit attestation is not host-authenticated");
    const state = await this.store.getState(attestation.repository_id);
    const task = state.tasks[attestation.task];
    const actor = { principal: attestation.auditor_principal, authenticated: true };
    transition({ task, to: attestation.verdict, actor, attestation });
    await this.store.recordAttestation(attestation);
    await this.store.transition(attestation.repository_id, attestation.task, attestation.verdict, actor, attestation);
    if (attestation.verdict === "Failed") {
      const correction = await this.store.createCorrection(attestation);
      await this.store.transition(attestation.repository_id, attestation.task, "Correction in progress", { principal: "controller", authenticated: true });
      await this.workers.launchCorrection(correction);
      return { action: "correction-launched", correction };
    }
    return this.tryAutomaticAcceptance(attestation.repository_id, attestation.task);
  }

  async tryAutomaticAcceptance(repositoryId, taskId) {
    const state = await this.store.getState(repositoryId);
    const task = state.tasks[taskId];
    const validation = await this.host.runTrustedValidation({ repositoryId, candidateSha: task.candidate_sha, policyVersion: this.policyVersion });
    if (!validation.passed) throw new ControllerError("Trusted validation failed");
    const decisions = state.decision_queue.filter((item) => item.task === taskId);
    transition({ task, to: "Accepted", actor: { principal: "controller", authenticated: true }, trustedValidation: true, decisionQueue: decisions });
    await this.store.transition(repositoryId, taskId, "Accepted", { principal: "controller", authenticated: true });
    const next = unlockableTasks((await this.store.getState(repositoryId)).tasks);
    await this.host.publishCheck({ repositoryId, candidateSha: task.candidate_sha, conclusion: "success", policyVersion: this.policyVersion });
    for (const id of next) await this.store.enqueueTask(repositoryId, id);
    return { action: "accepted", unlocked: next };
  }

  async reconcile(repositoryId) {
    const { state, remote } = await this.observe(repositoryId);
    const actions = [];
    for (const [taskId, task] of Object.entries(state.tasks)) {
      if (!['Leased', 'In progress', 'Correction in progress'].includes(task.state)) continue;
      const lease = await this.store.getLease(repositoryId, taskId);
      if (!lease) continue;
      const action = recoveryAction({ lease, remoteSha: remote.staging_sha, now: this.clock().toISOString() });
      if (action !== "continue-current-lease") {
        await this.store.expireLease(repositoryId, taskId, action);
        await this.store.requeueSameTask(repositoryId, taskId, action);
        actions.push({ taskId, action });
      }
    }
    return actions;
  }
}

