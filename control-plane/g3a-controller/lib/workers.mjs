import { createHash } from "node:crypto";

const fingerprint = value => createHash("sha256").update(value).digest("hex");
export class WorkerConfigurationError extends Error {}

export class DurableWorkers {
  constructor({ store, repositoryId, author, auditor, fetchImpl = fetch }) {
    if (!author?.principal || !auditor?.principal || !author?.token || !auditor?.token) throw new WorkerConfigurationError("Both worker identities and credentials are required");
    if (author.principal === auditor.principal || fingerprint(author.token) === fingerprint(auditor.token)) throw new WorkerConfigurationError("Author and auditor credentials must be distinct");
    this.store = store; this.repositoryId = repositoryId; this.author = author; this.auditor = auditor; this.fetch = fetchImpl;
  }
  async selectDistinctAuditor({ excludePrincipal }) { if (this.auditor.principal === excludePrincipal) return null; return { principal: this.auditor.principal, authenticated: true }; }
  async selectCorrectionWorker({ excludePrincipal }) { if (this.author.principal === excludePrincipal) return null; return { principal: this.author.principal, authenticated: true }; }
  async launchAuthor(payload) { await this.store.enqueueJob(this.repositoryId, "author", payload, `${payload.taskId}:${payload.lease.lease_id}`); return this.dispatchDue(); }
  async launchAuditor(payload) { return this.dispatchDue(); }
  async launchCorrection(payload) { await this.store.enqueueJob(this.repositoryId, "correction", payload, `${payload.taskId}:${payload.lease.lease_id}`); return this.dispatchDue(); }
  async dispatchDue() {
    const job = await this.store.claimDueJob(this.repositoryId); if (!job) return null;
    const identity = job.kind === "audit" ? this.auditor : this.author;
    try {
      if (!identity.url) throw new WorkerConfigurationError(`${job.kind} worker URL is not configured`);
      const response = await this.fetch(identity.url, { method: "POST", headers: { authorization: `Bearer ${identity.token}`, "content-type": "application/json", "idempotency-key": job.id }, body: JSON.stringify(job.payload) });
      if (!response.ok) throw new Error(`Worker HTTP ${response.status}`);
      await this.store.finishJob(this.repositoryId, job); return { dispatched: job.id };
    } catch (error) { return { action: await this.store.failJob(this.repositoryId, job, error), job: job.id }; }
  }
}
