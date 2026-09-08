import { readFileSync } from "node:fs";

const table = JSON.parse(readFileSync(new URL("../docs/reliability/control/g3a/transition-table.json", import.meta.url), "utf8"));

export class TransitionError extends Error {}

export function transition({ task, to, actor, attestation = null, trustedValidation = false, decisionQueue = [] }) {
  const allowed = table.transitions[task.state] || [];
  if (!allowed.includes(to)) throw new TransitionError(`Transition ${task.state} -> ${to} is forbidden`);
  if (!actor?.principal || !actor?.authenticated) throw new TransitionError("Host-authenticated actor is required");

  if (to === "Awaiting independent audit" && actor.principal !== task.author_principal) {
    throw new TransitionError("Only the author worker may submit its self-check for audit");
  }
  if (["Failed", "Independently verified"].includes(to)) {
    if (!attestation?.host_signature) throw new TransitionError("Signed audit attestation is required");
    if (attestation.candidate_sha !== task.candidate_sha) throw new TransitionError("Audit candidate SHA mismatch");
    if (attestation.auditor_principal === task.author_principal) throw new TransitionError("Author cannot independently audit its work");
    const requiredVerdict = to === "Failed" ? "Failed" : "Independently verified";
    if (attestation.verdict !== requiredVerdict) throw new TransitionError("Audit verdict does not match transition");
  }
  if (to === "Accepted") {
    if (!trustedValidation) throw new TransitionError("Trusted validation is required for automatic acceptance");
    if (decisionQueue.length) throw new TransitionError("Unresolved product decision blocks acceptance");
  }
  return { ...task, state: to };
}

export function unlockableTasks(tasks) {
  return Object.entries(tasks)
    .filter(([, task]) => task.state === "Open" && task.dependencies.every((id) => tasks[id]?.state === "Accepted"))
    .map(([id]) => id);
}

export function recoveryAction({ lease, remoteSha, now }) {
  if (lease.base_sha !== remoteSha) return "reject-stale-and-requeue";
  if (Date.parse(lease.expires_at) <= Date.parse(now)) return "expire-lease-and-requeue-same-task";
  return "continue-current-lease";
}
