#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import { validateControlState, validateStateTransition } from "./ai-control-state.mjs";

export class GateFailure extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "GateFailure";
    this.details = details;
  }
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) throw new GateFailure(`Unexpected argument: ${item}`);
    const key = item.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new GateFailure(`Missing value for --${key}`);
    result[key] = value;
    index += 1;
  }
  return result;
}

function git(args, options = {}) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trimEnd();
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

export function globToRegex(pattern) {
  let output = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === "*" && pattern[index + 1] === "*") {
      output += ".*";
      index += 1;
    } else if (character === "*") {
      output += "[^/]*";
    } else {
      output += escapeRegex(character);
    }
  }
  return new RegExp(`${output}$`);
}

export function pathAllowed(filePath, patterns) {
  return patterns.some((pattern) => globToRegex(pattern).test(filePath));
}

export function validatePolicy(policy) {
  const errors = [];
  if (policy?.schema_version !== "1.0") errors.push("Unsupported policy schema_version");
  if (policy?.mode !== "enforce") errors.push("Policy mode must be enforce");
  if (policy?.failure_mode !== "closed") errors.push("Policy failure_mode must be closed");
  if (!policy?.repository) errors.push("Policy repository is missing");
  if (!policy?.working_branch) errors.push("Policy working_branch is missing");
  if (!policy?.integration_branch) errors.push("Policy integration_branch is missing");
  if (policy?.branch_creation_allowed !== false) errors.push("Branch creation must remain denied");
  if (!policy?.active_task || !policy?.task_profiles?.[policy.active_task]) errors.push("Active task profile is missing");
  if (!Array.isArray(policy?.required_files)) errors.push("required_files must be an array");
  if (!Array.isArray(policy?.required_changed_records)) errors.push("required_changed_records must be an array");
  if (!Array.isArray(policy?.append_only_files)) errors.push("append_only_files must be an array");
  if (!Array.isArray(policy?.immutable_files)) errors.push("immutable_files must be an array");
  if (!Array.isArray(policy?.immutable_branches)) errors.push("immutable_branches must be an array");
  if (!Array.isArray(policy?.protected_control_paths)) errors.push("protected_control_paths must be an array");
  if (!Array.isArray(policy?.protected_control_paths)) errors.push("protected_control_paths must be an array");
  if (!policy?.control_state_file) errors.push("control_state_file is missing");
  if (!policy?.traceability_file) errors.push("traceability_file is missing");
  if (!policy?.handoff_file) errors.push("handoff_file is missing");
  if (!policy?.current_task_file) errors.push("current_task_file is missing");
  if (!Array.isArray(policy?.permitted_gate_statuses) || policy.permitted_gate_statuses.length !== 4) {
    errors.push("Exactly four permitted gate statuses are required");
  }
  if (errors.length) throw new GateFailure("Course-control policy is invalid", errors);
  return true;
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new GateFailure(`Cannot parse ${filePath}`, [String(error.message || error)]);
  }
}

function readAtRevision(revision, filePath) {
  try {
    return git(["show", `${revision}:${filePath}`]);
  } catch {
    return null;
  }
}

function changedFiles(base, head) {
  const raw = git(["diff", "--name-status", "--no-renames", base, head]);
  if (!raw) return [];
  return raw.split("\n").map((line) => {
    const [status, ...pathParts] = line.split("\t");
    return { status, path: pathParts.join("\t") };
  });
}

function verifyIntegrityManifest(filePath) {
  const errors = [];
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    if (!match) {
      errors.push(`Malformed checksum line: ${line}`);
      continue;
    }
    const [, expected, target] = match;
    if (!existsSync(target)) {
      errors.push(`Checksum target missing: ${target}`);
      continue;
    }
    const actual = createHash("sha256").update(readFileSync(target)).digest("hex");
    if (actual !== expected) errors.push(`Checksum mismatch: ${target}`);
  }
  return errors;
}

function verifyPreservedHistory(base, head, filePath) {
  const previous = readAtRevision(base, filePath);
  const current = readAtRevision(head, filePath);
  if (previous === null || current === null) return [`History file missing at one revision: ${filePath}`];
  const missing = previous.split(/\r?\n/).filter(Boolean).filter((line) => !current.includes(line));
  return missing.length ? [`Historical content was removed from ${filePath}`] : [];
}

function verifyIndependentClaims(policy, base, head) {
  const errors = [];
  const manifestPath = "docs/ai-control/CONTROL-MANIFEST.json";
  const beforeText = readAtRevision(base, manifestPath);
  const afterText = readAtRevision(head, manifestPath);
  if (!afterText) return [`Missing ${manifestPath} at head`];
  let before = {};
  let after = {};
  try {
    before = beforeText ? JSON.parse(beforeText) : {};
    after = JSON.parse(afterText);
  } catch {
    return [`Invalid JSON in ${manifestPath}`];
  }
  const permitted = new Set(policy.permitted_gate_statuses);
  for (const [gate, status] of Object.entries(after.continuity_gates || {})) {
    if (!permitted.has(status)) errors.push(`Invalid status for ${gate}: ${status}`);
    if (status === "Independently verified" && before.continuity_gates?.[gate] !== status) {
      const reviewPath = `docs/ai-control/independent-reviews/${gate}.json`;
      if (!existsSync(reviewPath)) errors.push(`${gate} cannot become Independently verified without ${reviewPath}`);
    }
  }
  if (after.active_task?.id !== policy.active_task) {
    errors.push(`Manifest active task ${after.active_task?.id || "missing"} does not match policy ${policy.active_task}`);
  }
  return errors;
}

function parseRevisionJson(revision, filePath) {
  const text = readAtRevision(revision, filePath);
  if (text === null) return null;
  try { return JSON.parse(text); } catch { return null; }
}

function verifyTraceability(policy) {
  const errors = [];
  const trace = readJson(policy.traceability_file);
  if (!Array.isArray(trace.outcomes) || trace.outcomes.length !== 12) {
    return ["G1 traceability must contain exactly 12 registered outcomes"];
  }
  const ids = new Set();
  for (const outcome of trace.outcomes) {
    if (ids.has(outcome.id)) errors.push(`Duplicate traceability ID: ${outcome.id}`);
    ids.add(outcome.id);
    for (const field of ["id", "definition", "owner", "design_location", "acceptance_test", "evidence", "gate"]) {
      if (!outcome[field]) errors.push(`${outcome.id || "Unknown outcome"} missing traceability field ${field}`);
    }
    if (outcome.design_location && !existsSync(outcome.design_location)) errors.push(`${outcome.id} design location is missing: ${outcome.design_location}`);
  }
  return errors;
}

function verifyControlState(policy, base, head, requestedTask) {
  const errors = [];
  const state = readJson(policy.control_state_file);
  if (state.repository !== policy.repository) errors.push("Control-state repository does not match policy");
  if (state.working_branch !== policy.working_branch) errors.push("Control-state working branch does not match policy");
  if (state.accepted_branch !== policy.integration_branch) errors.push("Control-state accepted branch does not match policy");
  if (state.active_task !== policy.active_task) errors.push("Control-state active task does not match policy");
  errors.push(...validateControlState(state, { requestedTask }));
  const before = parseRevisionJson(base, policy.control_state_file);
  const after = parseRevisionJson(head, policy.control_state_file);
  if (!after) errors.push("Control state is missing or invalid at candidate head");
  else errors.push(...validateStateTransition(before, after));

  const handoff = existsSync(policy.handoff_file) ? readFileSync(policy.handoff_file, "utf8") : "";
  const currentTask = existsSync(policy.current_task_file) ? readFileSync(policy.current_task_file, "utf8") : "";
  if (!handoff) errors.push("Handoff record is missing");
  if (!currentTask) errors.push("Current-task record is missing");
  if (!handoff.includes(`SAFE TO SWITCH: ${state.safe_to_switch}`)) errors.push("Simple handoff safe-switch state disagrees with machine state");
  if (!handoff.includes(state.last_confirmed_remote_checkpoint)) errors.push("Handoff omits the machine state's last confirmed remote checkpoint");
  if (!currentTask.includes(`ID:** ${state.active_task}`)) errors.push("Current-task record disagrees with machine active task");
  return { errors, state };
}

export function runGate({ policyPath, base, head, branch, repository, requestedTask }) {
  const policy = readJson(policyPath);
  validatePolicy(policy);
  const errors = [];

  if (repository !== policy.repository) errors.push(`Wrong repository: ${repository}`);
  const allowedBranches = new Set([policy.working_branch, policy.integration_branch]);
  if (!allowedBranches.has(branch)) errors.push(`Wrong branch: ${branch}`);
  if (policy.immutable_branches.includes(branch)) errors.push(`Immutable branch cannot be modified: ${branch}`);

  const stateResult = verifyControlState(policy, base, head, requestedTask);
  errors.push(...stateResult.errors);
  if (branch === policy.working_branch && stateResult.state.last_confirmed_remote_checkpoint !== base) {
    errors.push(`Stale checkpoint: expected base ${stateResult.state.last_confirmed_remote_checkpoint}, actual base ${base}`);
  }
  if (branch === policy.integration_branch) {
    const task = stateResult.state.tasks?.[policy.active_task];
    if (task?.execution_state !== "Accepted" || task?.acceptance_state !== "Accepted") {
      errors.push(`Accepted baseline cannot receive unaccepted task ${policy.active_task}`);
    }
  }
  if (branch === policy.working_branch && stateResult.state.tasks?.[policy.active_task]?.execution_state === "Accepted") {
    errors.push(`Accepted task ${policy.active_task} cannot be modified on staging; activate the exact next authorized task`);
  }

  for (const required of policy.required_files) {
    if (!existsSync(required)) errors.push(`Required control file missing: ${required}`);
  }

  const profile = policy.task_profiles[policy.active_task];
  if (profile.locked) errors.push(`Active task ${policy.active_task} is locked`);
  const changes = changedFiles(base, head);
  if (!changes.length) errors.push("No changes found for the proposed task checkpoint");

  for (const change of changes) {
    if (change.status === "D") errors.push(`Deletion is prohibited: ${change.path}`);
    if (!pathAllowed(change.path, profile.allowed_paths)) errors.push(`Out-of-scope path: ${change.path}`);
    if (pathAllowed(change.path, policy.immutable_files)) errors.push(`Immutable baseline changed: ${change.path}`);
  }

  const changedPaths = new Set(changes.map((change) => change.path));
  const protectedChanges = changes.filter((change) => pathAllowed(change.path, policy.protected_control_paths));
  if (protectedChanges.length) {
    const declaration = stateResult.state.control_change;
    const declaredPaths = new Set(declaration?.paths || []);
    if (!declaration?.owner || !declaration?.gate || declaration?.independent_audit_required !== true || !declaration?.residual_risk) {
      errors.push("Protected control-plane changes require owner, gate, independent-audit requirement, and residual risk");
    }
    for (const change of protectedChanges) {
      if (!declaredPaths.has(change.path)) errors.push(`Undeclared protected control-plane change: ${change.path}`);
    }
    const reviewChanged = changes.some((change) => change.path.startsWith("docs/ai-control/independent-reviews/"));
    const activeTask = stateResult.state.tasks?.[policy.active_task];

    // Allow audit publication: independent auditor synchronizing review + state records
    // Reject self-approval: author claiming Independently verified or Accepted state
    const isAuditPublication = reviewChanged && activeTask?.reviewer_id && activeTask?.author_id && activeTask.reviewer_id !== activeTask.author_id;
    const isSelfApproval = ["Independently verified", "Accepted"].includes(activeTask?.execution_state) || activeTask?.acceptance_state === "Accepted";

    if (!isAuditPublication && (reviewChanged || isSelfApproval)) {
      errors.push("A protected control-plane change cannot carry or claim its own independent approval");
    }
  }
  for (const requiredRecord of policy.required_changed_records) {
    if (!changedPaths.has(requiredRecord)) errors.push(`Required continuity record was not updated: ${requiredRecord}`);
  }

  for (const filePath of policy.append_only_files) {
    const previous = readAtRevision(base, filePath);
    const current = readAtRevision(head, filePath);
    if (previous === null || current === null || !current.startsWith(previous)) {
      errors.push(`Append-only history was rewritten: ${filePath}`);
    }
  }

  for (const filePath of policy.preserve_history_files) {
    errors.push(...verifyPreservedHistory(base, head, filePath));
  }

  errors.push(...verifyIntegrityManifest("docs/ai-control/SHA256SUMS"));
  errors.push(...verifyIndependentClaims(policy, base, head));
  errors.push(...verifyTraceability(policy));

  if (errors.length) throw new GateFailure("AI course-control gate rejected the change", errors);
  return {
    accepted: true,
    task: policy.active_task,
    branch,
    base,
    head,
    changed_files: changes.map((change) => change.path),
  };
}

export function verifyPublicationPreflight({ repository, branch, state }) {
  const errors = [];

  // Verify remote branch exists and is reachable
  try {
    const remoteHead = git(["ls-remote", "origin", `refs/heads/${branch}`]);
    if (!remoteHead) {
      errors.push(`Remote branch ${branch} does not exist or is not accessible`);
    } else {
      const remoteHash = remoteHead.split(/\s+/)[0];
      if (!/^[a-f0-9]{40}$/.test(remoteHash)) {
        errors.push(`Remote branch ${branch} returned invalid hash: ${remoteHash}`);
      }
    }
  } catch (error) {
    errors.push(`Cannot verify remote branch: ${error.message || error}`);
  }

  // Verify all critical files exist
  const criticalFiles = [
    "docs/ai-control/CONTROL-STATE.json",
    "docs/ai-control/CONTROL-MANIFEST.json",
    "docs/ai-control/CONTINUITY-LEDGER.md",
    "docs/ai-control/EVIDENCE-INDEX.md",
    "docs/ai-control/GATE-STATUS.md",
    "docs/ai-control/HANDOFF.md",
    "docs/ai-control/CURRENT-TASK.md",
    "docs/ai-control/SHA256SUMS",
  ];

  for (const filePath of criticalFiles) {
    if (!existsSync(filePath)) {
      errors.push(`Critical file missing for publication: ${filePath}`);
    }
  }

  // Verify integrity manifest (SHA256SUMS)
  if (existsSync("docs/ai-control/SHA256SUMS")) {
    try {
      const manifestErrors = verifyIntegrityManifest("docs/ai-control/SHA256SUMS");
      errors.push(...manifestErrors);
    } catch (error) {
      errors.push(`Cannot verify SHA256SUMS: ${error.message || error}`);
    }
  }

  // Verify state is publication-ready
  if (state) {
    const activeTask = state.tasks?.[state.active_task];
    if (activeTask?.execution_state === "Accepted") {
      errors.push(`Active task ${state.active_task} is Accepted; cannot modify on staging branch`);
    }
    if (!["Self-check passed", "Awaiting independent audit", "Independently verified"].includes(activeTask?.execution_state)) {
      errors.push(`Active task execution state ${activeTask?.execution_state} is not publication-ready`);
    }
  }

  // Verify local state matches last confirmed remote
  try {
    const localHead = git(["rev-parse", "HEAD"]);
    const remoteRef = git(["rev-parse", `origin/${branch}`]);
    if (localHead !== remoteRef) {
      errors.push(`Local HEAD ${localHead.slice(0, 7)} diverges from remote ${remoteRef.slice(0, 7)}; push or pull first`);
    }
  } catch (error) {
    errors.push(`Cannot verify local/remote sync: ${error.message || error}`);
  }

  return {
    ready: errors.length === 0,
    errors,
    checks_passed: [
      errors.length === 0 && "Remote branch exists",
      existsSync("docs/ai-control/SHA256SUMS") && "Critical files present",
      errors.length === 0 && "Integrity verified",
      errors.length === 0 && "Publication-ready state",
      errors.length === 0 && "Local/remote sync",
    ].filter(Boolean),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  // Handle publication-preflight command
  if (args.command === "publication-preflight") {
    const state = readJson(args.state || "docs/ai-control/CONTROL-STATE.json");
    const result = verifyPublicationPreflight({
      repository: args.repository || state.repository,
      branch: args.branch || state.working_branch,
      state,
    });
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ready ? 0 : 1;
    return;
  }

  const required = ["policy", "base", "head", "branch", "repository"];
  const missing = required.filter((key) => !args[key]);
  if (missing.length) throw new GateFailure("Missing required arguments", missing.map((key) => `--${key}`));
  const result = runGate({
    policyPath: args.policy,
    base: args.base,
    head: args.head,
    branch: args.branch,
    repository: args.repository,
    requestedTask: args["requested-task"],
  });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  try {
    main();
  } catch (error) {
    const details = error instanceof GateFailure ? error.details : [];
    console.error(error.message || String(error));
    for (const detail of details) console.error(`- ${detail}`);
    process.exitCode = 1;
  }
}
