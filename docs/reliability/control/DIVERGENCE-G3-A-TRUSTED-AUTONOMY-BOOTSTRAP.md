# DIVERGENCE G3-A — Trusted Autonomous Control Bootstrap

**Status:** Proposed bounded implementation authority; not implemented or independently verified.

## Required outcome

Create a candidate-independent control plane that can validate, audit, correct, resume, and advance DIVERGENCE work without routine user coordination. The user is interrupted only when a material product decision cannot be resolved from recorded authority.

## Non-negotiable exclusions

- No second GitHub account or recurring human approval.
- No new repository or AI-created branch.
- No changes to `claude/remaining-second-pass-v1`, application code, layout, F0, or product systems.
- No candidate-controlled validator, workflow, test, state field, reviewer label, or prompt may authorize its own checkpoint.
- No claim that design, implementation, testing, audit, acceptance, merge, deployment, or production validation occurred unless exact evidence exists.

## Trust boundary

The authoritative decision must be emitted by a narrowly permissioned GitHub App or equivalent external controller whose executable policy is not writable by the candidate branch. It binds every result to repository ID, target branch, base SHA, candidate SHA, policy version, actor identity, evidence digest, and timestamp.

The candidate repository supplies untrusted task data only. Claude hooks and repository-local tests improve behavior and evidence but never grant acceptance.

## Autonomous state machine

1. `Open` — dependency satisfied and task available.
2. `Leased` — one worker owns the exact task/base SHA for a bounded interval.
3. `In progress` — heartbeats and remote checkpoints are current.
4. `Self-check passed` — author evidence exists; audit automatically queued.
5. `Awaiting independent audit` — distinct authenticated audit worker assigned.
6. `Failed` — failure retained; bounded correction attempt automatically queued.
7. `Correction in progress` — correction linked to, but never overwriting, the failure.
8. `Independently verified` — exact corrected SHA passed trusted validation and independent audit.
9. `Accepted` — controller automatically accepts when all predeclared gates pass and no unresolved product decision exists.
10. `Blocked — user decision required` — used only for a material product choice absent from authority; presents one question and prevents affected work only.

No AI-written field may directly cause states 8 or 9. The controller derives them from authenticated events.

## Canonical records

The migration must preserve every historical decision, failure, audit, evidence reference, and supersession while reducing active state to:

1. `CONTROL-STATE.json` — sole current declarative task/dependency state; treated as untrusted controller input.
2. `CONTROL-HISTORY.jsonl` — append-only transition/evidence history mirrored by the controller.
3. `STATUS.md` — generated, normally readable projection containing current task, proof, blocker, exact next action, authoritative remote SHA, and safe-switch state.

The existing record set remains authoritative until lossless migration is independently verified. Nothing is deleted during G3-A.

## Automatic loop

1. Observe remote truth before reading local task state.
2. Reject stale/divergent checkout and automatically reacquire or requeue; never overwrite.
3. Lease exactly one dependency-ready task and its allowed paths.
4. Execute and checkpoint frequently to the existing staging branch.
5. On usage, context, API, or worker failure, record the interruption, expire the lease, and assign a replacement worker to the same unfinished task.
6. Run trusted deterministic validation against the exact candidate SHA.
7. Assign an audit to a principal distinct from the author/corrector.
8. On failure, preserve the verdict and create a bounded correction attempt with exact defects and acceptance tests.
9. Revalidate and re-audit the corrected SHA.
10. Automatically accept and unlock dependents only when all declared gates pass.
11. Ask the user one focused question only when a product decision is genuinely absent or contradictory; other tasks proven independent may continue.

## G3-A deliverables

1. Controller threat model and permission manifest.
2. Versioned state, history-event, lease, audit-attestation, correction, and status-check schemas.
3. Deterministic transition engine and conflict-resolution rules.
4. Exact-SHA trusted validation interface that never executes candidate policy as authority.
5. Independent-auditor assignment and identity-separation contract.
6. Durable queue, lease heartbeat, retry ceiling, recovery, and dead-letter behavior.
7. Automatic acceptance rule with no routine human step.
8. Product-decision escalation rule and one-question user interface contract.
9. Claude lifecycle-hook package for load, scope warning, checkpoint, stop, compact, and failure recovery, explicitly non-authoritative.
10. GitHub required-check/ruleset configuration specification with exact expected App source.
11. Lossless three-record migration plan; migration is not executed in G3-A.
12. Cold-start handoff packet and hostile test suite.

## Acceptance gates

- **G3A-01 External authority:** candidate changes to its validator, tests, workflow, policy, state, hashes, or reviewer strings cannot change the authoritative verdict.
- **G3A-02 Exact identity:** every verdict is bound to the host-derived repository, branch, base SHA, candidate SHA, policy release, and authenticated principal.
- **G3A-03 Autonomous audit:** author self-check automatically queues a distinct auditor without user action.
- **G3A-04 Autonomous correction:** failed audit automatically retains the failure, creates a correction attempt, assigns a worker, and requires re-audit.
- **G3A-05 Autonomous advancement:** verified work automatically becomes accepted and unlocks only satisfied dependents; no routine user approval exists.
- **G3A-06 Continuity:** simulated usage exhaustion, context loss, local-only commit, missing push, stale checkout, and concurrent worker all recover without losing or skipping the active task.
- **G3A-07 Scope and branch safety:** no new branch/repository, safety-branch write, unrelated file, premature PR, merge, deployment, or dependent task is permitted.
- **G3A-08 Honest evidence:** missing, stale, self-authored, contradictory, or differently sourced evidence cannot pass.
- **G3A-09 User interruption boundary:** mechanical, audit, correction, retry, routing, and GitHub decisions never reach the user; only unresolved material product choices do.
- **G3A-10 Cold start:** a context-free Claude or GPT identifies and safely performs the exact next action without the conversation or full blueprint.

All gates begin `Open`. Permitted gate results are `Self-check passed`, `Independently verified`, `Failed`, and `Open`.

## Failure conditions

G3-A fails if the candidate can influence the judge, author and auditor share the same authenticated principal, acceptance requires routine user action, a status check detects failure but cannot arrange continuation, a lost worker skips to the next task, a correction erases failure history, a stale SHA is accepted, or any test depends on an AI's completion claim.

## Implementation order

1. Freeze this contract and independently audit its fit to the two source audits and user constraints.
2. Build schemas and transition engine locally with hostile fixtures.
3. Build the external controller and durable queue in an isolated test environment.
4. Install the narrowly permissioned controller integration once.
5. Configure the exact-source required check once.
6. Run G3A-01 through G3A-10 against disposable test refs that do not alter the safety, staging, integration, or production branches.
7. Independently audit the complete controller release.
8. Activate it; only then migrate records and resume F0-related work.

## Exact next bounded task

Produce the G3-A controller contract package: threat model, permission manifest, six schemas, transition table, queue/lease protocol, audit identity protocol, automatic acceptance rule, escalation rule, interfaces, and hostile-test specification. Do not install, merge, deploy, migrate records, or modify product code in that task.
