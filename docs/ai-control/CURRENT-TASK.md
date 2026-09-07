# Current Task — B0 Only

## Task identity

- **ID:** B0
- **Title:** Canonical Master Blueprint Installation
- **Phase:** Execution-control documentation
- **Status:** Self-check passed; installation complete; stop condition reached
- **Task source:** User instruction plus attached `02-MASTER-SYSTEM-AND-REQUIREMENT-BLUEPRINT.md`
- **Task-source SHA-256:** `d9783aa4fff475810170f2217ea2cdca1b30baefe78d21d837980943c509ea47`
- **Untouched safety/layout branch:** `claude/remaining-second-pass-v1`
- **Only task-writing branch:** `divergence/reliability-staging`
- **Protected integration branch:** `divergence/reliability-v1`
- **Repository mutation:** Authorized only on the staging branch and only for the B0 blueprint/control-record paths in `COURSE-CONTROL.json`

## Exact purpose

Install the supplied blueprint at repository root as the canonical master system-and-requirement blueprint without redesigning, shortening, or otherwise changing its content. Update the repository controls so a context-free AI can identify the installed authority, the completed bounded task, the unchanged locks, and the exact next unfinished task.

## Required deliverables

1. Exact canonical file: `02-MASTER-SYSTEM-AND-REQUIREMENT-BLUEPRINT.md`.
2. Byte-for-byte and SHA-256 equality evidence against the supplied attachment.
3. Updated control manifest and course-control policy naming B0 and allowing only its bounded files.
4. Updated project authority, current task, task index, decision log, continuity ledger, evidence index, handoff, and integrity hashes.
5. Exact diff review, required repository checks, and a commit on `divergence/reliability-staging`.

## Allowed work

- Install the attached blueprint under its exact filename at repository root.
- Update only B0's explicitly allowed control and continuity paths.
- Run file-integrity, policy, course-control, repository, and non-mutating verification checks.
- Commit and push the accepted checkpoint to the existing staging branch.

## Prohibited work

- Do not redesign, shorten, rewrite, or silently correct the blueprint.
- Do not execute or activate F0.
- Do not implement any application or reliability system.
- Do not modify application code, the interface, layout, or visual baseline.
- Do not create, rename, merge, rebase, force-update, deploy, or delete any branch.
- Do not touch `claude/remaining-second-pass-v1`.
- Do not claim independent verification for this self-checked installation.

## Acceptance evidence

- Source and installed blueprint compare byte-for-byte equal.
- Both files have SHA-256 `d9783aa4fff475810170f2217ea2cdca1b30baefe78d21d837980943c509ea47`.
- `sha256sum -c docs/ai-control/SHA256SUMS` passes.
- The course-controller test suite passes.
- The exact-base/exact-head course-control validator accepts the committed checkpoint.
- Repository checks applicable to this documentation-only change pass or are reported exactly; source-preserved blueprint formatting is not altered merely to satisfy a formatter.
- The committed diff contains only B0-allowed paths and no application, interface, layout, visual-baseline, branch, merge, or deployment change. Control-record whitespace checks pass; any whole-diff warning caused solely by exact attachment bytes is retained and documented.

## Status meaning

The file is the canonical master planning/control blueprint in this repository. Its text remains exactly as supplied, including its internal status and limitations. Installation is not an independent audit, F0 execution, implementation, or proof that any product system works.

## Stop condition

Stop after the B0 commit and required checks are complete. Do not continue into F0 or any application system.

## Exact next unfinished task

**F0 — Foundation Contract and Interface Skeleton**, using `DIVERGENCE-F0-STANDALONE-HANDOFF.md`. F0 remains locked and may not begin until the user gives a separate explicit instruction to activate it. No branch creation, merge, deployment, or application implementation is part of that next-task identification.
