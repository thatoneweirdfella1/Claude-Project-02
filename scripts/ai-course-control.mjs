#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

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
  if (policy?.branch_creation_allowed !== false) errors.push("Branch creation must remain denied");
  if (!policy?.active_task || !policy?.task_profiles?.[policy.active_task]) errors.push("Active task profile is missing");
  if (!Array.isArray(policy?.required_files)) errors.push("required_files must be an array");
  if (!Array.isArray(policy?.required_changed_records)) errors.push("required_changed_records must be an array");
  if (!Array.isArray(policy?.append_only_files)) errors.push("append_only_files must be an array");
  if (!Array.isArray(policy?.immutable_files)) errors.push("immutable_files must be an array");
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

export function runGate({ policyPath, base, head, branch, repository }) {
  const policy = readJson(policyPath);
  validatePolicy(policy);
  const errors = [];

  if (repository !== policy.repository) errors.push(`Wrong repository: ${repository}`);
  if (branch !== policy.working_branch) errors.push(`Wrong branch: ${branch}`);
  if (policy.protected_branches.includes(branch)) errors.push(`Protected branch cannot be modified: ${branch}`);

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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const required = ["policy", "base", "head", "branch", "repository"];
  const missing = required.filter((key) => !args[key]);
  if (missing.length) throw new GateFailure("Missing required arguments", missing.map((key) => `--${key}`));
  const result = runGate({
    policyPath: args.policy,
    base: args.base,
    head: args.head,
    branch: args.branch,
    repository: args.repository,
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
