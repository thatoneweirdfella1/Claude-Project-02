# G1-E Standalone Independent Audit Assignment

## Assignment identity

- **Task ID:** G1-E
- **Title:** Independent audit of G1 Continuity, Acceptance, and Contamination Controls
- **Repository:** `thatoneweirdfella1/Claude-Project-02`
- **Exact audited checkpoint:** `983baaa2315db32e2cc772edc2bcad053e4e3d69`
- **Only existing working branch:** `divergence/reliability-staging`
- **Protected accepted branch:** `divergence/reliability-v1`
- **Untouched safety/layout branch:** `claude/remaining-second-pass-v1`
- **G1 author identity:** `openai-codex-gpt5-session-2026-09-08`
- **Required reviewer:** A different AI/account that did not author or correct the audited G1 checkpoint
- **Current authored status:** G1-A through G1-D Self-check passed; G1-E Open; G1 not independently verified or accepted

## Purpose and required outcome

Determine whether a context-free AI can use the repository alone to resume the correct unfinished work, reject unsafe or dependent work, preserve scope and history, distinguish self-check from independent verification and acceptance, propagate upstream failure to descendants, recover from interruption, and tell the user one exact next action without requiring the user to remember the process.

The audit must challenge the controls. It must not accept author statements or passing summaries as proof.

## Scope

Audit the complete G1 control package present at the exact checkpoint, including:

- AI entry instructions;
- project/task authority and mandatory read order;
- machine control state and course policy;
- task, checkpoint, dependency, audit, acceptance, and contamination logic;
- simple and audit status views;
- G1 traceability;
- continuity, decision, evidence, gate, parking-lot, and handoff records;
- validator, status command, workflow, ruleset requirements, and focused tests; and
- retained G0 behavior affected by the upgrade.

## Exclusions

- Do not audit or redesign the product, interface, layout, master reliability architecture, F0 substance, S02/S03/S18/S20 substance, or application behavior.
- Do not perform F0-AUDIT, F1, product-system design, implementation, deployment, or branch cleanup.
- Do not create, rename, delete, merge, rebase, or force-update any branch.
- Do not write to the safety/layout branch or protected integration branch.
- Do not change a test, validator, policy, or requirement merely to make the audit pass.
- Do not claim user/product approval, acceptance, implementation, release, or production validation.

## Authority and precedence

1. Latest explicit user instruction for the exact issue.
2. Accepted decisions in `docs/ai-control/DECISION-LOG.md`.
3. This exact standalone assignment and accepted G1 prerequisites.
4. `docs/ai-control/CURRENT-TASK.md` and `CONTROL-STATE.json`.
5. G1 control contracts under `docs/reliability/control/`.
6. The canonical master blueprint only for a definition explicitly unresolved by this packet.
7. Prior AI suggestions or inference.

Conflicts remain Open and block only affected work. Do not select a convenient interpretation.

## G1 outcome definitions

| ID | Outcome that must survive audit |
|---|---|
| G1-O01 | Existing valid authority material is retained; only verified control-package gaps are filled. |
| G1-O02 | A replacement AI resumes the same unfinished task from a confirmed remote checkpoint. |
| G1-O03 | Active, interrupted, self-check, audit, independently verified, accepted, failed, Open, and contaminated states remain distinct. |
| G1-O04 | Unfinished, unaudited, failed, blocking-Open, or contaminated prerequisites fail closed. |
| G1-O05 | A context-free AI receives a short truthful block/safe-switch notice and one exact next action. |
| G1-O06 | Staging remains untrusted; integration is the protected accepted baseline. |
| G1-O07 | Deterministic task, branch, scope, record, dependency, traceability, evidence, authority, and drift controls are executable. |
| G1-O08 | An author cannot independently verify or accept its own load-bearing result. |
| G1-O09 | Invalidated upstream work propagates potential contamination to every relying descendant until resolved. |
| G1-O10 | Recovery identifies a last verified baseline without destructive or unauthorized operations. |
| G1-O11 | Required hostile tests pass without weakening the retained G0 controls. |
| G1-O12 | External automatic AI review remains optional, provider-neutral, and non-authoritative. |

Every outcome must retain its owner, design location, acceptance test, evidence requirement, and gate in `G1-TRACEABILITY.json`.

## Dependency definitions

- **Design prerequisite:** an accepted upstream design must exist before dependent design begins.
- **Co-design dependency:** designs may iterate together, but named shared seams require reconciliation before acceptance.
- **Runtime input:** information or service required during operation; it does not establish design order unless separately declared.
- **Validation dependency:** evidence, evaluator, environment, or verified result required before a claim may pass its gate.

The retired phrase `hard dependency` is invalid.

## State and evidence semantics

- **Open:** defined but not authorized, ready, or proven.
- **Active:** the one authorized task is being worked.
- **Interrupted — resumable:** the same task can continue from a coherent confirmed remote checkpoint.
- **Interrupted — unsafe:** recovery is the only permitted action.
- **Self-check passed:** author checks passed; no independent claim.
- **Awaiting independent audit:** author work is frozen for a different reviewer.
- **Independently verified:** separate evidence supports the scoped claim.
- **Accepted:** a distinct protected transition makes the result usable by dependents.
- **Failed:** a named gate or audit failed.
- **Potentially contaminated:** work relied on an invalidated or unaccepted upstream result.

Permitted gate statuses are only `Self-check passed`, `Independently verified`, `Failed`, and `Open`. Tests, commits, deployments, author statements, and green builds are evidence inputs; none independently creates acceptance.

## Required starting procedure

1. Check out the exact remote checkpoint `983baaa2315db32e2cc772edc2bcad053e4e3d69` in read-only mode first.
2. Confirm repository, branch, full SHA, clean worktree, and remote identity.
3. Read `AGENTS.md`, then completely follow `docs/ai-control/00-READ-FIRST.md` in its mandatory order.
4. Verify every entry in `docs/ai-control/SHA256SUMS` before mutation.
5. Run `node scripts/ai-control-status.mjs` and retain its exact output.
6. Record reviewer identity and explicitly confirm it differs from the G1 author identity.
7. Do not change files before completing the read-only audit and deciding the verdict.

## Required structural inspection

Verify:

- one current task and no competing active task;
- exact repository and three branch roles;
- no branch-creation permission;
- complete mandatory read sequence;
- agreement among policy, machine state, current task, gate status, evidence, and handoff;
- exact G1 outcome traceability with no missing required field;
- complete standalone-assignment contract;
- meaning-confirmation record and ambiguity behavior;
- typed dependency edges and satisfiable sequence;
- reviewer/author separation and matching audit metadata;
- acceptance remains distinct from independent verification;
- multi-level lineage and contamination behavior;
- safe/unsafe checkpoint semantics;
- required records and append-only history;
- integrity coverage for every mandatory control artifact;
- no G1 change to product, F0, or visual baseline; and
- no provider-dependent safety control.

## Required hostile tests

Run the retained harness and independently attempt at least these cases:

1. Wrong repository.
2. Invented or unauthorized branch.
3. Safety-branch mutation.
4. Unauthorized application, F0, layout, or architecture path.
5. File deletion.
6. Visual-baseline mutation.
7. Append-only ledger rewrite.
8. Missing task, state, continuity, evidence, handoff, or hash record.
9. Invalid integrity hash.
10. Invalid gate status.
11. Self-declared independent verification.
12. Same author/reviewer identity.
13. Missing, forged, stale, or mismatched review record.
14. Locked, unknown, or invented task activation.
15. Multiple active tasks.
16. Missing or ambiguous meaning confirmation.
17. Invalid dependency type.
18. Dependent task requested while its prerequisite is Open.
19. Repeat case 18 for Active, Self-check passed, Awaiting independent audit, Failed, and Potentially contaminated.
20. Transition away from unfinished current work.
21. Attempt to use staging work as accepted.
22. Attempt to modify integration with unaccepted work.
23. Acceptance without a matching independent result and integration commit.
24. Upstream failure with child and grandchild descendants.
25. Attempt to accept contaminated work.
26. Stale or contradictory simple status versus machine state.
27. Missing traceability field or design location.
28. Safe resumable interruption continues the same task.
29. Unsafe interruption attempts normal work instead of recovery.
30. All external AI/webhook/provider automation unavailable.
31. Attempt to weaken the validator/test/policy while using the weakened result as its own proof.

For every attempted violation, retain the command/fixture, actual result, and whether the response identifies the blocker and one exact permitted next action.

## Required complete checks

- `node --test scripts/ai-course-control.test.mjs`
- integrity verification using `docs/ai-control/SHA256SUMS`
- JSON parsing and policy/state/task/traceability alignment
- `git diff --check` for any audit-record checkpoint
- exact base/head/branch/repository course-control gate before publication
- applicable repository tests needed to detect regression of retained behavior
- GitHub remote readback after any allowed audit-record publication
- read-only confirmation of active branch rulesets and protected targets when connector access permits it

Do not convert a missing executable, credential, browser, connector, workflow run, or environment into a pass. Record it as Open or Failed according to its actual blocking effect.

## Gate verdicts

| Gate | Audit question |
|---|---|
| G1-G01 | Is the authority package complete, internally consistent, and non-duplicative? |
| G1-G02 | Can a context-free replacement resume the same task safely? |
| G1-G03 | Do audit, dependency, acceptance, and plain-language blockers fail closed? |
| G1-G04 | Does invalid upstream work contaminate and block every relying descendant with safe recovery? |
| G1-G05 | Do executable hostile tests enforce the claimed deterministic controls without weakening G0? |
| G1-G06 | Did this genuinely independent cold-start audit pass against the exact checkpoint? |

One load-bearing failure prevents an independently verified overall verdict.

## Required audit deliverables

1. `docs/ai-control/independent-reviews/G1-G06.json`
2. A dated human-readable report under `docs/reliability/control/independent-reviews/`
3. Updated `CONTROL-STATE.json`, `CURRENT-TASK.md`, `GATE-STATUS.md`, `EVIDENCE-INDEX.md`, `HANDOFF.md`, `CONTINUITY-LEDGER.md`, and `SHA256SUMS`
4. Exact test/evidence outputs or stable artifact references
5. One exact next action

The JSON record must contain:

- `task_id`: `G1`
- `audit_phase`: `G1-E`
- `audited_commit`: `983baaa2315db32e2cc772edc2bcad053e4e3d69`
- `author_id`: `openai-codex-gpt5-session-2026-09-08`
- `reviewer_id`: stable identity different from the author
- `independent_from_author`: `true`
- timestamp
- reviewed paths and source hashes
- executed checks with actual results
- retained hostile cases and actual results
- findings with severity, affected outcome/gate, evidence, and correction
- unresolved limitations
- `verdict`: exactly `Independently verified` or `Failed`
- report path and SHA-256

## Failure conditions

The audit fails if any load-bearing control is missing, contradictory, bypassable under the tested repository role, dependent on chat memory, dependent on optional external automation, self-certified, stale, unable to propagate contamination, unable to recover safely, or unable to name the correct blocker and next action. It also fails if the audit cannot prove its own reviewer separation or exact audited checkpoint.

## Verdict and correction rules

### If the audit passes

- Write the matching JSON and report.
- Set G1-G06 to `Independently verified` and preserve the author-only status of G1-G01–G1-G05 unless the audit explicitly and validly verifies each.
- Set the G1 execution state to `Independently verified`, reviewer identity, and exact review path.
- Keep `acceptance_state` as `Not accepted` and `accepted_integration_commit` null until the separate protected acceptance transition actually occurs.
- Publish only the bounded audit records to existing staging after the exact course gate passes.
- Report that F0-AUDIT remains blocked until G1 acceptance if that is the machine state.

### If the audit fails

- Preserve every finding and failed result.
- Set G1/G1-G06 to `Failed` or the precise gate statuses supported by evidence.
- Keep all dependents blocked.
- Name one bounded correction task.
- Do not silently correct G1 and independently certify the correction in the same reviewer role. A correcting AI becomes an author; another independent audit is then required.

## Allowed paths for the audit record

- `docs/ai-control/**`
- `docs/reliability/control/independent-reviews/**`
- This standalone packet only for an identified clerical defect that does not change the audit target or criteria

Any validator, test, policy, constitution, architecture, product, F0, or application correction is a separate authored correction checkpoint and invalidates a same-reviewer independent-pass claim.

## Exact stop condition

Stop after the independent result is recorded, gated, published to existing staging, and read back. Do not merge, accept G1, begin F0-AUDIT, or begin system work unless the repository separately records and mechanically authorizes that exact transition.

Report only:

> **Current:** `G1-E — Independent G1 control-package audit` | **Status:** `<Independently verified or Failed>` | **Proof:** `<short actual result>` | **Next:** `<one exact action>` | **Safe to switch:** `<YES or NO>` | **Confirmed remote checkpoint:** `<full SHA>`
