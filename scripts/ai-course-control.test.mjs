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
  permitted_gate_statuses: ["Self-check passed", "Independently verified", "Failed", "Open"],
  required_files: [
    "task.md",
    "ledger.md",
    "decisions.md",
    "evidence.md",
    "handoff.md",
    "baseline.png",
    "docs/ai-control/CONTROL-MANIFEST.json",
    "docs/ai-control/COURSE-CONTROL.json",
    "docs/ai-control/SHA256SUMS",
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
        "docs/ai-control/COURSE-CONTROL.json",
        "docs/ai-control/SHA256SUMS",
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

function setupFixture({ mutate, refreshChecksums = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "divergence-gate-"));
  mkdirSync(join(root, "docs/ai-control"), { recursive: true });
  writeFileSync(join(root, "task.md"), "# G0\n");
  writeFileSync(join(root, "ledger.md"), "CL-0001 baseline\n");
  writeFileSync(join(root, "decisions.md"), "D-001 preserve\n");
  writeFileSync(join(root, "evidence.md"), "E-001 baseline\n");
  writeFileSync(join(root, "handoff.md"), "Next: G0\n");
  writeFileSync(join(root, "baseline.png"), "immutable visual bytes\n");
  writeJson(join(root, "docs/ai-control/COURSE-CONTROL.json"), validPolicy);
  writeJson(join(root, "docs/ai-control/CONTROL-MANIFEST.json"), {
    active_task: { id: "G0" },
    continuity_gates: { "RCG-01": "Open" },
  });
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

test("protected integration branch is a valid post-merge checkpoint", () => {
  assert.equal(executeFixture(setupFixture(), { branch: "divergence/reliability-v1" }).accepted, true);
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
