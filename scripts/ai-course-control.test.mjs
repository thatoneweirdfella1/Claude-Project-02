import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  GateFailure,
  globToRegex,
  pathAllowed,
  runGate,
  validatePolicy,
} from "./ai-course-control.mjs";
import { blockNotice, validateControlState, validateStateTransition } from "./ai-control-state.mjs";

const REPOSITORY = "owner/repo";
const WORKING_BRANCH = "divergence/reliability-staging";

const validPolicy = {
  schema_version: "1.0",
  mode: "enforce",
  failure_mode: "closed",
  repository: REPOSITORY,
  working_branch: WORKING_BRANCH,
  integration_branch: "divergence/reliability-v1",
  immutable_branches: ["safety"],
  branch_creation_allowed: false,
  active_task: "G0",
  control_state_file: "docs/ai-control/CONTROL-STATE.json",
  traceability_file: "traceability.json",
  handoff_file: "handoff.md",
  current_task_file: "task.md",
  permitted_gate_statuses: ["Self-check passed", "Independently verified", "Failed", "Open"],
  required_files: [
    "task.md",
    "ledger.md",
    "decisions.md",
    "evidence.md",
    "handoff.md",
    "baseline.png",
    "docs/ai-control/CONTROL-MANIFEST.json",
    "docs/ai-control/CONTROL-STATE.json",
    "docs/ai-control/COURSE-CONTROL.json",
    "docs/ai-control/SHA256SUMS",
    "traceability.json",
  ],
  required_changed_records: ["ledger.md", "evidence.md", "handoff.md", "docs/ai-control/SHA256SUMS"],
  append_only_files: ["ledger.md"],
  preserve_history_files: ["decisions.md"],
  immutable_files: ["baseline.png"],
  task_profiles: {
    G0: {
      allowed_paths: [
        "task.md",
        "ledger.md",
        "decisions.md",
        "evidence.md",
        "handoff.md",
        "baseline.png",
        "docs/ai-control/CONTROL-MANIFEST.json",
        "docs/ai-control/CONTROL-STATE.json",
        "docs/ai-control/COURSE-CONTROL.json",
        "docs/ai-control/SHA256SUMS",
        "traceability.json",
        "review.json",
      ],
    },
    F0: { locked: true, allowed_paths: ["task.md", "ledger.md", "evidence.md", "handoff.md", "docs/ai-control/**"] },
  },
};

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeChecksums(root, files) {
  const lines = files
    .filter((file) => file !== "docs/ai-control/SHA256SUMS")
    .sort()
    .map((file) => {
      const hash = createHash("sha256").update(readFileSync(join(root, file))).digest("hex");
      return `${hash}  ${file}`;
    });
  writeFileSync(join(root, "docs/ai-control/SHA256SUMS"), `${lines.join("\n")}\n`);
}

function append(filePath, text) {
  writeFileSync(filePath, `${readFileSync(filePath, "utf8")}${text}`);
}

function makeState() {
  return {
    schema_version: "1.0",
    repository: REPOSITORY,
    working_branch: WORKING_BRANCH,
    accepted_branch: "divergence/reliability-v1",
    active_task: "G0",
    current_phase: "G0-C",
    safe_to_switch: "NO",
    last_confirmed_remote_checkpoint: "a".repeat(40),
    first_unfinished_action: "Finish G0-C.",
    meaning_confirmation: { interpreted_outcome: "Enforce course.", boundary: "No app work.", material_ambiguity: "none", authority: "test" },
    tasks: {
      G0: { title: "Gate", execution_state: "Active", acceptance_state: "Not accepted", author_id: "author", reviewer_id: null, independent_review_path: null, accepted_integration_commit: null, prerequisites: [] },
      F0: { title: "Next", execution_state: "Open", acceptance_state: "Not accepted", author_id: null, reviewer_id: null, independent_review_path: null, accepted_integration_commit: null, prerequisites: [{ task: "G0", type: "validation dependency", required_state: "Accepted" }] },
    },
    lineage: { nodes: [{ id: "G0", state: "Active", commit: null }], edges: [] },
  };
}

function makeTraceability() {
  return { outcomes: Array.from({ length: 12 }, (_, index) => ({ id: `G1-O${String(index + 1).padStart(2, "0")}`, definition: "Defined", owner: "G1", design_location: "task.md", acceptance_test: "test", evidence: "evidence", gate: "G1-G05" })) };
}

function setupFixture({ mutate, refreshChecksums = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "divergence-gate-"));
  mkdirSync(join(root, "docs/ai-control"), { recursive: true });
  writeFileSync(join(root, "task.md"), "# G0\n- **ID:** G0\n");
  writeFileSync(join(root, "ledger.md"), "CL-0001 baseline\n");
  writeFileSync(join(root, "decisions.md"), "D-001 preserve\n");
  writeFileSync(join(root, "evidence.md"), "E-001 baseline\n");
  writeFileSync(join(root, "handoff.md"), `**SAFE TO SWITCH: NO**\nCheckpoint ${"a".repeat(40)}\nNext: G0\n`);
  writeFileSync(join(root, "baseline.png"), "immutable visual bytes\n");
  writeJson(join(root, "docs/ai-control/COURSE-CONTROL.json"), validPolicy);
  writeJson(join(root, "docs/ai-control/CONTROL-MANIFEST.json"), {
    active_task: { id: "G0" },
    continuity_gates: { "RCG-01": "Open" },
  });
  writeJson(join(root, "docs/ai-control/CONTROL-STATE.json"), makeState());
  writeJson(join(root, "traceability.json"), makeTraceability());
  const tracked = validPolicy.required_files;
  writeChecksums(root, tracked);
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "gate@example.invalid"]);
  git(root, ["config", "user.name", "Gate Test"]);
  git(root, ["add", "."]);
  git(root, ["commit", "-qm", "baseline"]);
  const base = git(root, ["rev-parse", "HEAD"]);

  append(join(root, "task.md"), "accepted work\n");
  append(join(root, "ledger.md"), "CL-0002 accepted work\n");
  append(join(root, "evidence.md"), "E-002 accepted evidence\n");
  append(join(root, "handoff.md"), "Checkpoint complete\n");
  if (mutate) mutate(root);
  if (refreshChecksums) writeChecksums(root, tracked);
  git(root, ["add", "-A"]);
  git(root, ["commit", "-qm", "candidate"]);
  const head = git(root, ["rev-parse", "HEAD"]);
  return { root, base, head };
}

function executeFixture(fixture, overrides = {}) {
  const previous = process.cwd();
  process.chdir(fixture.root);
  try {
    return runGate({
      policyPath: "docs/ai-control/COURSE-CONTROL.json",
      base: fixture.base,
      head: fixture.head,
      branch: WORKING_BRANCH,
      repository: REPOSITORY,
      ...overrides,
    });
  } finally {
    process.chdir(previous);
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

function expectRejected(fixture, expectedDetail, overrides = {}) {
  assert.throws(
    () => executeFixture(fixture, overrides),
    (error) => error instanceof GateFailure && error.details.some((detail) => detail.includes(expectedDetail)),
  );
}

test("double-star patterns stay inside their declared prefix", () => {
  assert.equal(globToRegex("docs/ai-control/**").test("docs/ai-control/HANDOFF.md"), true);
  assert.equal(globToRegex("docs/ai-control/**").test("src/App.tsx"), false);
});

test("exact allowed paths do not allow similarly named files", () => {
  assert.equal(pathAllowed("AGENTS.md", ["AGENTS.md"]), true);
  assert.equal(pathAllowed("other/AGENTS.md", ["AGENTS.md"]), false);
});

test("valid policy passes", () => {
  assert.equal(validatePolicy(validPolicy), true);
});

test("accepted in-scope checkpoint passes", () => {
  assert.equal(executeFixture(setupFixture()).accepted, true);
});

test("wrong repository is rejected", () => {
  expectRejected(setupFixture(), "Wrong repository", { repository: "other/repo" });
});

test("wrong or newly invented branch is rejected", () => {
  expectRejected(setupFixture(), "Wrong branch", { branch: "ai/new-branch" });
});

test("immutable safety branch is rejected", () => {
  expectRejected(setupFixture(), "Immutable branch cannot be modified", { branch: "safety" });
});

test("protected integration branch accepts only an independently reviewed accepted checkpoint", () => {
  const fixture = setupFixture({ mutate(root) {
    const review = "review.json";
    writeJson(join(root, review), { task_id: "G0", author_id: "author", reviewer_id: "reviewer", verdict: "Independently verified", audited_commit: "c".repeat(40) });
    const statePath = join(root, "docs/ai-control/CONTROL-STATE.json");
    const state = JSON.parse(readFileSync(statePath, "utf8"));
    Object.assign(state.tasks.G0, { execution_state: "Accepted", acceptance_state: "Accepted", reviewer_id: "reviewer", independent_review_path: review, accepted_integration_commit: "b".repeat(40) });
    state.lineage.nodes[0].state = "Accepted";
    writeJson(statePath, state);
  }});
  assert.equal(executeFixture(fixture, { branch: "divergence/reliability-v1" }).accepted, true);
});

test("out-of-scope application file is rejected", () => {
  const fixture = setupFixture({ mutate(root) {
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, "src/App.tsx"), "scope drift\n");
  }});
  expectRejected(fixture, "Out-of-scope path: src/App.tsx");
});

test("tracked-file deletion is rejected", () => {
  const fixture = setupFixture({
    refreshChecksums: false,
    mutate(root) { rmSync(join(root, "task.md")); },
  });
  expectRejected(fixture, "Deletion is prohibited: task.md");
});

test("immutable visual baseline change is rejected", () => {
  const fixture = setupFixture({ mutate(root) { writeFileSync(join(root, "baseline.png"), "changed\n"); }});
  expectRejected(fixture, "Immutable baseline changed: baseline.png");
});

test("append-only ledger rewrite is rejected", () => {
  const fixture = setupFixture({ mutate(root) { writeFileSync(join(root, "ledger.md"), "rewritten\n"); }});
  expectRejected(fixture, "Append-only history was rewritten: ledger.md");
});

test("missing continuity record update is rejected", () => {
  const fixture = setupFixture({ mutate(root) {
    git(root, ["checkout", "HEAD", "--", "evidence.md"]);
  }});
  expectRejected(fixture, "Required continuity record was not updated: evidence.md");
});

test("invalid checksum is rejected", () => {
  const fixture = setupFixture({
    refreshChecksums: false,
    mutate(root) { append(join(root, "docs/ai-control/SHA256SUMS"), "not-a-valid-checksum\n"); },
  });
  expectRejected(fixture, "Malformed checksum line");
});

test("invalid gate status is rejected", () => {
  const fixture = setupFixture({ mutate(root) {
    writeJson(join(root, "docs/ai-control/CONTROL-MANIFEST.json"), {
      active_task: { id: "G0" },
      continuity_gates: { "RCG-01": "Passed probably" },
    });
  }});
  expectRejected(fixture, "Invalid status for RCG-01");
});

test("self-declared independent pass is rejected without a review artifact", () => {
  const fixture = setupFixture({ mutate(root) {
    writeJson(join(root, "docs/ai-control/CONTROL-MANIFEST.json"), {
      active_task: { id: "G0" },
      continuity_gates: { "RCG-01": "Independently verified" },
    });
  }});
  expectRejected(fixture, "cannot become Independently verified");
});

test("locked task activation is rejected", () => {
  const fixture = setupFixture({ mutate(root) {
    const policyPath = join(root, "docs/ai-control/COURSE-CONTROL.json");
    const policy = JSON.parse(readFileSync(policyPath, "utf8"));
    policy.active_task = "F0";
    writeJson(policyPath, policy);
    writeJson(join(root, "docs/ai-control/CONTROL-MANIFEST.json"), {
      active_task: { id: "F0" },
      continuity_gates: { "RCG-01": "Open" },
    });
  }});
  expectRejected(fixture, "Active task F0 is locked");
});

test("policy fails closed when branch creation becomes allowed", () => {
  assert.throws(
    () => validatePolicy({ ...validPolicy, branch_creation_allowed: true }),
    (error) => error instanceof GateFailure && error.details.includes("Branch creation must remain denied"),
  );
});

test("requested dependent task is blocked with the exact current action", () => {
  const fixture = setupFixture();
  expectRejected(fixture, "BLOCKED: F0 cannot start because G0 is Active; Accepted is required. NEXT: Finish G0-C.", { requestedTask: "F0" });
});

test("unregistered task request fails closed", () => {
  const fixture = setupFixture();
  expectRejected(fixture, "BLOCKED: INVENTED cannot start because the task is not registered", { requestedTask: "INVENTED" });
});

test("meaning confirmation is mandatory", () => {
  const state = makeState();
  delete state.meaning_confirmation.boundary;
  assert(validateControlState(state).some((error) => error.includes("Meaning confirmation missing boundary")));
});

test("another task cannot silently become active", () => {
  const state = makeState();
  state.tasks.F0.execution_state = "Active";
  assert(validateControlState(state).some((error) => error.includes("No task other than active_task may be Active")));
});

test("invalid dependency type is rejected", () => {
  const state = makeState();
  state.tasks.F0.prerequisites[0].type = "hard dependency";
  assert(validateControlState(state).some((error) => error.includes("invalid dependency type")));
});

test("independent verification requires a different reviewer and retained evidence", () => {
  const state = makeState();
  Object.assign(state.tasks.G0, { execution_state: "Independently verified", reviewer_id: "author", independent_review_path: "missing.json" });
  const errors = validateControlState(state, { fileExists: () => false });
  assert(errors.some((error) => error.includes("distinct from its author")));
  assert(errors.some((error) => error.includes("lacks retained independent review evidence")));
});

test("forged or mismatched review metadata is rejected", () => {
  const state = makeState();
  Object.assign(state.tasks.G0, { execution_state: "Independently verified", reviewer_id: "reviewer", independent_review_path: "review.json" });
  const errors = validateControlState(state, { fileExists: () => true, readJsonFile: () => ({ task_id: "OTHER", author_id: "author", reviewer_id: "reviewer", verdict: "Independently verified", audited_commit: "c".repeat(40) }) });
  assert(errors.some((error) => error.includes("independent review evidence does not match")));
});

test("acceptance requires consistent state and an integration commit", () => {
  const state = makeState();
  Object.assign(state.tasks.G0, { execution_state: "Accepted", acceptance_state: "Accepted", reviewer_id: "reviewer", independent_review_path: "review.json" });
  const errors = validateControlState(state, { fileExists: () => true });
  assert(errors.some((error) => error.includes("acceptance lacks a full integration commit")));
});

test("invalidated lineage contaminates every descendant", () => {
  const state = makeState();
  state.lineage = {
    nodes: [{ id: "upstream", state: "Failed" }, { id: "child", state: "Accepted" }, { id: "grandchild", state: "Active" }],
    edges: [{ from: "upstream", to: "child", type: "design prerequisite" }, { from: "child", to: "grandchild", type: "validation dependency" }],
  };
  const errors = validateControlState(state);
  assert(errors.some((error) => error.includes("Lineage descendant child must be Potentially contaminated")));
  assert(errors.some((error) => error.includes("Lineage descendant grandchild must be Potentially contaminated")));
});

test("contaminated work cannot be accepted", () => {
  const state = makeState();
  Object.assign(state.tasks.G0, { execution_state: "Potentially contaminated", acceptance_state: "Accepted", reviewer_id: "reviewer", independent_review_path: "review.json", accepted_integration_commit: "b".repeat(40) });
  assert(validateControlState(state, { fileExists: () => true }).some((error) => error.includes("contaminated but accepted")));
});

test("task transition cannot skip an unfinished current task", () => {
  const before = makeState();
  const after = makeState();
  after.active_task = "F0";
  after.tasks.G0.execution_state = "Self-check passed";
  after.tasks.F0.execution_state = "Active";
  assert(validateStateTransition(before, after).some((error) => error.includes("Cannot leave unfinished or unaccepted task G0")));
});

test("unaccepted staging work cannot update the accepted baseline", () => {
  const fixture = setupFixture();
  expectRejected(fixture, "Accepted baseline cannot receive unaccepted task G0", { branch: "divergence/reliability-v1" });
});

test("stale simple status is rejected", () => {
  const fixture = setupFixture({ mutate(root) { writeFileSync(join(root, "handoff.md"), `**SAFE TO SWITCH: YES**\nCheckpoint ${"a".repeat(40)}\n`); }});
  expectRejected(fixture, "Simple handoff safe-switch state disagrees with machine state");
});

test("incomplete traceability is rejected", () => {
  const fixture = setupFixture({ mutate(root) {
    const trace = makeTraceability();
    delete trace.outcomes[4].evidence;
    writeJson(join(root, "traceability.json"), trace);
  }});
  expectRejected(fixture, "G1-O05 missing traceability field evidence");
});

test("resumable interruption retains the same current task", () => {
  const state = makeState();
  state.tasks.G0.execution_state = "Interrupted — resumable";
  state.safe_to_switch = "YES";
  assert.deepEqual(validateControlState(state), []);
});

test("plain blocker output is stable and copyable", () => {
  assert.equal(blockNotice("S02", "F0 audit is Open", "Run the independent F0 audit."), "BLOCKED: S02 cannot start because F0 audit is Open. NEXT: Run the independent F0 audit.");
});

for (const blockedState of ["Open", "Active", "Self-check passed", "Awaiting independent audit", "Failed", "Potentially contaminated"]) {
  test(`dependency state ${blockedState} cannot unlock an Accepted prerequisite`, () => {
    const state = makeState();
    state.tasks.G0.execution_state = blockedState;
    const errors = validateControlState(state, { requestedTask: "F0" });
    assert(errors.some((error) => error.includes(`G0 is ${blockedState}; Accepted is required`)));
  });
}
