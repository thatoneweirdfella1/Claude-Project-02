# Current Task — G0 Only

## Task identity

- **ID:** G0
- **Title:** AI Course-Control Gate
- **Phase:** Execution control
- **Status:** Open; implementation self-check passed, GitHub non-bypass rules and cold-start trial unresolved
- **Untouched safety/layout branch:** `claude/remaining-second-pass-v1`
- **Only task-writing branch:** `divergence/reliability-staging`
- **Protected integration branch:** `divergence/reliability-v1`
- **Repository mutation:** Authorized only on the working branch and only for G0/control records

## Exact purpose

Install a fail-closed repository controller that rejects AI work performed on the wrong branch, outside the one active task, outside its allowed files, without required continuity/evidence records, with rewritten history, with invalid hashes, or with unsupported completion claims.

## Required deliverables

1. Machine-readable one-task policy: `docs/ai-control/COURSE-CONTROL.json`.
2. Executable validator: `scripts/ai-course-control.mjs`.
3. Automated validator tests: `scripts/ai-course-control.test.mjs`.
4. GitHub Actions check: `.github/workflows/ai-course-control.yml`.
5. Code-owner boundary for controller files: `.github/CODEOWNERS`.
6. Exact one-time non-bypass GitHub configuration: `docs/ai-control/GITHUB-RULESET-REQUIRED.md`.
7. Plain-language gate state: `docs/ai-control/GATE-STATUS.md`.
8. Updated task, decision, evidence, integrity, continuity, and handoff records.

## Required rejection tests

The retained test evidence must show rejection of:

- the wrong repository or branch;
- a new or protected branch;
- an out-of-scope application file;
- deletion of any tracked file;
- alteration of an immutable visual baseline;
- rewriting or truncating the append-only ledger;
- omission of required continuity records;
- an invalid checksum;
- an invalid gate status;
- a self-declared independent pass without a separate review artifact; and
- activation of a locked task.

## Allowed work

- Add or modify only the paths allowed by the G0 profile in `COURSE-CONTROL.json`.
- Run local unit, integration, and deliberately failing rejection tests.
- Install and verify the GitHub workflow on both the reusable staging and protected integration branches.
- Update the required durable records.

## Prohibited work

- Do not execute F0.
- Do not modify application code or the visual baseline.
- Do not create, rename, merge, rebase, force-update, deploy, or delete any branch.
- Do not touch `claude/remaining-second-pass-v1`.
- Do not mark external GitHub enforcement or cold-start continuity independently verified without actual evidence.
- Do not unlock the next task without explicit user approval.

## Exit requirements

G0 may stop with a self-check only after all deliverables exist, positive tests pass, every required rejection case is observed failing for the intended reason, repository readback succeeds, and the safety branch is verified unchanged.

F0 remains blocked until:

1. a separate AI completes a cold-start continuity trial from repository files alone;
2. GitHub non-bypass rules are enabled, or the user explicitly accepts procedural-only enforcement; and
3. the user explicitly approves the transition to F0.

## Exact next action

Enable the GitHub rulesets in `GITHUB-RULESET-REQUIRED.md`, then have a separate AI perform the cold-start repository-only continuity trial. Do not execute F0.
