# CLAUDE REMAINING SITE REPAIR — BINDING WORK ORDER

Status: ACTIVE AND BINDING
Repository: `thatoneweirdfella1/Claude-Project-02`
Only writable branch: `claude/whole-site-repair-v1`
Starting checkpoint: `e1a4b0cb97572ed023c281efe909f2bd41b880ca`

## Mission

Make the remaining user-visible and runtime features actually work. Do not produce another plan in place of implementation. Inspect current source and reproduce each claimed defect before editing. If a row is already repaired, verify it and record the evidence instead of rewriting it.

Never modify, merge into, rebase, force-push, or deploy from any `codex-verified/*`, `build`, frozen, archive, backup, or other account branch. All candidate work stays isolated here until independent adoption.

## Already completed — do not rebuild

The six contained repairs are recorded in `docs/checkpoints/EASY-REPAIRS-2026-08-27.md`: Send control, active Talk-to-AI wording, Saved Tools naming, complete template loading, top-bar panel dismissal, and All Tools routing.

## Execution rules

1. Read this file, `CLAUDE.md`, `AGENTS.md`, `START-HERE-DIVERGENCE.md`, `docs/layer-system/PERMISSIONS.yml`, and `docs/layer-system/BATCH-SCOPE.json`.
2. Run repository preflight and baseline tests before application edits. Record failures that already exist.
3. Work in the dependency groups below, in order. Do not create a branch per defect.
4. Before each edit, trace the complete user flow and identify source, state/store, service/API boundary, persistence, visible result, and existing tests.
5. Use settled repository authority for product behavior. Do not invent a replacement product design.
6. Make the smallest complete vertical repair. UI-only patches do not complete stateful workflows.
7. Add focused regression tests that prove visible behavior and failure behavior.
8. After each group, run focused tests, affected regression tests, and `npm run build`. Commit the coherent group once.
9. Write `docs/checkpoints/CLAUDE-REPAIR-GROUP-<N>.md` containing full commit SHA, changed files, tests, build result, evidence, unresolved rows, and exact next row.
10. If one row is blocked, record the exact blocker and continue every unaffected row.
11. Never claim build success, provider success, deployment, persistence, cost accuracy, or live execution without direct evidence.
12. Never use credentials, spend money, call a paid/live AI provider, alter production, delete real user data, or configure payments/auth/secrets.
13. Preview deployment is allowed only if already authenticated and it cannot change production. Record exact preview SHA and URL.
14. Do not stop after giving a plan. Continue until every safe row below is fixed or evidence-blocked.

## Group 1 — Local input and creation flows

### R07 Create Template
The user must be able to create, validate, save, rediscover after reload, load, edit, and safely cancel a custom template. Verify existing form first.

### R08 Session Import Selector
Provide a visible supported-file chooser, preview, validation, explicit confirmation, actionable rejection, and no partial import after failure.

### R09 File Attachment
Accepted files must appear in Context Snapshot with name, type, size, provenance, inclusion state, and removal. Unsupported and oversized files need actionable rejection.

### R10 URL Context
Permitted public URLs must preview and enter context. Authentication failure, unsafe/private URL, unsupported page, timeout, and other failure categories must remain distinct and safe.

Group evidence: browser-visible success and failure states, reload proof where persistence applies, focused tests, affected suite, build, checkpoint.

## Group 2 — Execution truth, provider state, and cost foundations

### R11 Provider Status Refresh
Refresh exact provider/model/route state after connect, verify, disconnect, failed execution, and manual refresh. Stale state must never authorize a call.

### R12 Busy-State Cleanup
Debate, consensus, and synthesis must leave busy state after success, exception, or abort and show a recoverable result.

### R13 Safe Provider Error Categories
Normalize authentication, quota, timeout, unavailable model, refusal, outage, and unknown errors into safe category, retryability, and next action without exposing secrets or raw request/provider internals.

### R14 Unknown Model Pricing
Every executable model must have explicit versioned pricing or show cost unavailable. Never silently use another model's price.

### R15 Partner Usage Collection
Normalize provider, model, input/output tokens, estimate, actual usage, and final cost for every participant. Preserve unavailable fields honestly.

### R19 Prepared / Copied / Opened / Sent / Answered Truth
Persist separate states. Copying or opening can never become sent or answered. Include imported, cancelled, and failed states and migration/backward compatibility.

### R25 Connected Execution Truth
Remove hard-coded readiness. Derive readiness from exact provider, model, route, authentication, and verified health. Fail closed while retaining a manual alternative.

### R26 Provider Connection Lifecycle
Expose the approved connect, verify, refresh, revoked/invalid, and disconnect lifecycle with exact provider/model status and no silent charge or substitution. Do not create credentials or OAuth applications.

### R27 Multi-AI Cost Estimates
Estimate each participant using its actual selected provider/model, show per-side assumptions and total before authorization, then reconcile normalized actual usage.

### R28 Remove Placeholder Cost Logging
Remove literal fake costs, including `$0.01`. Store a labeled estimate before execution and reconcile afterward.

### R29 Honest Readiness and Workflow Wording
Define and apply one truthful vocabulary driven by state: local preparation, provider configured, verified, sending, answered, failed, cancelled, and manual handoff.

Group evidence: state/readiness transition tables, provider/model/pricing coverage matrices, forced-error and abort tests, persistence tests, affected suite, build, checkpoint. Simulations are not live-provider proof.

## Group 3 — Core conversation management

### R16 Messages Screen
Use approved requirements and existing stores to make the reachable Messages destination a real conversation manager. If the canonical navigation intentionally retired it, prove it is unreachable and remove remaining misleading entry points instead of building a competing screen.

### R17 Projects Workflow
The user must be able to create a project, assign/remove sessions, inspect contents, and reload without loss. Every instruction must name a real visible control.

### R18 Active Session Lifecycle
Expose a discoverable lifecycle preserving Keep Active, Save, Archive, Discard, Undo, confirmation, and persistence semantics.

Group evidence: end-to-end browser flows, state transitions, reload/navigation persistence, affected tests, build, checkpoint.

## Group 4 — Multi-AI unresolved-conversation workflow

### R20 Select Unresolved Conversation
Let the user select one message or a range, review the exact context bundle, and create a persisted handoff linked to stable source message IDs.

### R21 Persist Multi-AI Results
Persist participant results, partial failures, consensus, synthesis, attribution, status, and costs through reload/navigation and render them as a branch linked to the originating conversation.

### R23 Use Every Participant in Consensus
Two-, three-, and four-participant transcripts must include every successful participant exactly once in stable order with exact provider/model attribution.

### R22 Retry Only One Participant
Retrying one failed participant must make exactly one new authorized provider call and preserve every successful side.

### R24 Multi-AI Cancellation
Provide visible Cancel during debate, consensus, and synthesis; abort active calls, preserve completed sides, avoid fabricated charges, and persist truthful cancellation.

Group evidence: stable message/range identifiers, persisted handoff/results, instrumented call counts, two/three/four participant tests, partial-failure tests, cancel-at-each-phase tests, reload/navigation proof, affected suite, build, checkpoint.

## Group 5 — authorization-gated proof

### R30 Exact Preview and Production Gate
Prepare one exact candidate SHA, clean build, accessible preview when already authorized, browser smoke matrix, overlay-preservation check, and rollback target. Do not promote to production. Record the exact approval still needed.

### R31 Live Provider Proof Gate
Complete deterministic simulations and prepare a route-by-route live-test matrix listing credential required, maximum expected charge, expected evidence, failure handling, and exact approval required. Do not run paid/live calls.

Group evidence: final candidate SHA, build and preview identity when available, fixed/failed/blocked matrix, production and live-provider actions clearly left gated.

## Completion gate

Do not say this work is complete until:

- Every R07–R31 row is FIXED with evidence, VERIFIED ALREADY with evidence, or BLOCKED with exact missing authority/access.
- Every safe application change is committed only to this candidate branch.
- Every group checkpoint exists.
- Baseline-versus-final test results and final production build are recorded.
- A final `docs/checkpoints/CLAUDE-REPAIR-FINAL.md` lists commits, changed files, fixed rows, blocked rows, tests, build, preview identity if any, remaining authorization gates, and exact handoff for independent adoption.
- No merge and no production or live-provider action occurred.

At the end, return only a compact milestone summary and the exact candidate branch/head SHA.