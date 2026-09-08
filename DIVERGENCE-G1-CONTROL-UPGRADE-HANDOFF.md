# G1 Standalone Assignment — Continuity, Acceptance, and Contamination Controls

## Purpose

Finish the project-control layer required before the independent F0 audit or any S02/S03/S18/S20 work. Make cross-account continuation safe when an AI loses usage mid-task, prevent unaudited or direction-changing work from unlocking descendants, and make the repository tell the user and the next AI exactly what must happen without requiring the user to remember the workflow.

## Authority

The user explicitly authorized this bounded control upgrade after reviewing the complete pre-work list. This task supersedes only F0's active-task/next-task status. F0 remains completed by self-check, unmodified, and awaiting independent audit. All branch, layout, scope, design/implementation separation, evidence-honesty, and no-bypass decisions remain active.

## Required outcomes

1. Audit existing authority-package material and reuse it; fill only verified gaps in the readable system map, stable constitution, global traceability registry, standalone-assignment rules, meaning-confirmation protocol, creation/verification lifecycle, and simple/audit status views.
2. Add continuous, resumable checkpoints so a replacement AI continues the same unfinished task from the last pushed checkpoint rather than waiting for the original account or starting a dependent task.
3. Represent task states and transitions mechanically, including Draft/active, interrupted/resumable, awaiting independent audit, Self-check passed, Independently verified, Failed, Open, and accepted/promotion state without conflating them.
4. Make dependent work fail closed while a prerequisite is unfinished, unaudited, failed, blocking-Open, or contaminated.
5. Make a newly arriving AI report a short plain-language block notice naming the requested task, blocking task/audit, and exact permitted next action.
6. Treat staging as untrusted task work and integration as the protected accepted baseline. No work becomes an accepted dependency merely because it was committed or self-checked.
7. Enforce allowed task, branch, paths, record freshness, dependencies, traceability, evidence, tests, authority boundaries, and prohibited architecture/scope changes through executable validation wherever deterministically checkable.
8. Require separate review evidence before an author can promote its own load-bearing claim to independently verified or accepted.
9. Record dependency lineage. When an accepted upstream result is later failed or invalidated, block and mark affected descendants potentially contaminated until revalidated or returned to a verified baseline.
10. Preserve a recoverable last-verified baseline and record rollback/recovery instructions without performing an unauthorized merge, reset, deployment, or destructive operation.
11. Add adversarial tests covering unfinished-task continuation, audit-required blocking, dependent-task blocking, unauthorized task/path/architecture changes, missing or stale records/evidence/traceability, self-verification, contaminated descendants, and attempted accepted-baseline mutation.
12. Keep optional event-triggered AI review provider-neutral and non-authoritative. Repository blocking and notification must work if every external automation is unavailable.

## ADHD-facing behavior

- The user must not have to remember audits, dependencies, checkpoints, branch rules, or technical handoff details.
- Before consequential work, present one short interpretation of intended outcome and exclusion; ask at most one material question at a time.
- If blocked, show `SAFE TO SWITCH: YES` or `SAFE TO SWITCH: NO`, a plain-language reason, and one copyable next-AI instruction.
- Technical evidence remains in the audit view and repository records; ordinary user action text remains short.

## Checkpoint and takeover contract

- Divide G1 into small checkpoint phases and publish each accepted phase to the existing staging branch.
- After every meaningful edit group or decision, update the continuity ledger. At each pushed checkpoint, update current task, evidence, handoff, hashes, and machine state.
- An interruption never authorizes the following task. The next AI resumes the first unfinished G1 phase.
- A checkpoint is recoverable only when its remote commit is confirmed. If publication fails, report `SAFE TO SWITCH: NO` and identify the last confirmed remote checkpoint.

## Allowed paths

- `DIVERGENCE-G1-CONTROL-UPGRADE-HANDOFF.md`
- `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`
- `.github/workflows/ai-course-control.yml`, `.github/CODEOWNERS`
- `docs/ai-control/**`
- `docs/reliability/control/**`
- `scripts/ai-course-control.mjs`, `scripts/ai-course-control.test.mjs`
- New focused control-validator scripts/tests only when required by this assignment

## Prohibited work

- Do not modify the canonical blueprint, F0 contract, F0 follow-on briefs, application code, application tests, interface, layout, or visual baselines.
- Do not perform the independent F0 audit, design S02/S03/S18/S20, perform F1, implement a product system, merge, rebase, force-update, deploy, delete, or create a branch or repository.
- Do not claim semantic perfection, independent verification, user/product approval, implementation, or production validation.
- Do not make external AI automation a prerequisite for safe blocking or resumption.

## Checkpoint phases

1. **G1-A — Activation and exact standalone assignment.** Record authority, scope, baseline, controls, and first handoff.
2. **G1-B — Authority-package gap completion.** Reuse existing sources and create only missing canonical map/constitution/traceability/assignment/meaning/lifecycle/view records.
3. **G1-C — Executable checkpoint, transition, dependency, audit, and contamination enforcement.** Implement machine state and fail-closed validator behavior.
4. **G1-D — Adversarial verification and recovery proof.** Run focused hostile cases, existing controller tests, integrity, exact diff, and applicable repository checks.
5. **G1-E — Context-free independent audit.** A separate AI must test cold-start behavior and retained failure cases. The author may prepare the audit packet but cannot perform or declare this phase independently verified.

## Exit conditions

- G1-A through G1-D have retained evidence and accurate Self-check passed/Failed/Open states.
- Every required hostile test has an observed result.
- A replacement AI can identify and resume an interrupted checkpoint without conversation context.
- A requested locked task produces the plain-language blocker and permitted next action.
- No dependent task can be accepted from an unfinished, unaudited, failed, blocking-Open, or contaminated prerequisite.
- Independent G1 audit remains the only next task until a separate reviewer completes G1-E.

## Exact next task after author self-check

Independent G1 control-package audit. The independent F0 audit remains pinned behind successful G1 verification. No product-system design or implementation may begin.
