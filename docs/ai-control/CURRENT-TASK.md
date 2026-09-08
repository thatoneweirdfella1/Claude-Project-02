# Current Task — F0 Only

## Task identity

- **ID:** F0
- **Title:** Foundation Contract and Interface Skeleton
- **Phase:** Design
- **Status:** Self-check passed for F0 design scope; independent audit and user/product approval remain Open; stop condition reached
- **Task source:** `DIVERGENCE-F0-STANDALONE-HANDOFF.md`
- **Task-source SHA-256:** `5817361c8a5376e299e36d340c331ce2a7848d96c29513839ba8889d8ffbe887`
- **Canonical master blueprint:** `02-MASTER-SYSTEM-AND-REQUIREMENT-BLUEPRINT.md`, SHA-256 `d9783aa4fff475810170f2217ea2cdca1b30baefe78d21d837980943c509ea47`
- **Activation authority:** User reply `authorized`, received 2026-09-08 after the B0 handoff stated that F0 required separate explicit activation
- **Untouched safety/layout branch:** `claude/remaining-second-pass-v1`
- **Only task-writing branch:** `divergence/reliability-staging`
- **Protected integration branch:** `divergence/reliability-v1`

## Exact purpose

Produce one bounded, conceptual Foundation Contract and Interface Skeleton that gives later separate designers of S02, S03, S18, and S20 the same terminology, ownership, authority, evidence, conflict, dependency, and I01–I20 interface rules without designing those systems for them.

## Required outputs

1. One compact F0 contract package under `docs/reliability/f0/` containing every deliverable in task-source §10.
2. Four separately usable bounded follow-on briefs for S02, S03, S18, and S20.
3. An accurate FCIS-G01–G06 assessment with retained design evidence and limitations.
4. Updated continuity, decision, evidence, task-index, gate, handoff, manifest, course-policy, and integrity records.
5. Exact changed-path review, integrity and structural checks, repository checks applicable to design-only changes, a commit on staging, and the exact course-control gate.

## Allowed work

- Define conceptual terminology, envelopes, unique field ownership, authority, evidence and gate semantics, conflict/change state, the four dependency types, circular seams, and I01–I20 skeletons.
- Record Q-U01, Q-U02, and Q-U06 as Open with their blocked scope.
- Write bounded standalone briefs for the four later packages without executing them.
- Define F1 reconciliation entry, comparison, decision/dissent, exit, Open, and Failed rules without performing reconciliation.
- Update only F0 package and control/continuity paths allowed by `COURSE-CONTROL.json`.
- Commit and push the accepted F0 checkpoint to the existing staging branch.

## Prohibited work

- Do not fully design S02, S03, S18, or S20.
- Do not perform the independent F0 audit or F1 reconciliation.
- Do not select technology, vendor, database, framework, deployment, code structure, prompt, or implementation slice.
- Do not create or change application code, tests, UI, layout, or visual baselines.
- Do not resolve user-owned questions, claim product approval, or claim independent verification.
- Do not create, rename, merge, rebase, force-update, deploy, or delete a branch; do not touch the safety branch.
- Do not fix parked application E2E item P-002.

## Inputs and authority

The standalone F0 handoff is the complete task packet. The canonical blueprint supplies upstream planning definitions where needed but does not authorize expansion. Latest direct user authority controls value-bearing decisions; evidence resolves evidence-answerable facts; proposals remain proposals; no author or system may independently verify or approve its own load-bearing claim.

## Gate plan

- **FCIS-G01–G06:** May reach Self-check passed only with the exact retained design evidence named in the standalone task. Independent verification remains Open for a later separately authorized audit.
- **RCG-01:** Report existing entry/control integrity and this session's read receipt.
- **RCG-02:** Confirm exact staging branch, task base, and unchanged protected boundaries.
- **RCG-03:** Confirm only F0/control paths changed and all extra work stayed parked.
- **RCG-04:** Preserve the existing independently verified cold-start result; F0-specific resume clarity is only self-checked until another reviewer audits it.

## Work history

- 2026-09-08: User explicitly activated F0.
- 2026-09-08: Fresh checkout at remote staging head `9323ed157c6739a76a24e8b6a09c11f2f136ca18`; working tree clean; mandatory controls and complete standalone assignment read; integrity manifest passed; preflight recorded as CL-0021.
- 2026-09-08: Produced the F0.1 foundation contract and four standalone follow-on briefs. Structural checks found 15/15 owned shared concepts, I01–I20 complete and unique, 16/16 dependencies with one valid type, RP-01–RP-06 present, and every brief section present. FCIS-G01–G06 are Self-check passed; independent audit remains Open.
- 2026-09-08: Unchanged application checks: unit 911/911 and desktop 1/1 passed; lint and build exited 0 with retained warnings. Browser E2E attempted and remained unavailable/Failed because the Chromium executable is not installed: 43 failed at launch and 2 skipped. No app or test file was changed.

## Blockers and unresolved decisions

- No blocker prevents the bounded F0 design.
- Q-U01, Q-U02, and Q-U06 remain Open and must not be decided by F0.
- Independent verification and user/product approval remain Open.
- P-002 remains an out-of-scope application CI issue.

## Stop condition

Stop after the F0 design package, accurate self-check evidence, control records, required checks, and staging commit are complete. Do not begin the independent audit, any follow-on system package, F1, or application implementation.

**Reached:** The design and local verification portions are complete. Stop after final integrity refresh, commit, exact course-control validation, and authorized publication/readback.

## Exact next task after completion

**Independent F0 audit**, but only after separate explicit user authorization. The audit must evaluate the committed F0 package against FCIS-G01–G06 and the task-source failure conditions, retain defects and dissent, and must not start S02, S03, S18, S20, F1, or implementation.
