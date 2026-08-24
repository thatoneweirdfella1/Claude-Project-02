# DIVERGENCE.AI — Context-Free Governed Handoff Plan v2

**Status:** Planning strategy only. It supersedes v1 as the recommended handoff strategy; v1 remains unchanged as audit history.  
**Created:** August 23, 2026  
**Repository named by the existing authority:** `thatoneweirdfella1/Claude-Project-02`  
**Source candidate named by the existing authority:** `cowork-complete-preview-20260823`  
**Proposed isolated continuation branch:** `horizontal-layer-completion-v1`  
**Protected branch names already identified:** `build`, `frozen-implementation-v1`  

This document does **not** authorize branch creation, repository writes, commits, pushes, ruleset changes, pull requests, merges, deployments, paid services, secret access, or app-code changes. Each capability requires a separate, dated user grant recorded in `PERMISSIONS.yml` before it is used.

---

## Read this first — the answer in one screen

Use the existing repository, not a second repository. Continue on one isolated branch created from a source commit that has first been verified against every plausible work-bearing branch. Do not assume the named source candidate is complete merely because an earlier plan named it.

The repository must carry the complete continuation state. A context-free AI receives one startup instruction, reads the repository routers, runs a read-only preflight, and may edit only when the preflight and its effective permissions allow the exact action.

The system has six controls:

1. **Verified identity:** exact repository, remote, source SHA, continuation branch, and deployed-build SHA where live behavior is claimed.
2. **Derived scope:** requirements, repairs, decisions, workflows, and tests come from versioned ID registries generated from named authority sources—not prose counts or model memory.
3. **One status language:** product-depth cells use the closed vocabulary in this plan; `PASS` and `FAIL` are reserved for process gates.
4. **Bounded work:** one horizontal layer and one coherent batch at a time, with enumerated IDs, paths, tests, and an entry commit.
5. **Evidence, not confidence:** machine checks validate structure; tests, live/manual evidence, and an independent audit judge behavioral truth.
6. **Safe continuation:** every stopped session leaves a generated resume certificate, a committed status/evidence checkpoint when safe, and an exact next action.

No AI may infer permission from this plan. No AI may turn a missing fact into a convenient fact. If a required fact cannot be mechanically or independently established, use `UNKNOWN — INSPECTION REQUIRED` or `CONFLICT — UNRESOLVED` and stop only the affected work.

---

## 1. Goal

Create a repository-governed continuation system that lets an AI with no chat history safely resume unfinished DIVERGENCE.AI work from the exact last verified state.

The incoming AI must be able to determine without guessing:

- the correct repository, remote, branch, and commit;
- which authority version controls each decision;
- which user corrections supersede narrower authority text;
- the complete set of governed IDs;
- what is proven at each horizontal depth layer;
- what is implemented but not proven;
- what remains unknown, partial, blocked, or unresolved;
- the one batch it is allowed to execute;
- which paths it may and may not change;
- which capabilities the user has actually authorized;
- what evidence is required for the current layer;
- whether the live deployment matches the claimed commit; and
- how to leave a safe checkpoint before usage ends.

## 2. Purpose

The purpose is to remove chat history, account memory, model confidence, and verbal handoffs as dependencies. The repository becomes the durable source of continuation truth.

This strategy is specifically designed so that usage can stop after any completed horizontal layer while the **entire applicable site** is known to work to that depth. It must not produce a few deeply finished islands and an untraceable remainder.

It prevents:

- selecting a stale or incomplete branch;
- losing uncommitted work;
- silently inventing decisions or permissions;
- treating current code as authority over approved product intent;
- claiming full behavior from a visual shell;
- weakening tests to obtain a green gate;
- editing the governance mechanism that is supposed to judge the edit;
- using `N/A` to hide unfinished scope;
- confusing a structurally valid evidence file with adequate proof;
- attributing a live deployment to the wrong commit;
- leaving partial work without an executable recovery path; and
- requiring the user to remember which controls happen to work.

## 3. Non-negotiable operating rules

1. Use the same repository unless the user explicitly changes that decision.
2. Preserve `build`, `frozen-implementation-v1`, and every verified checkpoint.
3. Verify all plausible work-bearing branches before selecting the source.
4. Create no branch until `PERMISSIONS.yml` allows it.
5. Install governance before changing app behavior.
6. Work on one horizontal layer and one coherent batch only.
7. Make early-layer work permanent through stable interfaces; do not build disposable fake success paths.
8. Do not make a product decision when authority is missing or conflicting.
9. Do not claim `PROVEN` without layer-appropriate evidence.
10. Do not let a working-branch edit weaken its own validator or protected baseline.
11. Do not expose, record, or hash secret values.
12. Do not merge or deploy merely because implementation and tests pass.

## 4. Facts, claims, and derived registries

### 4.1 Facts that may be carried into discovery

- The intended existing repository name is `thatoneweirdfella1/Claude-Project-02`.
- `build` and `frozen-implementation-v1` are protected unless the user separately authorizes a change.
- `cowork-complete-preview-20260823` is a **source candidate**, not yet a proven source checkpoint.
- `horizontal-layer-completion-v1` is the proposed continuation branch name.
- The horizontal strategy has seven layers, from `L1 REACHABLE` through `L7 PRODUCTION-VERIFIED`.

### 4.2 Counts are expected claims until derived

Earlier documents report:

- 218 permanent requirement/control IDs;
- 39 repair groups;
- 7 unresolved decision IDs, organized into four decision sessions;
- 48 workflows; and
- 266 acceptance-test handles.

These numbers are discovery expectations, not preflight constants and not permission to fabricate missing rows. Phase A must derive exact ID sets from named authority files and write:

```text
docs/authority/PERMANENT-ID-REGISTRY.txt
docs/authority/REPAIR-ID-REGISTRY.txt
docs/authority/DECISION-ID-REGISTRY.txt
docs/authority/WORKFLOW-ID-REGISTRY.txt
docs/authority/ACCEPTANCE-TEST-ID-REGISTRY.txt
```

Each registry must include or be accompanied in `AUTHORITY-MANIFEST.yml` by:

- the source path and content SHA-256;
- the extraction script version and command;
- the extraction date;
- the sorted exact ID set; and
- the mechanically derived count.

Validation compares exact sets, not counts alone. A mismatch with an earlier expected claim becomes `CONFLICT — UNRESOLVED`; the installer must not pad, truncate, renumber, or silently omit entries.

Repair IDs must be validated in both directions: every registered repair appears in its source register, and every repair in the source register appears in the registry. Contiguity is enforced only if the controlling authority defines the IDs as a contiguous series.

Decision registry rows must include their consolidated `session_id`, so seven decisions can remain seven traceable IDs while user involvement is limited to the four approved sessions. Workflow and acceptance-test claims are enforced the same way rather than remaining decorative counts.

### 4.3 Closed product-status vocabulary

Coverage-ledger status cells may contain only:

| Status | Exact meaning |
|---|---|
| `PROVEN` | All evidence required for this ID at this layer exists, is current, and is mutually consistent. |
| `IMPLEMENTED — NOT FULLY PROVEN` | Conforming implementation appears to exist, but required proof is incomplete or stale. |
| `PARTIAL` | Only part of the approved behavior exists. |
| `NOT STARTED` | No conforming implementation evidence exists. |
| `BLOCKED — <reason>` | A named decision, permission, credential, or external dependency blocks this item. |
| `CONFLICT — UNRESOLVED` | Controlling-looking sources disagree and precedence does not resolve them. |
| `UNKNOWN — INSPECTION REQUIRED` | The repository has not supplied enough evidence to classify the item. |
| `N/A AT THIS DEPTH — <reason>` | The ID exists but an exact layer-definition clause says it does not apply at this depth. |

`PASS` and `FAIL` are reserved for process gates such as preflight, CI, focused tests, and independent audit outcomes. They are never ledger-cell synonyms for `PROVEN` or `NOT PROVEN`.

`UNKNOWN` must be inspected. If it cannot be resolved, record the exact missing evidence and keep the layer incomplete. `N/A AT THIS DEPTH` must cite a pre-enumerated allowlist entry and clause from `LAYER-DEFINITIONS.yml`; it remains in denominator reporting and cannot be used ad hoc.

## 5. Repository, source, branch, and dirty-work discovery

### 5.1 Repository identity

Discovery must verify the canonical remote URL and repository identity. A similarly named local directory is not proof. Record the result and the remote full SHA in `SOURCE-CHECKPOINT.json`.

### 5.2 Compare every plausible source before choosing

Before selecting a source checkpoint, compare the named candidate with:

- `build`;
- `frozen-implementation-v1`;
- every local or remote branch containing commits absent from the candidate;
- any known continuation or recovery branch; and
- any preserved dirty-work artifact.

For each candidate record:

- full ref and full SHA;
- merge base with the named source candidate;
- ahead/behind counts;
- commits and material paths absent from the candidate;
- available test/deployment evidence; and
- classification: `INCLUDE`, `EXCLUDE`, or `UNRESOLVED` with reason.

Run the full baseline suite on the final selected candidate. For candidate-only commits, use focused tests and inspection before inclusion; do not waste usage by running the full suite on every historical commit.

If the chosen source would leave valid work behind, explicitly include it or record why it is excluded. The source is valid only when that comparison is complete.

### 5.3 Exact source checkpoint

The selected source must:

- exist remotely at a full 40-character SHA;
- produce a clean worktree;
- have its relevant suite rerun or have the exact missing proof recorded;
- have a matching deployed-build identity if live behavior is credited; and
- contain no silently imported local changes.

`SOURCE-CHECKPOINT.json` records this immutable source SHA. Unlike tracked status documents, it may correctly contain the SHA it points **back to**; tracked files must never be required to contain the SHA of the commit that contains themselves.

### 5.4 Branch collision rule

The proposed branch is:

```text
horizontal-layer-completion-v1
```

If it already exists locally or remotely, enter read-only mode and compare it with the verified source. If it is not unambiguously the intended governed continuation branch, record `BRANCH COLLISION — USER DECISION REQUIRED` and stop. Never overwrite, force-push, reset, or invent a suffix.

### 5.5 Dirty-worktree rule

Never branch from a dirty worktree. When dirty or untracked work exists:

1. enumerate exact files without modifying them;
2. preserve a binary-capable patch or equivalent recovery artifact;
3. create a separate clean worktree from the remote candidate;
4. classify preserved changes as `INCLUDE`, `EXCLUDE`, or `UNRESOLVED`; and
5. import only a coherent, authority-conforming `INCLUDE` patch.

Routine, unambiguous inclusion does not require repeated user approval. Anything that conflicts with authority, changes a settled decision, or remains ambiguous must be presented as one bounded user decision.

## 6. Required repository control system

Install this structure on the authorized continuation branch before app behavior changes:

```text
/
├── AGENTS.md
├── CLAUDE.md
├── START-HERE-DIVERGENCE.md
├── .github/
│   ├── CODEOWNERS
│   └── workflows/
│       └── divergence-governance.yml
├── docs/
│   ├── authority/
│   │   ├── DIVERGENCE-AI-SITE-CONTRACT-v2.md
│   │   ├── DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md
│   │   ├── DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md
│   │   ├── DIVERGENCE-AI-REPAIR-QUEUE-v2.md
│   │   ├── DIVERGENCE-AI-DECISION-QUEUE-v2.md
│   │   ├── DIVERGENCE-AI-ACCEPTANCE-TESTS-v2-ADDITIONS.md
│   │   ├── DIVERGENCE-AI-WORKFLOW-LEDGER-v2-ADDITIONS.md
│   │   ├── DIVERGENCE-AI-TRACEABILITY-MATRIX-v2.md
│   │   ├── DIVERGENCE-AI-CONTRACT-v2-CORRECTION-MANIFEST.md
│   │   ├── DIVERGENCE-AI-UPSTREAM-DECISION-RECOVERY-AUDIT-v1.md
│   │   ├── DIVERGENCE-AI-FIX-ALL-IMPLEMENTATION-AUTHORITY-v2.md
│   │   ├── USER-CORRECTIONS.md
│   │   ├── PERMANENT-ID-REGISTRY.txt
│   │   ├── REPAIR-ID-REGISTRY.txt
│   │   ├── DECISION-ID-REGISTRY.txt
│   │   ├── WORKFLOW-ID-REGISTRY.txt
│   │   └── ACCEPTANCE-TEST-ID-REGISTRY.txt
│   ├── layer-system/
│   │   ├── HORIZONTAL-LAYER-COMPLETION-SYSTEM.md
│   │   ├── AUTHORITY-MANIFEST.yml
│   │   ├── SOURCE-CHECKPOINT.json
│   │   ├── BASELINE-STATE-AUDIT.md
│   │   ├── BASELINE-AUDIT-PROCEDURE.md
│   │   ├── CURRENT-LAYER-STATUS.md
│   │   ├── LAYER-DEFINITIONS.yml
│   │   ├── LAYER-COVERAGE-LEDGER.csv
│   │   ├── LAYER-EVIDENCE-INDEX.jsonl
│   │   ├── EVIDENCE-RECORD-SCHEMA.json
│   │   ├── LAYER-DECISION-BLOCKERS.md
│   │   ├── PROTECTED-PATHS.yml
│   │   ├── PROTECTED-PATH-EXCEPTIONS.yml
│   │   ├── PERMISSIONS.yml
│   │   ├── TEMPLATE-MARKER-ALLOWLIST.txt
│   │   ├── PATH-RECONCILIATION.md
│   │   ├── UNRESOLVED-FINDINGS.md
│   │   ├── CHANGE-RECORD.jsonl
│   │   ├── CHANGE-RECORD-SCHEMA.json
│   │   ├── RECOVERY.md
│   │   └── HANDOFF.md
│   ├── repair-authority/
│   │   └── GPT-5.6-SOL-HANDOFF.md
│   └── visual-authority/
│       └── VISUAL-AUTHORITY-MANIFEST.yml
├── AUDIT-RESULTS/
│   └── README.md
└── scripts/
    └── governance/
        ├── preflight.mjs
        ├── derive-registries.mjs
        ├── verify-ledger.mjs
        ├── verify-protected-paths.mjs
        ├── verify-evidence.mjs
        └── stopping-checkpoint.mjs
```

If the repository already has same-purpose files elsewhere, `PATH-RECONCILIATION.md` must name the canonical path, legacy path, whether the contents match, and the compatibility action. If same-named candidates materially disagree, record a conflict and do not choose by filename, recency, or convenience.

The root README should contain one short pointer to `START-HERE-DIVERGENCE.md` if it can do so without duplicating project truth.

## 7. Authority manifest and precedence

### 7.1 Required manifest shape

`AUTHORITY-MANIFEST.yml` is the machine-readable inventory, not a substitute for the documents. Each authority entry must include:

```yaml
schema_version: 2
authorities:
  - id: canonical_decisions_v2
    canonical_path: docs/authority/DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md
    title: DIVERGENCE.AI Canonical Decision Authority
    version: 2
    rank: 2
    status: active
    imported_from:
      path: __REQUIRED_VALUE__
      commit: __REQUIRED_VALUE__
      sha256: __REQUIRED_VALUE__
    content_sha256: __REQUIRED_VALUE__
    scope: product_decisions
    editable: false
    supersedes: []
    superseded_by: null
    required_before_editing: true
    replacement_protocol: authority_replacement_v1
denominators:
  permanent_ids:
    registry_path: docs/authority/PERMANENT-ID-REGISTRY.txt
    source_paths: []
    source_sha256: []
    extraction_method: scripts/governance/derive-registries.mjs
    expected_claim: 218
    verified_count: null
```

Exact template markers such as `__REQUIRED_VALUE__` are allowed only in a versioned template allowlist. Installed active files must not retain them.

The manifest does not hash itself. Governance integrity is anchored to a protected governance commit/tag and a trusted CI copy, avoiding circular self-SHA requirements.

### 7.2 Authority precedence

Use this order within the affected scope:

1. a dated, scoped user correction recorded in `USER-CORRECTIONS.md`;
2. `DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md`;
3. `DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md`;
4. the repair queue and traceability packet;
5. the site contract and named upstream authority documents;
6. current implementation;
7. current automated tests;
8. live behavior or screenshots;
9. chat recollection or model inference.

Lower-ranked evidence may show a defect; it cannot silently override higher-ranked intent.

### 7.3 User-correction record

Each correction entry must include:

- date and exact user wording;
- scope and affected permanent/decision/repair IDs;
- source conversation reference if available;
- whether it resolves or creates a conflict;
- authority version and hash it supersedes within that scope; and
- commit where it was applied.

An unambiguous correction may be acted on immediately in the current user-authorized session, but it must be written and committed before that session ends to govern future accounts. Do not ask the user to approve the same correction again unless its scope is ambiguous or it conflicts beyond what the user stated.

### 7.4 Authority replacement protocol

Replacing authority requires a governance-only commit containing:

1. the new user-correction entry;
2. a version bump or new authority artifact;
3. the previous path, version, and hash retained in history/manifest metadata;
4. manifest and change-record updates;
5. affected ledger rows reverted to `UNKNOWN — INSPECTION REQUIRED` until reverified; and
6. no app-behavior edits.

## 8. Explicit permissions

`PERMISSIONS.yml` defaults to deny. It records what the user has actually authorized, not what an AI considers useful.

```yaml
schema_version: 1
default: deny
grants:
  install_governance:
    allowed: false
    date: null
    user_attestation: null
  create_continuation_branch:
    allowed: false
    date: null
    user_attestation: null
  push_continuation_branch:
    allowed: false
    date: null
    user_attestation: null
  create_protected_tag:
    allowed: false
    date: null
    user_attestation: null
  open_pull_request:
    allowed: false
    date: null
    user_attestation: null
  merge:
    allowed: false
    date: null
    user_attestation: null
  deploy_preview:
    allowed: false
    date: null
    user_attestation: null
  deploy_production:
    allowed: false
    date: null
    user_attestation: null
  configure_repository_rules:
    allowed: false
    date: null
    user_attestation: null
  connect_paid_provider:
    allowed: false
    date: null
    user_attestation: null
  read_or_rotate_secrets:
    allowed: false
    date: null
    user_attestation: null
```

The installer may add narrower constraints such as permitted branch and environment. Absence, invalid format, expired grant, or `allowed: false` means deny. A plan, code-owner entry, available credential, or prior model statement is not authorization.

## 9. Protected paths, secrets, and governance integrity

### 9.1 Two baselines

- **Source baseline:** the verified source checkpoint for protected files that existed before governance installation.
- **Governance baseline:** the governance-only checkpoint anchored by a protected ref such as `divergence-governance-v2`.

`PROTECTED-PATHS.yml` records exact tracked paths or narrow globs, the reason for protection, baseline type, and baseline hash for nonsecret files.

### 9.2 Protected-path discovery

Discover from tracked files only (`git ls-files`) plus authority-defined categories. Explicitly assess:

- authority and user-correction files;
- governance scripts, CI, permissions, registries, and manifests;
- frozen visual assets and overlay/install machinery;
- deployment configuration;
- authentication, billing, ledger, and migration code;
- golden fixtures and authority-asserting tests; and
- verified checkpoint metadata.

Do not use a broad content scan that could read secrets.

Secret patterns are recorded only as patterns with:

```yaml
hash: NOT_RECORDED_SECRET
```

The gate verifies that secret files are untracked and appropriate ignore rules exist. It never prints, stores, uploads, or hashes secret values.

### 9.3 Authorized exceptions

An exception record must include the exact path, reason, date, user attestation, affected IDs, and old/new hash for nonsecret files. It is committed in an authority-only governance change before or separately from the protected edit.

### 9.4 Protect the judge from the work it judges

After governance installation and independent audit:

- anchor the governance baseline to a protected tag/ref when authorized;
- protect governance scripts, manifest, registries, permissions, source checkpoint, CI workflow, CODEOWNERS, protected-path definitions, and imported authority;
- have CI run trusted validation logic from the protected ref/base against the proposed working tree; and
- require the trusted check through repository rules where the hosting platform permits it.

If server-side protection is unavailable, record `SERVER PROTECTION UNAVAILABLE — <reason>` and retain procedural checks. Do not pretend `CODEOWNERS` alone creates independent review when one human owns the repository. Credentials can be repository-scoped and lack administration rights, but branch-write restrictions are enforced by repository rules—not by claiming a token is inherently branch-scoped.

## 10. Horizontal layers and machine-readable definitions

`HORIZONTAL-LAYER-COMPLETION-SYSTEM.md` remains the narrative authority. `LAYER-DEFINITIONS.yml` codifies its mechanically enforceable parts without changing its meaning:

| Layer | Name | Site-wide depth |
|---|---|---|
| L1 | `REACHABLE` | Screens, routes, links, labels, and visible destinations exist and are reachable. |
| L2 | `INTERACTIVE` | Controls react, expose correct states, and meet layer-level keyboard/accessibility behavior. |
| L3 | `LOCALLY USEFUL` | Features perform approved basic local functions without pretending external systems are connected. |
| L4 | `DURABLE` | Data saves, reloads, resumes, migrates, and recovers across the app. |
| L5 | `MONEY-SAFE` | Accounts, allowances, costs, billing, and ledgers are safe under sandbox/concurrency/idempotency proof. |
| L6 | `CONNECTED` | Approved providers and external services operate through real adapters with honest credential blockers. |
| L7 | `PRODUCTION-VERIFIED` | Matching deployed code passes full, security, accessibility, recovery, migration, and live-flow gates. |

For each layer, the YAML must enumerate:

- entry and exit gates;
- applicable ID rules;
- the exact allowed `N/A AT THIS DEPTH` IDs/clauses;
- required evidence types per applicable row;
- allowable blocker classes; and
- the user’s simple whole-site verification walkthrough.

A completed layer cannot contain `UNKNOWN`, `IMPLEMENTED — NOT FULLY PROVEN`, `PARTIAL`, `NOT STARTED`, `CONFLICT`, `BLOCKED`, or any other nonterminal status among applicable IDs. Only `PROVEN` or an exact allowlisted `N/A AT THIS DEPTH — <clause>` closes a row. An allowed `N/A` remains visible in totals.

The old standalone `FIX ALL` trigger is superseded. Under this governance, `FIX ALL` means only: execute the next declared coherent batch of the current horizontal layer after preflight and permission gates pass. It never means process all 39 repair groups sequentially or bypass the layer ledger.

## 11. Ledger and evidence model

### 11.1 Coverage ledger

`LAYER-COVERAGE-LEDGER.csv` is an RFC 4180 status index. It has one row per permanent ID and one status column per layer, plus traceability fields. It does not carry multiline proof narratives.

Minimum fields:

```text
permanent_id,authority_citation,repair_ids,decision_ids,workflow_ids,test_ids,L1,L2,L3,L4,L5,L6,L7,last_verified_commit
```

Every registered repair ID maps to at least one permanent ID, and every repair reference in the ledger exists in the repair registry. The same bidirectional validation applies where the authority defines workflow, decision, and test mappings.

### 11.2 Evidence index

`LAYER-EVIDENCE-INDEX.jsonl` contains one record keyed by `(permanent_id, layer)`. `EVIDENCE-RECORD-SCHEMA.json` requires at least:

```json
{
  "permanent_id": "__REQUIRED_VALUE__",
  "layer": "L1",
  "authority_citations": [],
  "implementation_paths": [],
  "test_results": [],
  "manual_or_live_results": [],
  "artifact_paths": [],
  "artifact_sha256": [],
  "implementation_commit": "__REQUIRED_VALUE__",
  "evidence_commit": "__REQUIRED_VALUE__",
  "deployment_identity": null,
  "actual_result": "__REQUIRED_VALUE__",
  "auditor_result": "__REQUIRED_VALUE__"
}
```

Active files may not retain the template markers. `PROVEN` requires a complete, schema-valid, layer-appropriate evidence record whose commits are ancestors of the current head and whose relevant implementation/test paths have not changed since verification.

If relevant paths change after `evidence_commit`, the record becomes stale. The cell falls to `IMPLEMENTED — NOT FULLY PROVEN` when implementation still appears conforming, or `UNKNOWN — INSPECTION REQUIRED` when conformance can no longer be established.

### 11.3 Layer-appropriate proof

- **L1:** route/shell checks and visual evidence where appearance/destination is part of the requirement.
- **L2:** control-state, keyboard, focus, feedback, and accessibility behavior.
- **L3:** real local/manual end-to-end behavior with no fake provider success.
- **L4:** persistence, reload, resume, migration, and recovery proof.
- **L5:** sandbox payment/cost evidence, concurrency, atomicity, replay, and idempotency.
- **L6:** real adapter/provider evidence or an exact credential-dependent blocker; mocks cannot prove connected behavior.
- **L7:** matching deployment identity plus full regression, security, accessibility, recovery, migration, and representative live flows.

Scripts may validate file presence, schema, hashes, ancestry, mappings, and declared results. They cannot establish that a screenshot, manual observation, provider response, or behavioral claim is truthful and adequate. That judgment belongs to tests, live/manual checks, and an independent auditor.

## 12. Baseline audit and initial credit

`BASELINE-AUDIT-PROCEDURE.md` must require:

1. repository/remote/source identity verification;
2. the branch-divergence comparison in Section 5;
3. the selected source’s full baseline suite;
4. focused inspection/tests for unmerged candidate work;
5. exact authority and registry derivation;
6. ID-by-ID implementation/evidence classification;
7. deployment-identity checks for any live claim;
8. explicit left-behind work; and
9. independent review of any initially credited `PROVEN` row.

`BASELINE-STATE-AUDIT.md` is the sole initial-credit event. Phase F consumes that audit; later agents do not promote rows based on chat claims, code appearance, or old summaries.

## 13. One coherent batch

Before any app edit, `CURRENT-LAYER-STATUS.md` must define one batch tuple:

```yaml
active_layer: L1
subsystem: __REQUIRED_VALUE__
permanent_ids: []
allowed_paths: []
required_tests: []
entry_head: __REQUIRED_VALUE__
start_remote_head: __REQUIRED_VALUE__
exact_next_action: __REQUIRED_VALUE__
```

The batch is valid only when:

- all IDs are registered and applicable to the active layer;
- all expected implementation files fit the allowed paths;
- changed files are a subset of allowed paths plus named ledger/evidence/handoff files;
- tests are named before the edit;
- the entry and remote heads are full SHAs; and
- there is no second active batch.

Before commit or push, fetch and compare the continuation branch with `start_remote_head`. If it moved, stop and reconcile; do not overwrite another account’s work. A local untracked lock under `.git` or an ignored runtime directory may prevent concurrent local sessions, but no tracked `.work-lock` is used as authority.

## 14. Routing and context-free startup

### 14.1 Routers

`AGENTS.md` and `CLAUDE.md` are concise mandatory routers. They point to the same `START-HERE-DIVERGENCE.md`, forbid edits before preflight, and must not duplicate product decisions.

Router files guide compatible agents; they do not enforce generic agents. The actual enforcement is the repository’s branch rules and trusted CI.

### 14.2 Generic startup prompt

Give any AI this exact instruction:

> Open this repository in read-only mode. Read `START-HERE-DIVERGENCE.md`, then follow its mandatory read order. Run the governance preflight without changing files. Return its Resume Certificate verbatim and explain any failing gate. Do not edit, branch, commit, push, deploy, access secrets, or infer permission unless `PERMISSIONS.yml` explicitly allows the exact action and all required gates pass.

### 14.3 Read-only definition

Read-only permits repository/file inspection and commands that do not change the worktree, index, refs, remote, repository settings, deployments, provider state, or external data. It forbids worktree writes, Git writes, network writes, secret access, branch creation, commits, pushes, API mutations, and deployments.

## 15. Generated Resume Certificate

`preflight.mjs` generates the certificate to stdout and may also write it under an ignored `.governance-runtime/` directory. It is not committed and contains no self-referential tracked timestamp or HEAD claim.

Required output:

```text
RESUME CERTIFICATE
Repository: <owner/repo>
Remote: <canonical URL>
Branch: <branch>
Runtime HEAD: <40-character SHA>
Verified source checkpoint: <40-character SHA>
Governance baseline ref/SHA: <ref and SHA>
Last completed layer: <layer or NONE>
Active layer: <one layer or NONE>
Active batch: <subsystem + exact IDs or NONE>
Exact next action: <one bounded action>
Effective permissions: <allowed capabilities>
Protected paths: UNCHANGED | CHANGED
Structural preflight: PASS | FAIL
Blocking findings: <exact list or NONE>
```

Tracked status files use `verified_through_commit` to identify the evidence target. Runtime preflight checks ancestry and path staleness. No tracked file is required to contain the SHA of the commit that contains itself.

## 16. Preflight contract

`preflight.mjs` is deterministic and non-mutating by default. It verifies:

- exact repository and canonical remote;
- current branch and full runtime HEAD;
- source checkpoint existence and ancestry;
- effective permissions for the proposed phase/action;
- governance files against the protected governance baseline;
- exact derived registry sets and manifest metadata;
- closed status vocabulary;
- `N/A` allowlist membership and clause citations;
- RFC 4180 CSV validity;
- evidence JSONL schema, uniqueness, mappings, hashes, ancestry, and staleness;
- protected paths against the correct source/governance baseline;
- one active layer, one active batch, and one exact next action;
- changed-file subset against batch paths;
- continuation remote-head lease;
- absence of active template markers outside the allowlist; and
- presence of an exact deployment identity for live claims.

Preflight reads registry counts and sets; it does not hardcode 218, 39, 7, 48, or 266. It exits nonzero on structural failure and prints the generated certificate. A preflight `PASS` means the structure is internally valid—not that product behavior is true.

## 17. CI and repository enforcement

`divergence-governance.yml` runs on pushes to the continuation branch and pull requests into protected targets. It should not consume resources on unrelated branches unless repository policy requires it.

The required CI check:

1. obtains trusted validator code from the protected governance ref/base;
2. validates the proposed branch tree rather than trusting modified validators within it;
3. runs preflight, registry, ledger, protected-path, evidence, and batch-scope checks;
4. runs the focused tests declared for the batch;
5. rejects unsupported status promotion and weakened authority tests; and
6. publishes a process `PASS` or `FAIL` without rewriting evidence.

Repository rules should prevent force-push/deletion of protected branches and governance refs and require the trusted status check where supported. An independent reviewer writes `AUDIT-RESULTS/<date>.md`; no planted defects or deliberate sabotage are used to test the auditor.

## 18. Deployment identity

Every deployed build exposes:

```text
/.well-known/divergence-build.json
```

with at least:

```json
{
  "commit_sha": "<40-character SHA>",
  "branch": "<branch>",
  "build_timestamp": "<ISO-8601>",
  "environment": "<preview|production>",
  "visual_overlay_sha256": "<hash or NOT_APPLICABLE>"
}
```

An optional HTML meta tag may mirror the commit. Live evidence fetches this endpoint and matches the exact claimed commit and environment. If an install/build overlay can replace source assets, its version/hash is also recorded in `VISUAL-AUTHORITY-MANIFEST.yml`. This plan does not authorize or perform a deployment.

## 19. Stopping checkpoint and recovery

### 19.1 Normal cutoff order

When usage is nearing its limit:

1. stop starting new work;
2. isolate and enumerate the current batch diff;
3. run the smallest meaningful focused proof;
4. update `CURRENT-LAYER-STATUS.md`, ledger, evidence index, change record, and handoff;
5. if code and evidence/status form one coherent safe checkpoint, commit them together;
6. otherwise commit only honest governance status when safe and preserve the patch as `UNSAFE UNCOMMITTED` with a recovery location;
7. run `stopping-checkpoint.mjs` after the commit;
8. push only if explicitly permitted and the remote-head lease still matches; and
9. stop.

Never commit code first and leave its status/evidence for a later account.

### 19.2 Script contract

`stopping-checkpoint.mjs`:

- is idempotent;
- exits `0` only for a structurally safe resumable checkpoint;
- exits `2` for a fatal/incomplete checkpoint;
- prints a runtime certificate and exact checkpoint summary;
- verifies the governed worktree is clean after the intended commit;
- verifies remote lease/push state when that information is available; and
- writes no tracked timestamp-only noise.

### 19.3 Stale or interrupted recovery

If cutoff occurs before a safe checkpoint, the next session reports:

```text
STALE-CHECKPOINT — RECOVERY REQUIRED
```

`RECOVERY.md` permits one governance-only recovery action:

1. derive actual HEAD and remote divergence;
2. enumerate all uncommitted and committed changes since the last safe certificate;
3. mark their safety/evidence status honestly;
4. set one exact next recovery action; and
5. commit governance-only recovery metadata if permitted.

Recovery may not modify app behavior or promote a ledger cell.

## 20. Installation sequence

No app code changes occur in Phases A–E.

### Phase A — Read-only discovery

1. Verify whether a dated `install_governance` permission exists.
2. Verify repository/remote identity.
3. locate and hash every authority source;
4. derive all five registries and compare exact sets with expected claims;
5. compare all plausible source branches and preserved dirty work;
6. run the baseline procedure on the chosen candidate;
7. resolve canonical versus legacy paths; and
8. write findings without inventing resolutions.

If permission to install is absent, Phase A stops after producing a read-only proposed discovery report outside the repository.

### Phase B — Create isolated continuation branch

Only with `create_continuation_branch: allowed`:

1. confirm a clean source worktree and full source SHA;
2. run the branch-collision check;
3. create `horizontal-layer-completion-v1` from the verified source; and
4. record the source checkpoint.

### Phase C — Install governance only

Only with `install_governance: allowed`, install the control tree, import authority with source path/commit/hash, reconcile router paths, generate registries, initialize the ledger/evidence/status files, and add deployment-identity code/config only if separately within the authorized governance scope. Existing router docs may be updated; app behavior may not.

### Phase D — Protect and validate governance

With the necessary grants:

1. run all structural validators;
2. create the governance-only checkpoint;
3. anchor it to the protected governance ref;
4. configure trusted CI and repository rules; and
5. rerun the checks from a fresh clone/worktree.

Record any unavailable server protection honestly.

### Phase E — Independent audit

The auditor works read-only against the exact governance checkpoint, follows a fixed checklist, and writes a dated audit result. The auditor does not share authorship credit with the implementer and does not modify files during the audit.

### Phase F — Begin L1 only after governance audit `PASS`

Use the baseline audit as the only initial status credit, define one coherent L1 batch, and begin implementation only under a separately authorized app-change instruction.

## 21. Installation completion gate

Governance installation is complete only when all of these are true:

- repository, remote, branch, source SHA, and governance baseline are exact;
- source selection includes documented branch-divergence and dirty-work analysis;
- branch collision is resolved without overwrite or invented suffix;
- all imported authority files have source path/commit/hash provenance;
- exact ID registries are mechanically derived and mutually reconciled;
- expected count mismatches are explicit conflicts, not hidden;
- one closed product-status vocabulary is enforced;
- all `N/A` values cite layer allowlist clauses;
- permissions default to deny and reflect dated user grants;
- authority/user-correction replacement has a versioned protocol;
- protected paths use defined source/governance baselines;
- secret values are neither read into governance nor hashed;
- governance validators are checked from a protected baseline;
- server-enforcement limitations are recorded honestly;
- layer definitions and evidence requirements are machine-readable;
- the CSV is only a status index and the JSONL evidence records validate;
- structural validation is explicitly distinguished from evidentiary adequacy;
- the baseline audit is the sole initial-credit event;
- one-batch scope and remote-head lease are enforced;
- the Resume Certificate is generated rather than self-reported;
- tracked files contain no impossible self-HEAD requirement;
- deployment identity can prove exact live commit/environment;
- cutoff and stale-checkpoint recovery are executable and idempotent;
- router docs, generic startup prompt, CI, and repository rules agree;
- a fresh context-free AI can return the correct certificate without chat history; and
- the independent governance audit returns process `PASS`.

## 22. Independent audit brief

### Goal

Determine whether an AI with no prior conversation can safely resume DIVERGENCE.AI from the exact verified state without guessing authority, scope, permission, source, evidence, or next action.

### Purpose

Prevent cross-account handoff from causing silent scope drift, lost work, false completion, authority damage, unverified deployment claims, or unsafe continuation.

### Required audit questions

1. Can the AI identify the exact repository, remote, branch, source SHA, and runtime HEAD?
2. Was source selection compared against every plausible work-bearing branch and dirty patch?
3. Are all governed IDs mechanically derived from versioned sources and compared as exact sets?
4. Is there one closed ledger vocabulary, with `PASS/FAIL` confined to gates?
5. Can `N/A` or `UNKNOWN` be abused to complete a layer?
6. Are permissions explicit, dated, capability-specific, and default-deny?
7. Can the working branch weaken the validator or baseline that judges it?
8. Are secret values excluded from manifests, hashes, and logs?
9. Are layer evidence records complete, current, and appropriate to the claimed depth?
10. Does automation validate structure without pretending to prove behavioral truth?
11. Is initial status credit confined to the baseline audit?
12. Is exactly one coherent batch active, with changed files constrained to its paths?
13. Can two accounts detect remote-head movement before overwrite?
14. Does the generated Resume Certificate match repository truth?
15. Can an interruption be recovered without app edits or false promotion?
16. Can a live claim be tied to an exact deployed commit and overlay?
17. Are authority corrections durable and replacements auditable?
18. Can a generic AI be stopped by CI/rules even if it ignores router prose?
19. Does the system preserve the last completed horizontal layer during partial work?
20. Does any unresolved blocking defect remain?

One blocking defect means the governance audit result is `FAIL`. No defect is intentionally planted to test the auditor.

## 23. Current verdict

The corrected strategy is:

> Verify the complete source history first; create one authorized isolated branch in the existing repository; install self-protecting, permission-aware governance; derive exact scope from authority registries; track every permanent ID across seven site-wide depth layers; separate structural validation from behavioral proof; and leave a generated, recoverable checkpoint after every coherent batch.

This design adds a small governance cost once. It reduces repeated reconstruction, prevents uneven feature islands, and makes a usage cutoff survivable without pretending unfinished work is complete.

## 24. Official mechanism references

- OpenAI repository instruction files: [AGENTS.md](https://developers.openai.com/codex/guides/agents-md/)
- GitHub protected branches: [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- GitHub rulesets: [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
