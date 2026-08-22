#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const cp = require("child_process");

const MODE = process.argv[2] || "help";
const MODE_ARGS = process.argv.slice(3);
const ROOT = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const CLAUDE_DIR = path.join(ROOT, ".claude");
const POLICY_PATH = path.join(CLAUDE_DIR, "universal-gate-policy.json");
const STATE_DIR = path.join(CLAUDE_DIR, "gate-state");
const ACTIVE_PATH = path.join(STATE_DIR, "active-task.json");
const PENDING_CONTRACT_PATH = path.join(STATE_DIR, "pending-contract.json");
const CONTRACT_PATH = path.join(STATE_DIR, "contract-pass.json");
const MECHANICAL_PATH = path.join(STATE_DIR, "mechanical-pass.json");
const SEMANTIC_PATH = path.join(STATE_DIR, "semantic-pass.json");
const PAUSE_PATH = path.join(STATE_DIR, "user-decision-pause.json");
const LATEST_EVIDENCE_PATH = path.join(STATE_DIR, "latest-evidence.json");
const LAST_RESULT_PATH = path.join(STATE_DIR, "LAST-GATE-RESULT.txt");

const REQUIRED_RULES = [
  ["CR1", "before presenting output, confirm it solves exactly what was requested"],
  ["CR2", "unstated parameters are resolved by asking, never assumed"],
  ["CR4", "default to short work/review cycles ending in a usable artifact"],
  ["CR5", "a specific factual claim is checked before being presented as fact"],
  ["CR6", "every decision records the alternatives considered and rejected and why"],
  ["CR9", "a phase's defined output must be recorded before the next phase starts"],
  ["CR10", "scope is closed or extended only via a recorded decision"],
  ["CR12", "instructions already given in the current conversation are re-confirmed before acting"]
];

const CODE_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".go", ".rs",
  ".java", ".kt", ".kts", ".cs", ".cpp", ".cc", ".c", ".h", ".hpp",
  ".rb", ".php", ".swift", ".scala", ".sh", ".ps1", ".sql", ".html",
  ".htm", ".css", ".scss", ".vue", ".svelte", ".dart", ".ex", ".exs"
]);

function now() {
  return new Date().toISOString();
}

function readStdin() {
  try {
    const raw = fs.readFileSync(0, "utf8").trim();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function readText(root, relativePath) {
  try {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  } catch {
    return "";
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, file);
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporary, value, "utf8");
  fs.renameSync(temporary, file);
}

function unlinkIfPresent(file) {
  try {
    fs.unlinkSync(file);
  } catch {}
}

function resetReceipts() {
  for (const file of [
    PENDING_CONTRACT_PATH,
    CONTRACT_PATH,
    MECHANICAL_PATH,
    SEMANTIC_PATH,
    PAUSE_PATH,
    LATEST_EVIDENCE_PATH,
    LAST_RESULT_PATH
  ]) {
    unlinkIfPresent(file);
  }
}

function loadPolicy(root = ROOT) {
  const policyPath = path.join(root, ".claude", "universal-gate-policy.json");
  const policy = readJson(policyPath, null);
  if (!policy || policy.schemaVersion !== 2) {
    throw new Error(`Missing or invalid universal gate policy: ${policyPath}`);
  }
  return policy;
}

function normalizeRel(value) {
  return String(value || "").split(path.sep).join("/").replace(/^\.\//, "");
}

function pathKey(value) {
  const normalized = normalizeRel(value);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function hashString(value) {
  return hashBuffer(Buffer.from(String(value), "utf8"));
}

function hashLargeFile(file, stat) {
  const hash = crypto.createHash("sha256");
  const buffer = Buffer.alloc(Math.min(1024 * 1024, Math.max(1, stat.size)));
  const descriptor = fs.openSync(file, "r");
  try {
    let position = 0;
    while (position < stat.size) {
      const bytes = fs.readSync(descriptor, buffer, 0, Math.min(buffer.length, stat.size - position), position);
      if (!bytes) break;
      hash.update(buffer.subarray(0, bytes));
      position += bytes;
    }
  } finally {
    fs.closeSync(descriptor);
  }
  return hash.digest("hex");
}

function shouldIgnore(relativePath, policy) {
  const rel = normalizeRel(relativePath);
  if (rel === ".claude/gate-state" || rel.startsWith(".claude/gate-state/")) return true;
  const ignored = new Set((policy.ignoreDirectoryNames || []).map((item) => process.platform === "win32" ? item.toLowerCase() : item));
  return rel.split("/").some((segment) => ignored.has(process.platform === "win32" ? segment.toLowerCase() : segment));
}

function snapshot(root, policy) {
  const files = {};
  let count = 0;

  function walk(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = normalizeRel(path.relative(root, absolute));
      if (shouldIgnore(relative, policy)) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      count += 1;
      if (count > policy.maxSnapshotFiles) {
        throw new Error(`Project contains more than ${policy.maxSnapshotFiles} snapshot files. Add only true dependency/cache directories to ignoreDirectoryNames.`);
      }
      const stat = fs.statSync(absolute);
      const digest = stat.size <= policy.maxHashBytesPerFile
        ? hashBuffer(fs.readFileSync(absolute))
        : hashLargeFile(absolute, stat);
      files[relative] = { digest, size: stat.size };
    }
  }

  walk(root);
  return files;
}

function isProbablyText(file, size) {
  if (size === 0) return true;
  const length = Math.min(8192, size);
  const buffer = Buffer.alloc(length);
  const descriptor = fs.openSync(file, "r");
  try {
    fs.readSync(descriptor, buffer, 0, length, 0);
  } finally {
    fs.closeSync(descriptor);
  }
  for (const byte of buffer) {
    if (byte === 0) return false;
  }
  return true;
}

function cacheBaselineFiles(root, policy, baseline) {
  const baselineDirectory = path.join(root, ".claude", "gate-state", "baseline-files");
  fs.rmSync(baselineDirectory, { recursive: true, force: true });
  fs.mkdirSync(baselineDirectory, { recursive: true });
  const copies = {};
  let total = 0;
  for (const relative of Object.keys(baseline).sort()) {
    const metadata = baseline[relative];
    if (metadata.size > policy.maxBaselineFileBytes) continue;
    if (total + metadata.size > policy.maxBaselineTotalBytes) continue;
    const absolute = path.join(root, relative);
    if (!isProbablyText(absolute, metadata.size)) continue;
    const name = `${hashString(relative)}.txt`;
    const target = path.join(baselineDirectory, name);
    fs.copyFileSync(absolute, target);
    copies[relative] = normalizeRel(path.relative(root, target));
    total += metadata.size;
  }
  return { files: copies, bytes: total };
}

function compareSnapshots(before, after) {
  const changes = [];
  const names = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  for (const file of [...names].sort()) {
    const oldValue = before?.[file];
    const newValue = after?.[file];
    if (!oldValue && newValue) changes.push({ path: file, status: "added", before: null, after: newValue.digest, size: newValue.size });
    else if (oldValue && !newValue) changes.push({ path: file, status: "deleted", before: oldValue.digest, after: null, size: oldValue.size });
    else if (oldValue.digest !== newValue.digest) changes.push({ path: file, status: "modified", before: oldValue.digest, after: newValue.digest, size: newValue.size });
  }
  return changes;
}

function digestChanges(changes) {
  return hashString(JSON.stringify(changes.map(({ path: file, status, before, after }) => ({ path: file, status, before, after }))));
}

function getActive() {
  return readJson(ACTIVE_PATH, null);
}

function allPromptText(active) {
  return (active?.prompts || []).map((item) => item.text || "").join("\n\n");
}

function promptDigest(active) {
  return hashString(allPromptText(active));
}

function looksConsequential(text) {
  const prompt = String(text || "").trim();
  if (!prompt) return false;
  const ordinary = /^(?:what|why|how|when|where|who|is|are|does|do|did|should|would)\b/i.test(prompt)
    && /\b(?:explain|mean|difference|work|possible|wrong|happen|cause|understand|question)\b/i.test(prompt)
    && !/\b(?:create|build|make|implement|write|edit|modify|change|update|fix|repair|remove|delete|install|configure|refactor|migrate|generate|execute|continue|finish|complete|add|audit|review|test|deploy)\b/i.test(prompt);
  if (ordinary) return false;
  return /\b(?:create|build|make|implement|write|edit|modify|change|update|fix|repair|remove|delete|install|configure|refactor|migrate|generate|execute|continue|finish|complete|add|audit|review|test|deploy|design)\b/i.test(prompt);
}

function discoverAuthorityFiles(currentFiles, policy) {
  const wantedNames = new Set((policy.authorityFileNames || []).map((item) => item.toUpperCase()));
  const exactPaths = new Set([...(policy.requiredGovernanceFiles || []), ...(policy.additionalAuthorityFiles || [])].map(pathKey));
  const namePatterns = (policy.authorityNamePatterns || []).map((pattern) => new RegExp(pattern, "i"));
  const found = [];
  for (const relative of Object.keys(currentFiles)) {
    const base = path.basename(relative).toUpperCase();
    if (wantedNames.has(base)
        || exactPaths.has(pathKey(relative))
        || namePatterns.some((pattern) => pattern.test(path.basename(relative)))) found.push(relative);
  }
  return [...new Set(found)].sort();
}

function normalizeWords(value) {
  return String(value || "").toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9']+/g, " ").trim();
}

function decisionHeaderIndex(text) {
  const match = /^DECISIONS\s*$/im.exec(text);
  return match ? { start: match.index, end: match.index + match[0].length } : null;
}

function decisionParts(text) {
  const header = decisionHeaderIndex(text);
  if (!header) return { rules: text, decisions: "", hasHeader: false };
  return { rules: text.slice(0, header.start), decisions: text.slice(header.end), hasHeader: true };
}

function decisionEntries(text) {
  const entries = [];
  const pattern = /^ENTRY\s+([^\n]+)\n([\s\S]*?)(?=^[-=]{3,}\s*$\n^ENTRY\s+|^ENTRY\s+|(?![\s\S]))/gim;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    entries.push({ title: match[1].trim(), body: match[2] });
  }
  return entries;
}

function validateDecisionLog(text) {
  const failures = [];
  const checks = [];
  const parts = decisionParts(text);
  if (!parts.hasHeader) failures.push("DECISION_LOG.txt is missing the DECISIONS section header.");
  const normalizedRules = normalizeWords(parts.rules);
  for (const [id, phrase] of REQUIRED_RULES) {
    const idMatches = parts.rules.match(new RegExp(`^${id}\\b`, "gim")) || [];
    const present = idMatches.length === 1 && normalizedRules.includes(normalizeWords(phrase));
    checks.push({ check: `rule-${id}`, result: present ? "PASS" : "FAIL" });
    if (!present) failures.push(`DECISION_LOG.txt must contain exactly one intact ${id} rule with its approved statement.`);
  }
  const entries = decisionEntries(parts.decisions);
  if (!entries.length) failures.push("DECISION_LOG.txt contains no valid DECISIONS entries.");
  for (const entry of entries) {
    for (let field = 1; field <= 4; field += 1) {
      if (!new RegExp(`^DL${field}:\\s*\\S`, "im").test(entry.body)) {
        failures.push(`DECISION_LOG.txt entry ${entry.title} is missing DL${field}.`);
      }
    }
  }
  checks.push({ check: "decision-entries-DL1-DL4", result: failures.some((item) => /entry .* missing DL/i.test(item)) ? "FAIL" : "PASS", count: entries.length });
  return { failures, checks, entries, parts };
}

function validateCurrentState(text) {
  const failures = [];
  const checks = [];
  for (let field = 1; field <= 4; field += 1) {
    const matches = text.match(new RegExp(`^ST${field}\\b`, "gim")) || [];
    const present = matches.length === 1;
    checks.push({ check: `current-state-ST${field}`, result: present ? "PASS" : "FAIL" });
    if (!present) failures.push(`CURRENT_STATE.txt must contain exactly one ST${field} field.`);
  }
  return { failures, checks };
}

function explicitGateAuthorization(prompts) {
  return /\b(?:install|uninstall|replace|update|modify|edit|repair|fix|change|upgrade)\b[\s\S]{0,100}\b(?:universal\s+)?(?:governance\s+)?gate\b|\b(?:governance\s+)?gate\b[\s\S]{0,100}\b(?:install|uninstall|replace|update|modify|edit|repair|fix|change|upgrade)\b/i.test(prompts);
}

function explicitGovernanceAuthorization(prompts) {
  return /\b(?:update|modify|edit|repair|fix|correct|revise|rewrite|replace|remove|delete|change)\b[\s\S]{0,100}\b(?:governance|decision[\s_-]*log|current[\s_-]*state|governance\s+rule)\b|\b(?:governance|decision[\s_-]*log|current[\s_-]*state|governance\s+rule)\b[\s\S]{0,100}\b(?:update|modify|edit|repair|fix|correct|revise|rewrite|replace|remove|delete|change)\b/i.test(prompts);
}

function explicitAuthorityAuthorization(prompts, relativePath) {
  const file = path.basename(relativePath);
  const stem = path.parse(file).name
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\s_-]*");
  const action = "(?:update|modify|edit|repair|fix|correct|revise|rewrite|replace|remove|delete|change)";
  return new RegExp(`${action}[\\s\\S]{0,100}${stem}|${stem}[\\s\\S]{0,100}${action}`, "i").test(prompts);
}

function changedByPath(changes, relativePath) {
  const wanted = pathKey(relativePath);
  return changes.find((item) => pathKey(item.path) === wanted) || null;
}

function checkGovernance(root, current, changes, active, policy) {
  const failures = [];
  const checks = [];
  const decisionPath = (policy.appendOnlyDecisionFiles || ["DECISION_LOG.txt"])[0];
  const statePath = "CURRENT_STATE.txt";
  const decisionText = readText(root, decisionPath);
  const stateText = readText(root, statePath);

  for (const required of policy.requiredGovernanceFiles || []) {
    const exists = Object.prototype.hasOwnProperty.call(current, required);
    checks.push({ check: "required-governance-file", file: required, result: exists ? "PASS" : "FAIL" });
    if (!exists) failures.push(`${required} is required by the universal governance system but is missing.`);
  }

  if (decisionText) {
    const result = validateDecisionLog(decisionText);
    failures.push(...result.failures);
    checks.push(...result.checks);
  }
  if (stateText) {
    const result = validateCurrentState(stateText);
    failures.push(...result.failures);
    checks.push(...result.checks);
  }

  const decisionChange = changedByPath(changes, decisionPath);
  if (decisionChange && decisionChange.status !== "added") {
    const baselineCopy = active?.baselineCopies?.[decisionPath];
    const beforeText = baselineCopy ? readText(root, baselineCopy) : "";
    if (!beforeText) {
      failures.push("DECISION_LOG.txt changed but its frozen baseline could not be inspected.");
    } else {
      const before = decisionParts(beforeText);
      const after = decisionParts(decisionText);
      const prompts = allPromptText(active);
      if (before.rules !== after.rules && !explicitGovernanceAuthorization(prompts)) {
        failures.push("DECISION_LOG.txt RULES changed without an explicit user request to change governance.");
      }
      if (!after.decisions.startsWith(before.decisions)) {
        failures.push("DECISION_LOG.txt violated append-only history: an existing decision was edited, removed, or reordered.");
      }
      checks.push({ check: "decision-log-append-only", result: failures.some((item) => /append-only history/i.test(item)) ? "FAIL" : "PASS" });
    }
  }

  const projectChanges = changes.filter((item) => {
    const key = pathKey(item.path);
    if (key.startsWith(pathKey(".claude/gate-state/"))) return false;
    return key !== pathKey(decisionPath) && key !== pathKey(statePath);
  });
  if (projectChanges.length && !changedByPath(changes, statePath)) {
    failures.push("CURRENT_STATE.txt was not updated after project artifacts changed.");
    checks.push({ check: "current-state-updated", result: "FAIL" });
  } else if (projectChanges.length) {
    checks.push({ check: "current-state-updated", result: "PASS" });
  }

  if (changes.length > policy.maxChangedFilesWithoutDecision) {
    const appended = decisionChange && decisionChange.status !== "deleted";
    if (!appended) failures.push(`The task changed ${changes.length} files without recording the large scope decision in DECISION_LOG.txt.`);
    checks.push({ check: "large-change-decision", result: appended ? "PASS" : "FAIL", changedFiles: changes.length });
  }

  return { failures, checks };
}

function checkProtectedChanges(changes, current, active, policy) {
  const failures = [];
  const checks = [];
  const prompts = allPromptText(active);
  const protectedGate = new Set((policy.protectedGatePaths || []).map(pathKey));
  const mutable = new Set((policy.mutableStateFiles || []).map(pathKey));
  const appendOnly = new Set((policy.appendOnlyDecisionFiles || []).map(pathKey));
  const authorityCandidates = { ...(active?.baseline || {}), ...current };
  const authority = new Set(discoverAuthorityFiles(authorityCandidates, policy).map(pathKey));

  for (const change of changes) {
    const key = pathKey(change.path);
    if (protectedGate.has(key) && !explicitGateAuthorization(prompts)) {
      failures.push(`${change.path}: gate infrastructure changed without an explicit user request to change the gate.`);
      checks.push({ check: "protected-gate-file", file: change.path, result: "FAIL" });
      continue;
    }
    if (mutable.has(key) || appendOnly.has(key)) continue;
    if (policy.protectDiscoveredAuthorityFiles && authority.has(key) && !explicitAuthorityAuthorization(prompts, change.path)) {
      failures.push(`${change.path}: an authority document changed without an explicit user request to change that authority.`);
      checks.push({ check: "protected-authority-file", file: change.path, result: "FAIL" });
    }
  }
  if (!checks.length) checks.push({ check: "protected-files", result: "PASS" });
  return { failures, checks };
}

function hasCodeChanges(changes) {
  return changes.some((item) => CODE_EXTENSIONS.has(path.extname(item.path).toLowerCase()));
}

function commandExists(command) {
  const probe = process.platform === "win32" ? "where" : "which";
  return cp.spawnSync(probe, [command], { stdio: "ignore" }).status === 0;
}

function directoryContains(root, matcher, limit = 10000) {
  let seen = 0;
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".venv") continue;
      seen += 1;
      if (seen > limit) return false;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory() && walk(absolute)) return true;
      if (entry.isFile() && matcher(entry.name, absolute)) return true;
    }
    return false;
  }
  return walk(root);
}

function detectTestCommands(root, policy, changes) {
  const commands = [];
  for (const item of policy.testCommands || []) {
    if (item && item.command) commands.push(item);
  }
  if (!policy.autoDetectTests || !hasCodeChanges(changes)) return commands;

  const packagePath = path.join(root, "package.json");
  if (fs.existsSync(packagePath)) {
    const packageJson = readJson(packagePath, {});
    let runner = null;
    if (fs.existsSync(path.join(root, "pnpm-lock.yaml")) && commandExists("pnpm")) runner = { command: "pnpm", prefix: ["run"] };
    else if (fs.existsSync(path.join(root, "yarn.lock")) && commandExists("yarn")) runner = { command: "yarn", prefix: [] };
    else if (fs.existsSync(path.join(root, "bun.lockb")) && commandExists("bun")) runner = { command: "bun", prefix: ["run"] };
    else if (commandExists("npm")) runner = { command: "npm", prefix: ["run"] };
    if (runner) {
      for (const name of ["test", "lint", "typecheck", "build"]) {
        const script = packageJson.scripts?.[name];
        if (script && !/no test specified/i.test(script)) {
          commands.push({ name: `${runner.command} ${name}`, command: runner.command, args: [...runner.prefix, name] });
        }
      }
    }
  }

  const pythonProject = ["pyproject.toml", "pytest.ini", "setup.cfg", "tox.ini"].some((name) => fs.existsSync(path.join(root, name)));
  const pythonTests = fs.existsSync(path.join(root, "tests")) || directoryContains(root, (name) => /^test_.*\.py$/i.test(name), 5000);
  if ((pythonProject || pythonTests) && pythonTests) {
    const python = commandExists("python") ? "python" : commandExists("python3") ? "python3" : null;
    if (python) commands.push({ name: "pytest", command: python, args: ["-m", "pytest", "-q"] });
  }
  if (fs.existsSync(path.join(root, "go.mod")) && commandExists("go")) commands.push({ name: "go test", command: "go", args: ["test", "./..."] });
  if (fs.existsSync(path.join(root, "Cargo.toml")) && commandExists("cargo")) commands.push({ name: "cargo test", command: "cargo", args: ["test", "--quiet"] });
  if (directoryContains(root, (name) => /\.(?:sln|csproj)$/i.test(name), 3000) && commandExists("dotnet")) commands.push({ name: "dotnet test", command: "dotnet", args: ["test", "--nologo"] });
  if (fs.existsSync(path.join(root, "pom.xml")) && commandExists("mvn")) commands.push({ name: "maven test", command: "mvn", args: ["test", "-q"] });
  if (fs.existsSync(path.join(root, "gradlew"))) commands.push({ name: "gradle test", command: process.platform === "win32" ? "gradlew.bat" : "./gradlew", args: ["test"] });

  const seen = new Set();
  return commands.filter((item) => {
    const key = `${item.command}\0${JSON.stringify(item.args || [])}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function runTests(root, policy, changes) {
  const results = [];
  const failures = [];
  const commands = detectTestCommands(root, policy, changes);
  for (const item of commands) {
    const started = Date.now();
    const result = cp.spawnSync(item.command, item.args || [], {
      cwd: root,
      encoding: "utf8",
      timeout: policy.testTimeoutSeconds * 1000,
      env: { ...process.env, CI: "1" },
      maxBuffer: 16 * 1024 * 1024
    });
    const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
    const passed = result.status === 0 && !result.error;
    results.push({
      name: item.name || item.command,
      command: [item.command, ...(item.args || [])].join(" "),
      result: passed ? "PASS" : "FAIL",
      exitCode: result.status,
      durationMs: Date.now() - started,
      outputTail: output.slice(-6000)
    });
    if (!passed) failures.push(`${item.name || item.command}: verification command failed. ${output.slice(-1200)}`);
  }
  if (!commands.length) {
    results.push({
      name: "automatic-tests",
      result: "NOT_FOUND",
      reason: hasCodeChanges(changes)
        ? "Code changed, but no configured or safely detectable test command was found. Independent verification must establish the requested behavior another way or block completion."
        : "The changed artifacts do not require a code test command."
    });
  }
  return { failures, results };
}

function evaluate(root = ROOT, options = {}) {
  const policy = loadPolicy(root);
  const activePath = path.join(root, ".claude", "gate-state", "active-task.json");
  const active = readJson(activePath, null);
  const beforeTests = snapshot(root, policy);
  const baseline = active?.baseline || beforeTests;
  const changesBeforeTests = compareSnapshots(baseline, beforeTests);
  const failures = [];
  const checks = [];

  let tests = [];
  if (options.runTests) {
    const testResult = runTests(root, policy, changesBeforeTests);
    failures.push(...testResult.failures);
    tests = testResult.results;
  }

  const current = options.runTests ? snapshot(root, policy) : beforeTests;
  const allChanges = compareSnapshots(baseline, current);
  const changeDigest = digestChanges(allChanges);

  const protectedResult = checkProtectedChanges(allChanges, current, active, policy);
  failures.push(...protectedResult.failures);
  checks.push(...protectedResult.checks);

  const governanceResult = checkGovernance(root, current, allChanges, active, policy);
  failures.push(...governanceResult.failures);
  checks.push(...governanceResult.checks);

  const evidenceChanges = allChanges.slice(0, policy.maxEvidenceChangedFiles).map((change) => ({
    ...change,
    baselineCopy: active?.baselineCopies?.[change.path] || null,
    currentPath: change.status === "deleted" ? null : change.path
  }));

  return {
    schemaVersion: 2,
    generatedAt: now(),
    projectRoot: root,
    task: active ? {
      startedAt: active.startedAt,
      classification: active.classification,
      promptDigest: promptDigest(active),
      prompts: active.prompts
    } : null,
    authorityFiles: discoverAuthorityFiles({ ...(active?.baseline || {}), ...current }, policy),
    changedFiles: evidenceChanges,
    changedFileCount: allChanges.length,
    changedFilesTruncated: allChanges.length > evidenceChanges.length,
    changeDigest,
    mechanical: { result: failures.length ? "FAIL" : "PASS", failures, checks, tests }
  };
}

function conciseFailure(evidence) {
  const items = evidence.mechanical.failures.slice(0, 8);
  const remainder = evidence.mechanical.failures.length - items.length;
  let message = "UNIVERSAL GOVERNANCE GATE BLOCKED COMPLETION\n";
  message += items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  if (remainder > 0) message += `\n...and ${remainder} more failure(s).`;
  message += "\nCorrect the actual work and try task completion again. Do not ask the user to audit or relay findings.";
  return message;
}

function validContractReceipt(active, taskId = null) {
  const receipt = readJson(CONTRACT_PATH, null);
  if (!receipt || !active) return false;
  if (receipt.promptDigest !== promptDigest(active)) return false;
  if (taskId && receipt.taskId !== taskId) return false;
  return true;
}

function capture() {
  const input = readStdin();
  const policy = loadPolicy();
  fs.mkdirSync(STATE_DIR, { recursive: true });
  let active = getActive();

  if (!active || active.completedAt) {
    const baseline = snapshot(ROOT, policy);
    const cached = cacheBaselineFiles(ROOT, policy, baseline);
    active = {
      schemaVersion: 2,
      sessionId: input.session_id || null,
      startedAt: now(),
      completedAt: null,
      classification: "ordinary",
      baseline,
      baselineCopies: cached.files,
      baselineCopyBytes: cached.bytes,
      prompts: []
    };
  }

  active.sessionId = input.session_id || active.sessionId;
  const text = String(input.prompt || "");
  active.prompts.push({ at: now(), text });
  if (looksConsequential(text)) active.classification = "consequential";
  active.lastPromptAt = now();
  writeJson(ACTIVE_PATH, active);
  resetReceipts();

  const additionalContext = [
    "The Universal Governance Gate is active.",
    "Read DECISION_LOG.txt and CURRENT_STATE.txt before consequential work.",
    "Preserve the user's wording and existing project authority; necessary implementation detail is allowed only when it does not alter the objective, scope, decisions, or success condition.",
    "Before any file-changing or consequential task, create exactly ONE tracked task. Its description must contain four labeled lines: Outcome:, Scope:, Preserve:, and Proof:. The automatic contract gate must accept it before edits begin.",
    "When finished, update CURRENT_STATE.txt, append DL1-DL4 only for material decisions, then mark the tracked task completed so actual files and tests receive independent verification.",
    "Never ask the user to audit intermediate work or relay verifier messages. If and only if a material decision is genuinely missing, run the gate's pause-for-user mode and ask one focused question."
  ].join(" ");

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext
    }
  }));
}

function buildContext(input = {}) {
  const active = getActive();
  const source = input.source || "startup";
  const lines = [
    "Universal governance is active.",
    "Read DECISION_LOG.txt first and CURRENT_STATE.txt second. They are the only operative governance documents.",
    "The executable gate is enforcement infrastructure and must not be bypassed."
  ];
  if (active && !active.completedAt) {
    const exact = allPromptText(active);
    const clipped = exact.length > 12000 ? `${exact.slice(0, 12000)}\n[Full exact prompts remain in .claude/gate-state/active-task.json and are available through task-context.]` : exact;
    lines.push(`An unfinished governed task survived ${source}. Re-check it instead of reconstructing it from memory.`);
    lines.push(`CAPTURED USER REQUEST(S), VERBATIM:\n${clipped}`);
    lines.push("Run `node .claude/hooks/universal-governance-gate.cjs task-context` if the full task context is needed.");
  }
  return lines.join("\n\n");
}

function contextMode() {
  const input = readStdin();
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: buildContext(input)
    }
  }));
}

function taskContext() {
  const active = getActive();
  process.stdout.write(`${JSON.stringify(active || { activeTask: null }, null, 2)}\n`);
}

function contractEvidence() {
  const policy = loadPolicy();
  const current = snapshot(ROOT, policy);
  const active = getActive();
  process.stdout.write(`${JSON.stringify({
    activeTask: active ? { classification: active.classification, promptDigest: promptDigest(active), prompts: active.prompts } : null,
    pendingContract: readJson(PENDING_CONTRACT_PATH, null),
    authorityFiles: discoverAuthorityFiles(current, policy)
  }, null, 2)}\n`);
}

function contractCheck() {
  const input = readStdin();
  const active = getActive();
  if (!active) {
    process.stderr.write("No captured user request exists. Do not create implementation tasks before a user request is captured.\n");
    process.exit(2);
  }
  const description = String(input.task_description || "");
  const missing = ["Outcome", "Scope", "Preserve", "Proof"].filter((label) => !new RegExp(`^${label}:\\s*\\S`, "im").test(description));
  if (missing.length) {
    process.stderr.write(`Task description is missing required contract line(s): ${missing.join(", ")}. Recreate one task with Outcome:, Scope:, Preserve:, and Proof: derived from the user's exact request.\n`);
    process.exit(2);
  }
  const existing = readJson(CONTRACT_PATH, null);
  if (existing && existing.promptDigest === promptDigest(active) && existing.taskId !== input.task_id) {
    process.stderr.write("One governed task contract already exists for this request. Use that task; do not create additional management tasks.\n");
    process.exit(2);
  }
  writeJson(PENDING_CONTRACT_PATH, {
    schemaVersion: 2,
    capturedAt: now(),
    promptDigest: promptDigest(active),
    taskId: input.task_id || null,
    taskSubject: input.task_subject || "",
    taskDescription: description
  });
  process.exit(0);
}

function waitForPending(taskId, timeoutMs = 5000) {
  const sleeper = new Int32Array(new SharedArrayBuffer(4));
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const pending = readJson(PENDING_CONTRACT_PATH, null);
    if (pending && pending.taskId === taskId) return pending;
    Atomics.wait(sleeper, 0, 0, 100);
  }
  return null;
}

function recordContractPass() {
  const taskId = String(MODE_ARGS[0] || "").trim();
  if (!taskId) throw new Error("record-contract-pass requires the exact task ID.");
  const active = getActive();
  if (!active) throw new Error("No active task exists.");
  const pending = waitForPending(taskId);
  if (!pending || pending.promptDigest !== promptDigest(active)) {
    throw new Error("The mechanically valid pending task contract was not found or no longer matches the user's prompts.");
  }
  writeJson(CONTRACT_PATH, {
    schemaVersion: 2,
    passedAt: now(),
    taskId,
    promptDigest: promptDigest(active),
    contractDigest: hashString(`${pending.taskSubject}\n${pending.taskDescription}`)
  });
  process.stdout.write("Independent contract pass recorded.\n");
}

function collectToolPaths(value, key = "", result = []) {
  if (typeof value === "string") {
    if (/(?:^|_)(?:file|path|notebook|target|source|destination)(?:$|_)/i.test(key)) result.push(value);
    return result;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectToolPaths(item, key, result);
    return result;
  }
  if (value && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) collectToolPaths(child, childKey, result);
  }
  return result;
}

function toolRelativePaths(input) {
  const values = collectToolPaths(input.tool_input || {});
  return values.map((value) => {
    const absolute = path.isAbsolute(value) ? path.resolve(value) : path.resolve(ROOT, value);
    return normalizeRel(path.relative(ROOT, absolute));
  });
}

function gateCommandMode(command) {
  const match = /universal-governance-gate\.cjs["']?\s+([a-z-]+)/i.exec(String(command || ""));
  return match ? match[1].toLowerCase() : null;
}

function shellMentionsPath(command, relativePath) {
  const normalizedCommand = String(command || "").replace(/\\/g, "/").toLowerCase();
  return normalizedCommand.includes(normalizeRel(relativePath).toLowerCase());
}

function denyTool(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason
    }
  }));
}

function guardTool() {
  const input = readStdin();
  const active = getActive();
  const tool = String(input.tool_name || "");
  const command = String(input.tool_input?.command || "");
  const agentCall = Boolean(input.agent_id || input.agent_type);
  const shellTool = /^(?:Bash|PowerShell)$/i.test(tool);
  const invokedGateMode = shellTool ? gateCommandMode(command) : null;
  const receiptMode = invokedGateMode === "record-contract-pass" || invokedGateMode === "record-semantic-pass";
  const safeGateReadMode = ["contract-evidence", "evidence", "completion-evidence", "task-context"].includes(invokedGateMode);
  const pauseMode = invokedGateMode === "pause-for-user";

  if (receiptMode && !agentCall) {
    denyTool("Only the independent hook verifier may issue governance pass receipts. Continue the real work or mark the governed task complete; do not self-certify.");
    return;
  }

  if (safeGateReadMode || (receiptMode && agentCall) || pauseMode) process.exit(0);

  if (shellTool && shellMentionsPath(command, ".claude/gate-state")) {
    denyTool("Gate evidence and receipts are protected from shell access. Use the gate's read-only evidence modes instead of touching .claude/gate-state.");
    return;
  }

  const paths = toolRelativePaths(input);
  if (!agentCall && paths.some((item) => pathKey(item).startsWith(pathKey(".claude/gate-state/")))) {
    denyTool("Gate evidence and receipts are protected from the builder. Do not modify .claude/gate-state directly.");
    return;
  }

  const policy = loadPolicy();
  const protectedGate = new Set((policy.protectedGatePaths || []).map(pathKey));
  if (paths.some((item) => protectedGate.has(pathKey(item))) && !explicitGateAuthorization(allPromptText(active))) {
    denyTool("The requested task does not authorize changing the gate. Preserve gate infrastructure and continue within the approved project scope.");
    return;
  }

  if (shellTool
      && (policy.protectedGatePaths || []).some((item) => shellMentionsPath(command, item))
      && !explicitGateAuthorization(allPromptText(active))) {
    denyTool("The requested task does not authorize changing or scripting against gate infrastructure. Preserve the gate and continue within the approved project scope.");
    return;
  }

  const fileTool = /^(?:Edit|Write|NotebookEdit)$/i.test(tool) || /^mcp__.*__(?:write|create|update|delete|remove|move|rename)/i.test(tool);
  const mutating = fileTool || shellTool;
  if (!mutating) process.exit(0);

  if (!active) {
    denyTool("No user request has been captured. Wait for a user request before changing project files.");
    return;
  }
  if (!validContractReceipt(active)) {
    denyTool("Create exactly one tracked task before changing files. Its description must contain Outcome:, Scope:, Preserve:, and Proof:. The independent TaskCreated gate must accept it first.");
    return;
  }
  process.exit(0);
}

function verify() {
  const input = readStdin();
  const active = getActive();
  const taskId = String(input.task_id || "");
  if (!active || !validContractReceipt(active, taskId)) {
    process.stderr.write("Task completion lacks an independently accepted contract matching the current user prompts. Create the required single task contract before completing work.\n");
    process.exit(2);
  }
  const evidence = evaluate(ROOT, { runTests: true });
  writeJson(LATEST_EVIDENCE_PATH, evidence);
  if (evidence.mechanical.result !== "PASS") {
    process.stderr.write(`${conciseFailure(evidence)}\n`);
    process.exit(2);
  }
  const contract = readJson(CONTRACT_PATH, null);
  writeJson(MECHANICAL_PATH, {
    schemaVersion: 2,
    passedAt: now(),
    taskId,
    promptDigest: promptDigest(active),
    contractDigest: contract.contractDigest,
    changeDigest: evidence.changeDigest,
    tests: evidence.mechanical.tests
  });
  process.exit(0);
}

function evidenceMode() {
  const evidence = evaluate(ROOT, { runTests: false });
  const mechanical = readJson(MECHANICAL_PATH, null);
  if (mechanical && mechanical.changeDigest === evidence.changeDigest && mechanical.promptDigest === evidence.task?.promptDigest) {
    evidence.mechanical.tests = mechanical.tests || [];
  }
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
}

function completionEvidence() {
  const taskId = String(MODE_ARGS[0] || "").trim();
  if (!taskId) throw new Error("completion-evidence requires the exact task ID.");
  const active = getActive();
  if (!active || !validContractReceipt(active, taskId)) throw new Error("No matching active task contract exists.");
  const policy = loadPolicy();
  const deadline = Date.now() + ((policy.testTimeoutSeconds + 120) * 1000);
  const sleeper = new Int32Array(new SharedArrayBuffer(4));

  while (Date.now() < deadline) {
    const latest = readJson(LATEST_EVIDENCE_PATH, null);
    if (latest?.task?.promptDigest === promptDigest(active)) {
      if (latest.mechanical?.result === "FAIL") {
        process.stdout.write(`${JSON.stringify(latest, null, 2)}\n`);
        return;
      }
      const mechanical = readJson(MECHANICAL_PATH, null);
      if (mechanical
          && mechanical.taskId === taskId
          && mechanical.promptDigest === promptDigest(active)
          && mechanical.changeDigest === latest.changeDigest) {
        latest.mechanical.tests = mechanical.tests || [];
        process.stdout.write(`${JSON.stringify(latest, null, 2)}\n`);
        return;
      }
    }
    Atomics.wait(sleeper, 0, 0, 200);
  }
  throw new Error("Timed out waiting for the mechanical file and test verification. Block completion and tell Claude to retry the existing task completion.");
}

function recordSemanticPass() {
  const taskId = String(MODE_ARGS[0] || "").trim();
  if (!taskId) throw new Error("record-semantic-pass requires the exact task ID.");
  const active = getActive();
  if (!active || !validContractReceipt(active, taskId)) throw new Error("No matching active task contract exists.");
  const evidence = evaluate(ROOT, { runTests: false });
  if (evidence.mechanical.result !== "PASS") {
    process.stderr.write(`${conciseFailure(evidence)}\n`);
    process.exit(2);
  }
  const mechanical = readJson(MECHANICAL_PATH, null);
  if (!mechanical
      || mechanical.taskId !== taskId
      || mechanical.promptDigest !== promptDigest(active)
      || mechanical.changeDigest !== evidence.changeDigest) {
    throw new Error("Fresh mechanical file and test verification has not passed for this exact result.");
  }
  writeJson(SEMANTIC_PATH, {
    schemaVersion: 2,
    passedAt: now(),
    taskId,
    promptDigest: promptDigest(active),
    changeDigest: evidence.changeDigest
  });
  process.stdout.write("Independent semantic pass recorded.\n");
}

function pauseForUser() {
  const question = MODE_ARGS.join(" ").trim();
  if (!question || !/\?\s*$/.test(question)) throw new Error("pause-for-user requires the exact focused question ending in a question mark.");
  const active = getActive();
  if (!active) throw new Error("No active governed task exists.");
  const evidence = evaluate(ROOT, { runTests: false });
  writeJson(PAUSE_PATH, {
    schemaVersion: 2,
    recordedAt: now(),
    promptDigest: promptDigest(active),
    changeDigest: evidence.changeDigest,
    question
  });
  process.stdout.write("Focused user-decision pause recorded.\n");
}

function finalize() {
  const input = readStdin();
  const active = getActive();
  if (!active) process.exit(0);

  const background = [...(input.background_tasks || []), ...(input.session_crons || [])];
  if (background.length) process.exit(0);

  const evidence = evaluate(ROOT, { runTests: false });
  const pause = readJson(PAUSE_PATH, null);
  const lastMessage = String(input.last_assistant_message || "").trim();
  if (pause
      && pause.promptDigest === promptDigest(active)
      && pause.changeDigest === evidence.changeDigest
      && lastMessage.includes(pause.question)
      && /\?\s*$/.test(lastMessage)) {
    process.exit(0);
  }

  if (evidence.changedFileCount === 0 && active.classification === "ordinary") {
    active.completedAt = now();
    active.acceptedChangeDigest = evidence.changeDigest;
    writeJson(ACTIVE_PATH, active);
    process.exit(0);
  }

  if (evidence.mechanical.result !== "PASS") {
    process.stderr.write(`${conciseFailure(evidence)}\n`);
    process.exit(2);
  }

  const contract = readJson(CONTRACT_PATH, null);
  const mechanical = readJson(MECHANICAL_PATH, null);
  const semantic = readJson(SEMANTIC_PATH, null);
  const missing = [];
  if (!contract || contract.promptDigest !== promptDigest(active)) missing.push("independent task-contract approval");
  if (!mechanical
      || mechanical.promptDigest !== promptDigest(active)
      || mechanical.changeDigest !== evidence.changeDigest
      || mechanical.taskId !== contract?.taskId) missing.push("mechanical file/governance/test verification");
  if (!semantic
      || semantic.promptDigest !== promptDigest(active)
      || semantic.changeDigest !== evidence.changeDigest
      || semantic.taskId !== contract?.taskId) missing.push("fresh semantic verification against the original request");

  if (missing.length) {
    process.stderr.write(`Completion has not passed: ${missing.join(" and ")}. Use the existing governed task and mark it completed now so the automatic completion checks run. Correct failures yourself; do not ask the user to audit or relay anything.\n`);
    process.exit(2);
  }

  active.completedAt = now();
  active.acceptedChangeDigest = evidence.changeDigest;
  active.acceptedTaskId = contract.taskId;
  writeJson(ACTIVE_PATH, active);
  writeText(LAST_RESULT_PATH, [
    "UNIVERSAL GOVERNANCE GATE: PASS",
    `Time: ${now()}`,
    `Task: ${contract.taskId}`,
    `Changed files checked: ${evidence.changedFileCount}`,
    "Task contract: INDEPENDENT PASS",
    "Mechanical evidence: PASS",
    "Fresh completion verification: PASS",
    "The builder's own checklist or claimed PASS was not accepted as proof."
  ].join("\n") + "\n");
  process.exit(0);
}

function protectConfig() {
  const input = readStdin();
  const active = getActive();
  if (explicitGateAuthorization(allPromptText(active))) process.exit(0);
  const file = input.file_path ? normalizeRel(path.relative(ROOT, input.file_path)) : "project configuration";
  process.stderr.write(`Blocked configuration change to ${file}: the user did not request a gate/configuration change.\n`);
  process.exit(2);
}

function projectCheck(root = ROOT) {
  const failures = [];
  const policy = loadPolicy(root);
  const current = snapshot(root, policy);
  for (const required of policy.requiredGovernanceFiles || []) {
    if (!Object.prototype.hasOwnProperty.call(current, required)) failures.push(`Missing ${required}.`);
  }
  const decision = validateDecisionLog(readText(root, "DECISION_LOG.txt"));
  failures.push(...decision.failures);
  const state = validateCurrentState(readText(root, "CURRENT_STATE.txt"));
  failures.push(...state.failures);
  const settings = readJson(path.join(root, ".claude", "settings.json"), null);
  if (!settings) failures.push("Missing or invalid .claude/settings.json.");
  const requiredHooks = {
    SessionStart: "context",
    UserPromptSubmit: "capture",
    TaskCreated: "contract-check",
    PreToolUse: "guard-tool",
    TaskCompleted: "verify",
    Stop: "finalize",
    ConfigChange: "protect-config"
  };
  for (const [event, mode] of Object.entries(requiredHooks)) {
    const groups = Array.isArray(settings?.hooks?.[event]) ? settings.hooks[event] : [];
    const handlers = groups.flatMap((group) => Array.isArray(group?.hooks) ? group.hooks : []);
    const installed = handlers.some((handler) => {
      const serializedHandler = JSON.stringify(handler);
      return serializedHandler.includes("universal-governance-gate.cjs") && serializedHandler.includes(`\"${mode}\"`);
    });
    if (!installed) failures.push(`.claude/settings.json is missing the ${event} ${mode} gate hook.`);
  }
  for (const event of ["TaskCreated", "TaskCompleted"]) {
    const groups = Array.isArray(settings?.hooks?.[event]) ? settings.hooks[event] : [];
    const handlers = groups.flatMap((group) => Array.isArray(group?.hooks) ? group.hooks : []);
    if (!handlers.some((handler) => handler?.type === "agent" && String(handler.prompt || "").includes("universal-gate-verifier.md"))) {
      failures.push(`.claude/settings.json is missing the independent ${event} agent verifier.`);
    }
  }
  const verifier = readText(root, ".claude/universal-gate-verifier.md");
  for (const requirement of ["record-contract-pass TASK_ID", "completion-evidence TASK_ID", "record-semantic-pass TASK_ID"]) {
    if (!verifier.includes(requirement)) failures.push(`.claude/universal-gate-verifier.md is missing ${requirement}.`);
  }
  if (failures.length) {
    process.stderr.write(`PROJECT CHECK: FAIL\n${failures.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n`);
    return false;
  }
  process.stdout.write("PROJECT CHECK: PASS\nTwo governance documents are valid and every universal gate hook is installed.\n");
  return true;
}

function withFixture(files, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "universal-governance-gate-test-"));
  try {
    fs.mkdirSync(path.join(root, ".claude", "hooks"), { recursive: true });
    const fixturePolicy = readJson(POLICY_PATH, null);
    if (!fixturePolicy) throw new Error("Self-test could not read the installed gate policy.");
    fixturePolicy.testCommands = [];
    writeJson(path.join(root, ".claude", "universal-gate-policy.json"), fixturePolicy);
    for (const [relative, content] of Object.entries(files)) {
      const target = path.join(root, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content, "utf8");
    }
    return callback(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function spawnMode(root, mode, input = {}, args = []) {
  return cp.spawnSync(process.execPath, [__filename, mode, ...args], {
    cwd: root,
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    input: `${JSON.stringify(input)}\n`,
    encoding: "utf8",
    timeout: 30000
  });
}

function selfTest() {
  const results = [];
  function test(name, fn) {
    try {
      fn();
      results.push({ name, pass: true });
    } catch (error) {
      results.push({ name, pass: false, error: error.message });
    }
  }
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  const decisionTemplate = readText(ROOT, "DECISION_LOG.txt");
  const stateTemplate = readText(ROOT, "CURRENT_STATE.txt");
  assert(decisionTemplate, "Self-test requires DECISION_LOG.txt in the project root.");
  assert(stateTemplate, "Self-test requires CURRENT_STATE.txt in the project root.");
  function revisedState(label) {
    const revised = stateTemplate.replace(/^(ST4\b[^\n]*\n)/m, `$1Self-test state update: ${label}.\n`);
    assert(revised !== stateTemplate, "Self-test could not create a valid changed current-state fixture.");
    return revised;
  }

  test("accepts all eight frozen governance rules", () => {
    const result = validateDecisionLog(decisionTemplate);
    assert(result.failures.length === 0, result.failures.join(" | "));
  });

  test("rejects a missing frozen rule", () => {
    const result = validateDecisionLog(decisionTemplate.replace(/^CR12[\s\S]*?Covers: RC5\s*/m, ""));
    assert(result.failures.some((item) => /CR12/i.test(item)), "Missing CR12 was not rejected.");
  });

  test("rejects an incomplete current state", () => {
    const result = validateCurrentState(stateTemplate.replace(/^ST4[\s\S]*$/m, ""));
    assert(result.failures.some((item) => /ST4/i.test(item)), "Missing ST4 was not rejected.");
  });

  test("rejects a decision entry missing DL2", () => {
    const broken = `${decisionTemplate}\nENTRY D-999 — BROKEN\nDL1: Choice\nDL3: VERIFIED\nDL4: N/A\n`;
    const result = validateDecisionLog(broken);
    assert(result.failures.some((item) => /D-999.*DL2/i.test(item)), "Missing DL2 was not rejected.");
  });

  test("detects added, modified, and deleted files", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate,
    "a.txt": "a",
    "b.txt": "b"
  }, (root) => {
    const policy = loadPolicy(root);
    const before = snapshot(root, policy);
    fs.writeFileSync(path.join(root, "a.txt"), "changed", "utf8");
    fs.unlinkSync(path.join(root, "b.txt"));
    fs.writeFileSync(path.join(root, "c.txt"), "new", "utf8");
    const changes = compareSnapshots(before, snapshot(root, policy));
    assert(changes.some((item) => item.path === "a.txt" && item.status === "modified"), "Modification was missed.");
    assert(changes.some((item) => item.path === "b.txt" && item.status === "deleted"), "Deletion was missed.");
    assert(changes.some((item) => item.path === "c.txt" && item.status === "added"), "Addition was missed.");
  }));

  test("detects a middle-only change in a chunk-hashed file", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate,
    "large.txt": "abc"
  }, (root) => {
    const policyPath = path.join(root, ".claude", "universal-gate-policy.json");
    const policy = readJson(policyPath, null);
    policy.maxHashBytesPerFile = 1;
    writeJson(policyPath, policy);
    const before = snapshot(root, policy);
    fs.writeFileSync(path.join(root, "large.txt"), "axc", "utf8");
    const changes = compareSnapshots(before, snapshot(root, policy));
    assert(changes.some((item) => item.path === "large.txt" && item.status === "modified"), "Middle-only content change was missed.");
  }));

  test("permits a true append to decision history", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate
  }, (root) => {
    const policy = loadPolicy(root);
    const baseline = snapshot(root, policy);
    const cached = cacheBaselineFiles(root, policy, baseline);
    const active = { baseline, baselineCopies: cached.files, prompts: [{ text: "Build the requested feature." }] };
    fs.appendFileSync(path.join(root, "DECISION_LOG.txt"), "\nENTRY D-004 — TEST\nDL1: Decide X\nDL2: Reject Y because Z\nDL3: VERIFIED\nDL4: N/A\n", "utf8");
    fs.writeFileSync(path.join(root, "CURRENT_STATE.txt"), revisedState("decision append"), "utf8");
    const current = snapshot(root, policy);
    const result = checkGovernance(root, current, compareSnapshots(baseline, current), active, policy);
    assert(!result.failures.some((item) => /append-only history/i.test(item)), result.failures.join(" | "));
  }));

  test("rejects editing old decision history", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate
  }, (root) => {
    const policy = loadPolicy(root);
    const baseline = snapshot(root, policy);
    const cached = cacheBaselineFiles(root, policy, baseline);
    const active = { baseline, baselineCopies: cached.files, prompts: [{ text: "Build the requested feature." }] };
    fs.writeFileSync(path.join(root, "DECISION_LOG.txt"), decisionTemplate.replace("ENTRY D-001", "ENTRY D-001-EDITED"), "utf8");
    fs.writeFileSync(path.join(root, "CURRENT_STATE.txt"), revisedState("history edit"), "utf8");
    const current = snapshot(root, policy);
    const result = checkGovernance(root, current, compareSnapshots(baseline, current), active, policy);
    assert(result.failures.some((item) => /append-only history/i.test(item)), "Edited history was not rejected.");
  }));

  test("rejects silent gate modification", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate,
    ".claude/settings.json": "{}"
  }, (root) => {
    const policy = loadPolicy(root);
    const before = snapshot(root, policy);
    fs.writeFileSync(path.join(root, ".claude", "settings.json"), "{\"changed\":true}", "utf8");
    const current = snapshot(root, policy);
    const result = checkProtectedChanges(compareSnapshots(before, current), current, { prompts: [{ text: "Fix application code." }] }, policy);
    assert(result.failures.some((item) => /gate infrastructure/i.test(item)), "Silent gate change was not rejected.");
  }));

  test("rejects silent authority modification", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate,
    "SPEC.md": "frozen requirement"
  }, (root) => {
    const policy = loadPolicy(root);
    const before = snapshot(root, policy);
    fs.writeFileSync(path.join(root, "SPEC.md"), "different requirement", "utf8");
    const current = snapshot(root, policy);
    const result = checkProtectedChanges(compareSnapshots(before, current), current, { prompts: [{ text: "Implement the feature in the spec." }] }, policy);
    assert(result.failures.some((item) => /authority document/i.test(item)), "Silent authority change was not rejected.");
  }));

  test("protects a deleted authority document", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate,
    "Methodology Architecture v2.txt": "frozen architecture"
  }, (root) => {
    const policy = loadPolicy(root);
    const baseline = snapshot(root, policy);
    fs.unlinkSync(path.join(root, "Methodology Architecture v2.txt"));
    const current = snapshot(root, policy);
    const active = { baseline, prompts: [{ text: "Implement the architecture." }] };
    const result = checkProtectedChanges(compareSnapshots(baseline, current), current, active, policy);
    assert(result.failures.some((item) => /authority document/i.test(item)), "Deleted authority escaped protection.");
  }));

  test("recognizes an explicitly authorized authority edit", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate,
    "Methodology Architecture v2.txt": "before"
  }, (root) => {
    const policy = loadPolicy(root);
    const baseline = snapshot(root, policy);
    fs.writeFileSync(path.join(root, "Methodology Architecture v2.txt"), "after", "utf8");
    const current = snapshot(root, policy);
    const active = { baseline, prompts: [{ text: "Update Methodology Architecture v2 to the approved wording." }] };
    const result = checkProtectedChanges(compareSnapshots(baseline, current), current, active, policy);
    assert(!result.failures.some((item) => /authority document/i.test(item)), result.failures.join(" | "));
  }));

  test("requires current state after artifact changes", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate,
    "work.txt": "before"
  }, (root) => {
    const policy = loadPolicy(root);
    const baseline = snapshot(root, policy);
    const cached = cacheBaselineFiles(root, policy, baseline);
    const active = { baseline, baselineCopies: cached.files, prompts: [{ text: "Update work.txt." }] };
    fs.writeFileSync(path.join(root, "work.txt"), "after", "utf8");
    const current = snapshot(root, policy);
    const result = checkGovernance(root, current, compareSnapshots(baseline, current), active, policy);
    assert(result.failures.some((item) => /CURRENT_STATE.*not updated/i.test(item)), "Stale current state was not rejected.");
  }));

  test("blocks a write before contract approval", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate
  }, (root) => {
    const captured = spawnMode(root, "capture", { session_id: "s", prompt: "Create result.txt with the requested result." });
    assert(captured.status === 0, captured.stderr);
    const guarded = spawnMode(root, "guard-tool", { tool_name: "Write", tool_input: { file_path: path.join(root, "result.txt"), content: "x" } });
    assert(guarded.stdout.includes("permissionDecision\":\"deny"), "Write was not denied before contract approval.");
  }));

  test("blocks an arbitrary shell command before contract approval", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate
  }, (root) => {
    spawnMode(root, "capture", { session_id: "s", prompt: "Create result.txt with the requested result." });
    const guarded = spawnMode(root, "guard-tool", {
      tool_name: "Bash",
      tool_input: { command: "node -e \"require('fs').writeFileSync('result.txt','bypass')\"" }
    });
    assert(guarded.stdout.includes("permissionDecision\":\"deny"), "Arbitrary shell execution escaped the pre-contract gate.");
  }));

  test("blocks builder self-certification", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate
  }, (root) => {
    spawnMode(root, "capture", { session_id: "s", prompt: "Create result.txt." });
    const contractInput = {
      task_id: "task-self",
      task_subject: "Create result",
      task_description: "Outcome: result exists.\nScope: result.txt.\nPreserve: all other files.\nProof: inspect result.txt."
    };
    spawnMode(root, "contract-check", contractInput);
    const guarded = spawnMode(root, "guard-tool", {
      tool_name: "Bash",
      tool_input: { command: `node \"${path.join(root, ".claude", "hooks", "universal-governance-gate.cjs")}\" record-contract-pass task-self` }
    });
    assert(guarded.stdout.includes("permissionDecision\":\"deny"), "Builder was allowed to issue its own pass receipt.");
  }));

  test("rejects semantic certification before mechanical verification", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate,
    "work.txt": "before"
  }, (root) => {
    spawnMode(root, "capture", { session_id: "s", prompt: "Update work.txt to say after." });
    const contractInput = {
      task_id: "task-order",
      task_subject: "Update work",
      task_description: "Outcome: work.txt says after.\nScope: work.txt and current state.\nPreserve: all other files.\nProof: inspect both files."
    };
    spawnMode(root, "contract-check", contractInput);
    spawnMode(root, "record-contract-pass", {}, ["task-order"]);
    fs.writeFileSync(path.join(root, "work.txt"), "after", "utf8");
    fs.writeFileSync(path.join(root, "CURRENT_STATE.txt"), revisedState("semantic ordering"), "utf8");
    const semantic = spawnMode(root, "record-semantic-pass", {}, ["task-order"]);
    assert(semantic.status === 2, "Semantic pass was accepted before the mechanical pass.");
  }));

  test("blocks consequential no-op completion", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate
  }, (root) => {
    spawnMode(root, "capture", { session_id: "s", prompt: "Create the requested system." });
    const stopped = spawnMode(root, "finalize", { last_assistant_message: "Done." });
    assert(stopped.status === 2, "Consequential no-op completion was allowed.");
  }));

  test("allows an ordinary no-change question", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate
  }, (root) => {
    spawnMode(root, "capture", { session_id: "s", prompt: "What does this setting mean?" });
    const stopped = spawnMode(root, "finalize", { last_assistant_message: "It means X." });
    assert(stopped.status === 0, stopped.stderr);
  }));

  test("restores exact active intent after compaction", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate
  }, (root) => {
    spawnMode(root, "capture", { session_id: "s", prompt: "Create only alpha.txt and preserve beta.txt." });
    const context = spawnMode(root, "context", { source: "compact" });
    assert(context.stdout.includes("Create only alpha.txt and preserve beta.txt."), "Compaction context lost the exact prompt.");
  }));

  test("includes files generated by verification commands", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate
  }, (root) => {
    const policyPath = path.join(root, ".claude", "universal-gate-policy.json");
    const policy = readJson(policyPath, null);
    policy.testCommands = [{
      name: "generate verification artifact",
      command: process.execPath,
      args: ["-e", "require('fs').writeFileSync('generated-by-test.txt','verified')"]
    }];
    writeJson(policyPath, policy);
    const evidence = evaluate(root, { runTests: true });
    assert(evidence.changedFiles.some((item) => item.path === "generated-by-test.txt"), "A test-generated file escaped final evidence.");
  }));

  test("passes the complete contract-to-completion flow", () => withFixture({
    "DECISION_LOG.txt": decisionTemplate,
    "CURRENT_STATE.txt": stateTemplate,
    "work.txt": "before"
  }, (root) => {
    assert(spawnMode(root, "capture", { session_id: "s", prompt: "Update work.txt to say after." }).status === 0, "Capture failed.");
    const contractInput = {
      task_id: "task-1",
      task_subject: "Update work",
      task_description: "Outcome: work.txt says after.\nScope: work.txt only, plus required governance state.\nPreserve: every other project file.\nProof: inspect work.txt and governance state."
    };
    assert(spawnMode(root, "contract-check", contractInput).status === 0, "Contract mechanical check failed.");
    assert(spawnMode(root, "record-contract-pass", {}, ["task-1"]).status === 0, "Contract receipt failed.");
    fs.writeFileSync(path.join(root, "work.txt"), "after", "utf8");
    fs.writeFileSync(path.join(root, "CURRENT_STATE.txt"), revisedState("complete flow"), "utf8");
    assert(spawnMode(root, "verify", contractInput).status === 0, "Mechanical completion verification failed.");
    assert(spawnMode(root, "record-semantic-pass", {}, ["task-1"]).status === 0, "Semantic receipt failed.");
    const stopped = spawnMode(root, "finalize", { last_assistant_message: "Completed." });
    assert(stopped.status === 0, stopped.stderr);
    assert(fs.readFileSync(path.join(root, ".claude", "gate-state", "LAST-GATE-RESULT.txt"), "utf8").includes("PASS"), "Final PASS receipt missing.");
  }));

  const failed = results.filter((item) => !item.pass);
  for (const item of results) {
    process.stdout.write(`${item.pass ? "PASS" : "FAIL"} - ${item.name}${item.error ? `: ${item.error}` : ""}\n`);
  }
  process.stdout.write(`\n${results.length - failed.length}/${results.length} universal gate self-tests passed.\n`);
  if (failed.length) process.exit(1);
}

function help() {
  process.stdout.write("Modes: context, capture, task-context, contract-evidence, contract-check, record-contract-pass, guard-tool, verify, evidence, completion-evidence, record-semantic-pass, pause-for-user, finalize, protect-config, project-check, self-test\n");
}

try {
  if (MODE === "context") contextMode();
  else if (MODE === "capture") capture();
  else if (MODE === "task-context") taskContext();
  else if (MODE === "contract-evidence") contractEvidence();
  else if (MODE === "contract-check") contractCheck();
  else if (MODE === "record-contract-pass") recordContractPass();
  else if (MODE === "guard-tool") guardTool();
  else if (MODE === "verify") verify();
  else if (MODE === "evidence") evidenceMode();
  else if (MODE === "completion-evidence") completionEvidence();
  else if (MODE === "record-semantic-pass") recordSemanticPass();
  else if (MODE === "pause-for-user") pauseForUser();
  else if (MODE === "finalize") finalize();
  else if (MODE === "protect-config") protectConfig();
  else if (MODE === "project-check") {
    if (!projectCheck()) process.exit(1);
  }
  else if (MODE === "self-test") selfTest();
  else help();
} catch (error) {
  process.stderr.write(`UNIVERSAL GOVERNANCE GATE ERROR: ${error.stack || error.message}\n`);
  process.exit(MODE === "self-test" || MODE === "project-check" ? 1 : 2);
}
