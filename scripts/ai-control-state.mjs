import { existsSync, readFileSync } from "node:fs";

export const EXECUTION_STATES = new Set([
  "Open", "Active", "Interrupted — resumable", "Interrupted — unsafe",
  "Self-check passed", "Awaiting independent audit", "Independently verified",
  "Accepted", "Failed", "Potentially contaminated",
]);
export const DEPENDENCY_TYPES = new Set([
  "design prerequisite", "co-design dependency", "runtime input", "validation dependency",
]);
export const GATE_STATUSES = new Set(["Self-check passed", "Independently verified", "Failed", "Open"]);

const SATISFIES = {
  "Open": new Set(["Open", "Active", "Interrupted — resumable", "Self-check passed", "Awaiting independent audit", "Independently verified", "Accepted"]),
  "Active": new Set(["Active", "Interrupted — resumable", "Self-check passed", "Awaiting independent audit", "Independently verified", "Accepted"]),
  "Self-check passed": new Set(["Self-check passed", "Awaiting independent audit", "Independently verified", "Accepted"]),
  "Awaiting independent audit": new Set(["Awaiting independent audit", "Independently verified", "Accepted"]),
  "Independently verified": new Set(["Independently verified", "Accepted"]),
  "Accepted": new Set(["Accepted"]),
};

function isSha(value) { return typeof value === "string" && /^[a-f0-9]{40}$/.test(value); }

export function blockNotice(requested, blocker, nextAction) {
  return `BLOCKED: ${requested} cannot start because ${blocker}. NEXT: ${nextAction}`;
}

function defaultReadJson(path) { try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; } }

export function validateControlState(state, { requestedTask, fileExists = existsSync, readJsonFile = defaultReadJson } = {}) {
  const errors = [];
  if (state?.schema_version !== "1.0") errors.push("Unsupported control-state schema_version");
  if (!state?.active_task || !state?.tasks?.[state.active_task]) errors.push("Control state has no valid active task");
  const active = Object.entries(state?.tasks || {}).filter(([, task]) => task.execution_state === "Active");
  if (active.length > 1 || (active.length === 1 && active[0][0] !== state.active_task)) errors.push("No task other than active_task may be Active");
  if (state?.tasks?.[state.active_task]?.execution_state === "Open") errors.push("active_task cannot have Open execution state");
  if (!isSha(state?.last_confirmed_remote_checkpoint)) errors.push("Last confirmed remote checkpoint must be a full SHA");
  if (!["YES", "NO"].includes(state?.safe_to_switch)) errors.push("safe_to_switch must be YES or NO");
  if (!state?.first_unfinished_action) errors.push("First unfinished action is missing");
  if (!state?.recovery_action) errors.push("Recovery action is missing");
  for (const field of ["interpreted_outcome", "boundary", "material_ambiguity", "authority"]) {
    if (!state?.meaning_confirmation?.[field]) errors.push(`Meaning confirmation missing ${field}`);
  }

  for (const [id, task] of Object.entries(state?.tasks || {})) {
    if (!EXECUTION_STATES.has(task.execution_state)) errors.push(`${id} has invalid execution state ${task.execution_state}`);
    if (!["Not accepted", "Accepted"].includes(task.acceptance_state)) errors.push(`${id} has invalid acceptance state`);
    for (const dependency of task.prerequisites || []) {
      if (!state.tasks[dependency.task]) errors.push(`${id} depends on unknown task ${dependency.task}`);
      if (!DEPENDENCY_TYPES.has(dependency.type)) errors.push(`${id} has invalid dependency type ${dependency.type}`);
      if (!EXECUTION_STATES.has(dependency.required_state)) errors.push(`${id} has invalid required state ${dependency.required_state}`);
    }
    if (id === state.active_task) {
      if (!task.owner_id || !task.lock_acquired_at || !isSha(task.lock_base_commit)) {
        errors.push(`${id} active ownership lock is incomplete`);
      }
      if (task.lock_base_commit !== state.last_confirmed_remote_checkpoint) {
        errors.push(`${id} ownership lock base disagrees with last confirmed remote checkpoint`);
      }
      for (const dependency of task.prerequisites || []) {
        const actual = state.tasks[dependency.task]?.execution_state;
        if (!SATISFIES[dependency.required_state]?.has(actual)) {
          errors.push(blockNotice(id, `${dependency.task} is ${actual || "missing"}; ${dependency.required_state} is required`, state.first_unfinished_action));
        }
      }
    }
    if (task.execution_state === "Independently verified" || task.execution_state === "Accepted" || task.acceptance_state === "Accepted") {
      if (!task.author_id || !task.reviewer_id || task.author_id === task.reviewer_id) errors.push(`${id} lacks an independent reviewer distinct from its author`);
      if (!task.independent_review_path || !fileExists(task.independent_review_path)) errors.push(`${id} lacks retained independent review evidence`);
      else {
        const review = readJsonFile(task.independent_review_path);
        if (!review || review.task_id !== id || review.author_id !== task.author_id || review.reviewer_id !== task.reviewer_id || review.verdict !== "Independently verified" || !isSha(review.audited_commit)) {
          errors.push(`${id} independent review evidence does not match task, actors, verdict, and audited commit`);
        }
      }
    }
    if (task.execution_state === "Accepted" || task.acceptance_state === "Accepted") {
      if (task.execution_state !== "Accepted" || task.acceptance_state !== "Accepted") errors.push(`${id} has inconsistent accepted states`);
      if (!isSha(task.accepted_integration_commit)) errors.push(`${id} acceptance lacks a full integration commit`);
    }
    if (task.execution_state === "Potentially contaminated" && task.acceptance_state === "Accepted") errors.push(`${id} is contaminated but accepted`);
  }

  if (!Array.isArray(state?.audit_queue)) errors.push("Audit queue is missing");
  for (const item of state?.audit_queue || []) {
    if (!item.task || !state.tasks?.[item.task] || !item.required_audit || !item.status) errors.push("Audit queue item is incomplete");
  }
  const activeTask = state?.tasks?.[state?.active_task];
  if (activeTask?.independent_audit_required) {
    const queued = state.audit_queue?.some((item) => item.task === state.active_task && item.status === "Open");
    if (!queued) errors.push(`${state.active_task} requires an Open independent-audit queue item`);
  }

  const targetId = requestedTask || state?.active_task;
  const target = state?.tasks?.[targetId];
  if (!target) errors.push(blockNotice(targetId, "the task is not registered", `finish ${state?.active_task || "the current task"}`));
  else if (targetId === state.active_task && target.execution_state === "Interrupted — unsafe") {
    errors.push(blockNotice(targetId, "its interrupted checkpoint is unsafe", state.recovery_action));
  } else if (targetId !== state.active_task) {
    const unmet = (target.prerequisites || []).find((dependency) => {
      const actual = state.tasks[dependency.task]?.execution_state;
      return !SATISFIES[dependency.required_state]?.has(actual);
    });
    const reason = unmet
      ? `${unmet.task} is ${state.tasks[unmet.task]?.execution_state || "missing"}; ${unmet.required_state} is required`
      : `${state.active_task} is still the one active task`;
    errors.push(blockNotice(targetId, reason, state.first_unfinished_action));
  }

  const nodeMap = new Map((state?.lineage?.nodes || []).map((node) => [node.id, node]));
  const edges = state?.lineage?.edges || [];
  for (const edge of edges) {
    if (!nodeMap.has(edge.from) || !nodeMap.has(edge.to)) errors.push(`Lineage edge references an unknown node: ${edge.from} -> ${edge.to}`);
    if (!DEPENDENCY_TYPES.has(edge.type)) errors.push(`Lineage edge has invalid dependency type: ${edge.type}`);
  }
  const invalid = new Set([...nodeMap].filter(([, node]) => ["Failed", "Potentially contaminated"].includes(node.state)).map(([id]) => id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of edges) if (invalid.has(edge.from) && !invalid.has(edge.to)) { invalid.add(edge.to); changed = true; }
  }
  for (const id of invalid) {
    const stateValue = nodeMap.get(id)?.state;
    if (stateValue && !["Failed", "Potentially contaminated"].includes(stateValue)) errors.push(`Lineage descendant ${id} must be Potentially contaminated`);
  }
  return errors;
}

export function validateStateTransition(before, after) {
  const errors = [];
  if (!before) return errors;
  if (before.active_task !== after.active_task) {
    const previous = before.tasks?.[before.active_task];
    const next = after.tasks?.[after.active_task];
    const normalAdvance = previous?.execution_state === "Accepted" && previous?.acceptance_state === "Accepted";
    const authorizedCorrection = previous?.execution_state === "Failed"
      && next?.execution_state === "Active"
      && next?.corrects_task === before.active_task
      && Boolean(next?.activation_authority);
    if (!normalAdvance && !authorizedCorrection) errors.push(`Cannot leave unfinished or unaccepted task ${before.active_task}`);
  }
  for (const [id, task] of Object.entries(after.tasks || {})) {
    const prior = before.tasks?.[id];
    if (!prior) continue;
    if (prior.execution_state === "Potentially contaminated" && task.execution_state === "Accepted") {
      errors.push(`${id} cannot move directly from contaminated to accepted`);
    }
    if (prior.acceptance_state === "Accepted" && task.acceptance_state !== "Accepted") {
      errors.push(`${id} accepted history cannot be silently removed`);
    }
  }
  return errors;
}

export function readControlState(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
