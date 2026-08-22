#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const cp = require("child_process");

const MODE = process.argv[2] || "help";
const MODE_ARGS = process.argv.slice(3);
const ADAPTER_NAME = "universal-governance-codex.cjs";
const CORE_NAME = "universal-governance-gate.cjs";

function readRawStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function parseJson(raw, fallback = {}) {
  try {
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function resolveRoot(input) {
  if (process.env.UNIVERSAL_GATE_PROJECT_DIR) {
    return path.resolve(process.env.UNIVERSAL_GATE_PROJECT_DIR);
  }
  const candidate = input?.cwd && fs.existsSync(input.cwd) ? input.cwd : process.cwd();
  const result = cp.spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: candidate,
    encoding: "utf8"
  });
  if (result.status === 0 && result.stdout.trim()) return path.resolve(result.stdout.trim());
  return path.resolve(candidate);
}

const RAW_INPUT = readRawStdin();
const INPUT = parseJson(RAW_INPUT, {});
const ROOT = resolveRoot(INPUT);
const CORE = path.join(ROOT, ".claude", "hooks", CORE_NAME);

function coreResult(mode, input = {}, args = [], root = ROOT) {
  const core = path.join(root, ".claude", "hooks", CORE_NAME);
  return cp.spawnSync(process.execPath, [core, mode, ...args], {
    cwd: root,
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    input: `${JSON.stringify(input)}\n`,
    encoding: "utf8",
    timeout: 20 * 60 * 1000,
    maxBuffer: 32 * 1024 * 1024
  });
}

function exitWithResult(result, successOutput = null) {
  if (result.status === 0 && !result.error) {
    if (successOutput !== null) process.stdout.write(successOutput);
    else process.stdout.write(result.stdout || "");
    process.exit(0);
  }
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || result.error?.message || "Universal governance command failed.\n");
  process.exit(Number.isInteger(result.status) ? result.status : 2);
}

function parseFlags(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const item = args[index];
    if (!item.startsWith("--")) continue;
    const name = item.slice(2);
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${item} requires a value.`);
    values[name] = value;
    index += 1;
  }
  return values;
}

function adapterCommandMode(command) {
  const escaped = ADAPTER_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escaped}[\"']?\\s+([a-z-]+)`, "i").exec(String(command || ""));
  return match ? match[1].toLowerCase() : null;
}

function isStandaloneSafeCommand(command, mode) {
  const text = String(command || "");
  if (!mode) return false;
  if (/[\r\n;<>|`]|&&|\$\(/.test(text)) return false;
  return [
    "contract-check",
    "contract-evidence",
    "completion-evidence",
    "evidence",
    "task-context",
    "read-file",
    "project-check",
    "self-test"
  ].includes(mode);
}

function normalizeGuardInput(input) {
  const transformed = JSON.parse(JSON.stringify(input || {}));
  const tool = String(transformed.tool_name || "");
  if (/^apply_patch$/i.test(tool)) transformed.tool_name = "Bash";
  else if (!/^(?:Bash|PowerShell|Edit|Write|NotebookEdit)$/i.test(tool)
      && /(?:^|_)(?:write|create|update|delete|remove|move|rename|merge)(?:_|$)/i.test(tool)) {
    transformed.tool_name = "Write";
  }
  if (typeof transformed.tool_input?.command === "string") {
    transformed.tool_input.command = transformed.tool_input.command
      .split(ADAPTER_NAME)
      .join(CORE_NAME);
  }
  return transformed;
}

function contractCheck() {
  const flags = parseFlags(MODE_ARGS);
  const taskId = flags["task-id"] || INPUT.task_id;
  const subject = flags.subject || INPUT.task_subject;
  const outcome = flags.outcome;
  const scope = flags.scope;
  const preserve = flags.preserve;
  const proof = flags.proof;
  if (!taskId || !subject || !outcome || !scope || !preserve || !proof) {
    throw new Error("contract-check requires --task-id, --subject, --outcome, --scope, --preserve, and --proof.");
  }
  const taskInput = {
    task_id: taskId,
    task_subject: subject,
    task_description: [
      `Outcome: ${outcome}`,
      `Scope: ${scope}`,
      `Preserve: ${preserve}`,
      `Proof: ${proof}`
    ].join("\n")
  };
  exitWithResult(coreResult("contract-check", taskInput), "Task contract frozen for independent review.\n");
}

function verify() {
  const taskId = String(MODE_ARGS[0] || INPUT.task_id || "").trim();
  if (!taskId) throw new Error("verify requires the exact task ID.");
  exitWithResult(coreResult("verify", { task_id: taskId }));
}

function readFileMode() {
  const relative = String(MODE_ARGS[0] || "").trim().replace(/\\/g, "/").replace(/^\.\//, "");
  if (!relative) throw new Error("read-file requires a repository-relative path.");
  const absolute = path.resolve(ROOT, relative);
  if (absolute !== ROOT && !absolute.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error("read-file refuses paths outside the repository.");
  }
  const stat = fs.statSync(absolute);
  if (!stat.isFile()) throw new Error("read-file requires a regular file.");
  if (stat.size > 10 * 1024 * 1024) throw new Error("read-file refuses files larger than 10 MiB.");
  process.stdout.write(fs.readFileSync(absolute, "utf8"));
}

function parseVerdict(message) {
  const match = /UNIVERSAL_GATE_VERDICT\s+(\{[^\r\n]*\})/.exec(String(message || ""));
  if (!match) return null;
  const verdict = parseJson(match[1], null);
  if (!verdict || !["contract", "completion"].includes(verdict.review)) return null;
  if (typeof verdict.taskId !== "string" || typeof verdict.ok !== "boolean") return null;
  if (typeof verdict.reason !== "string") return null;
  return verdict;
}

function verifierResult() {
  if (!INPUT.agent_id) {
    process.stdout.write(JSON.stringify({ systemMessage: "Ignored verifier receipt without a Codex subagent identity." }));
    return;
  }
  const verdict = parseVerdict(INPUT.last_assistant_message);
  if (!verdict) {
    process.stdout.write("{}");
    return;
  }
  if (!verdict.ok) {
    process.stdout.write(JSON.stringify({
      systemMessage: `Independent ${verdict.review} review blocked: ${verdict.reason || "No reason supplied."}`
    }));
    return;
  }
  const coreMode = verdict.review === "contract" ? "record-contract-pass" : "record-semantic-pass";
  const result = coreResult(coreMode, {}, [verdict.taskId]);
  if (result.status !== 0 || result.error) {
    const reason = (result.stderr || result.error?.message || "receipt could not be recorded").trim();
    process.stdout.write(JSON.stringify({ systemMessage: `Independent ${verdict.review} receipt rejected: ${reason}` }));
    return;
  }
  process.stdout.write(JSON.stringify({
    systemMessage: `Independent ${verdict.review} pass recorded for ${verdict.taskId}.`
  }));
}

function guardTool() {
  const tool = String(INPUT.tool_name || "");
  const command = String(INPUT.tool_input?.command || "");
  const mode = /^(?:Bash|apply_patch)$/i.test(tool) ? adapterCommandMode(command) : null;
  if (isStandaloneSafeCommand(command, mode)) {
    process.stdout.write("{}");
    return;
  }
  exitWithResult(coreResult("guard-tool", normalizeGuardInput(INPUT)), "{}");
}

function finalize() {
  const result = coreResult("finalize", INPUT);
  if (result.status === 0 && !result.error) {
    process.stdout.write("{}");
    return;
  }
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || result.error?.message || "Universal governance completion failed.\n");
  process.exit(Number.isInteger(result.status) ? result.status : 2);
}

function codexProjectCheck(root = ROOT) {
  const failures = [];
  const hooksPath = path.join(root, ".codex", "hooks.json");
  const hooks = parseJson(fs.existsSync(hooksPath) ? fs.readFileSync(hooksPath, "utf8") : "", null);
  if (!hooks) failures.push("Missing or invalid .codex/hooks.json.");
  const required = {
    SessionStart: "context",
    UserPromptSubmit: "capture",
    PreToolUse: "guard-tool",
    SubagentStop: "verifier-result",
    Stop: "finalize"
  };
  for (const [event, mode] of Object.entries(required)) {
    const handlers = (hooks?.hooks?.[event] || []).flatMap((group) => group?.hooks || []);
    if (!handlers.some((handler) => String(handler.command || "").includes(ADAPTER_NAME)
        && String(handler.command || "").includes(mode)
        && String(handler.commandWindows || "").includes(ADAPTER_NAME)
        && String(handler.commandWindows || "").includes(mode))) {
      failures.push(`.codex/hooks.json is missing the cross-platform ${event} ${mode} hook.`);
    }
  }
  const agents = fs.existsSync(path.join(root, "AGENTS.md"))
    ? fs.readFileSync(path.join(root, "AGENTS.md"), "utf8") : "";
  for (const phrase of ["contract-check", "Completion review", "DECISION_LOG.txt", "CURRENT_STATE.txt"]) {
    if (!agents.includes(phrase)) failures.push(`AGENTS.md is missing ${phrase}.`);
  }
  const verifier = fs.existsSync(path.join(root, ".codex", "universal-gate-verifier.md"))
    ? fs.readFileSync(path.join(root, ".codex", "universal-gate-verifier.md"), "utf8") : "";
  for (const phrase of ["Contract review", "Completion review", "UNIVERSAL_GATE_VERDICT"]) {
    if (!verifier.includes(phrase)) failures.push(`Codex verifier guide is missing ${phrase}.`);
  }
  const policy = parseJson(fs.readFileSync(path.join(root, ".claude", "universal-gate-policy.json"), "utf8"), {});
  for (const protectedPath of [
    ".codex/hooks.json",
    ".codex/hooks/universal-governance-codex.cjs",
    ".codex/universal-gate-verifier.md"
  ]) {
    if (!(policy.protectedGatePaths || []).includes(protectedPath)) {
      failures.push(`Universal policy does not protect ${protectedPath}.`);
    }
  }
  if (failures.length) {
    process.stderr.write(`CODEX PROJECT CHECK: FAIL\n${failures.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n`);
    return false;
  }
  process.stdout.write("CODEX PROJECT CHECK: PASS\nCodex instructions, hooks, verifier, and protected paths are installed.\n");
  return true;
}

function spawnAdapter(mode, input = {}, args = [], root = ROOT) {
  return cp.spawnSync(process.execPath, [__filename, mode, ...args], {
    cwd: root,
    env: { ...process.env, UNIVERSAL_GATE_PROJECT_DIR: root },
    input: `${JSON.stringify(input)}\n`,
    encoding: "utf8",
    timeout: 20 * 60 * 1000,
    maxBuffer: 32 * 1024 * 1024
  });
}

function selfTest() {
  const core = coreResult("self-test");
  process.stdout.write(core.stdout || "");
  process.stderr.write(core.stderr || "");
  if (core.status !== 0 || core.error) process.exit(1);

  const checks = [];
  function test(name, action) {
    try {
      action();
      checks.push({ name, pass: true });
    } catch (error) {
      checks.push({ name, pass: false, error: error.message });
    }
  }
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  test("parses an independent verifier verdict", () => {
    const verdict = parseVerdict('UNIVERSAL_GATE_VERDICT {"review":"contract","taskId":"task-x","ok":true,"reason":""}');
    assert(verdict?.taskId === "task-x" && verdict.ok, "Valid verifier verdict was not parsed.");
  });

  test("maps apply_patch into the mutating guard path", () => {
    const mapped = normalizeGuardInput({ tool_name: "apply_patch", tool_input: { command: "*** Begin Patch" } });
    assert(mapped.tool_name === "Bash", "apply_patch did not enter the mutating guard path.");
  });

  test("rejects chained commands disguised as safe gate reads", () => {
    assert(!isStandaloneSafeCommand(`node .codex/hooks/${ADAPTER_NAME} read-file CANON.md && rm x`, "read-file"), "Chained command was treated as safe.");
  });

  test("passes the Codex contract-to-completion flow", () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "universal-governance-codex-test-"));
    try {
      fs.cpSync(ROOT, fixture, {
        recursive: true,
        filter: (source) => !source.includes(`${path.sep}.claude${path.sep}gate-state${path.sep}`)
      });
      fs.writeFileSync(path.join(fixture, "work.txt"), "before", "utf8");
      const captured = spawnAdapter("capture", { session_id: "codex-s", turn_id: "turn-1", prompt: "Update work.txt to say after." }, [], fixture);
      assert(captured.status === 0, captured.stderr);
      const contractArgs = [
        "--task-id", "task-codex",
        "--subject", "Update work",
        "--outcome", "work.txt says after",
        "--scope", "work.txt and required governance state",
        "--preserve", "all other project behavior",
        "--proof", "inspect work.txt and gate evidence"
      ];
      const contract = spawnAdapter("contract-check", {}, contractArgs, fixture);
      assert(contract.status === 0, contract.stderr);
      const contractReceipt = spawnAdapter("verifier-result", {
        agent_id: "agent-contract",
        last_assistant_message: 'UNIVERSAL_GATE_VERDICT {"review":"contract","taskId":"task-codex","ok":true,"reason":""}'
      }, [], fixture);
      assert(contractReceipt.status === 0 && contractReceipt.stdout.includes("pass recorded"), contractReceipt.stderr || contractReceipt.stdout);
      const guard = spawnAdapter("guard-tool", {
        tool_name: "apply_patch",
        tool_input: { command: "*** Begin Patch\n*** Update File: work.txt\n*** End Patch" }
      }, [], fixture);
      assert(guard.status === 0 && !guard.stdout.includes('"deny"'), "Approved apply_patch was blocked.");
      fs.writeFileSync(path.join(fixture, "work.txt"), "after", "utf8");
      const statePath = path.join(fixture, "CURRENT_STATE.txt");
      const state = fs.readFileSync(statePath, "utf8").replace(/^(ST4\b[^\n]*\n)/m, "$1Codex integration self-test completed.\n");
      fs.writeFileSync(statePath, state, "utf8");
      const mechanical = spawnAdapter("verify", {}, ["task-codex"], fixture);
      assert(mechanical.status === 0, mechanical.stderr);
      const completionReceipt = spawnAdapter("verifier-result", {
        agent_id: "agent-completion",
        last_assistant_message: 'UNIVERSAL_GATE_VERDICT {"review":"completion","taskId":"task-codex","ok":true,"reason":""}'
      }, [], fixture);
      assert(completionReceipt.status === 0 && completionReceipt.stdout.includes("pass recorded"), completionReceipt.stderr || completionReceipt.stdout);
      const final = spawnAdapter("finalize", { stop_hook_active: false, last_assistant_message: "Completed." }, [], fixture);
      assert(final.status === 0, final.stderr);
      const receipt = fs.readFileSync(path.join(fixture, ".claude", "gate-state", "LAST-GATE-RESULT.txt"), "utf8");
      assert(receipt.includes("PASS"), "Final Codex gate receipt was not written.");
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  const failed = checks.filter((item) => !item.pass);
  for (const item of checks) {
    process.stdout.write(`${item.pass ? "PASS" : "FAIL"} - Codex adapter ${item.name}${item.error ? `: ${item.error}` : ""}\n`);
  }
  process.stdout.write(`\n${checks.length - failed.length}/${checks.length} Codex adapter self-tests passed.\n`);
  if (failed.length) process.exit(1);
}

function help() {
  process.stdout.write([
    "Modes: context, capture, contract-check, contract-evidence, task-context, read-file, guard-tool,",
    "verify, evidence, completion-evidence, verifier-result, pause-for-user, finalize, project-check, self-test"
  ].join(" ") + "\n");
}

try {
  if (!fs.existsSync(CORE)) throw new Error(`Missing shared universal gate core: ${CORE}`);
  if (MODE === "context" || MODE === "capture" || MODE === "task-context" || MODE === "contract-evidence" || MODE === "evidence") {
    exitWithResult(coreResult(MODE, INPUT));
  } else if (MODE === "contract-check") contractCheck();
  else if (MODE === "read-file") readFileMode();
  else if (MODE === "guard-tool") guardTool();
  else if (MODE === "verify") verify();
  else if (MODE === "completion-evidence") {
    const taskId = String(MODE_ARGS[0] || "").trim();
    if (!taskId) throw new Error("completion-evidence requires the exact task ID.");
    exitWithResult(coreResult("completion-evidence", {}, [taskId]));
  } else if (MODE === "verifier-result") verifierResult();
  else if (MODE === "pause-for-user") exitWithResult(coreResult("pause-for-user", {}, MODE_ARGS));
  else if (MODE === "finalize") finalize();
  else if (MODE === "project-check") {
    const core = coreResult("project-check");
    process.stdout.write(core.stdout || "");
    process.stderr.write(core.stderr || "");
    if (core.status !== 0 || core.error || !codexProjectCheck()) process.exit(1);
  } else if (MODE === "self-test") selfTest();
  else help();
} catch (error) {
  process.stderr.write(`UNIVERSAL CODEX GOVERNANCE ADAPTER ERROR: ${error.stack || error.message}\n`);
  process.exit(MODE === "self-test" || MODE === "project-check" ? 1 : 2);
}
